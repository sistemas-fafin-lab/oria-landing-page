import { NextRequest, NextResponse } from 'next/server';
import { supabase, normalizePhone, type User, type Patient } from '@/lib/supabase';
import { hashPassword, generateToken } from '@/lib/auth';
import { randomUUID } from 'crypto';

interface SignupRequest {
  phone: string;
  nome: string;
  cpf: string;
  nascimento: string;
  sexo: string;
  senha: string;
}

interface SignupResponse {
  ok: boolean;
  error?: string;
  user?: {
    userId: string;
    patientId: string;
    whatsappId: string;
    token?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const { phone, nome, cpf, nascimento, sexo, senha } = body;

    // Validate required fields
    if (!phone || !nome || !cpf || !nascimento || !sexo || !senha) {
      return NextResponse.json<SignupResponse>(
        { ok: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const whatsappId = normalizePhone(phone);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('whatsapp_id', whatsappId)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json<SignupResponse>(
        { ok: false, error: 'Já existe uma conta com este número de telefone' },
        { status: 409 }
      );
    }

    // Hash password
    const senhaHash = await hashPassword(senha);

    // Generate IDs
    const userId = randomUUID();
    const patientId = randomUUID();
    const now = new Date().toISOString();

    // Parse date of birth
    const [day, month, year] = nascimento.split('/');
    const dataNascimentoISO = `${year}-${month}-${day}`;

    // Map UI labels to DB constraint values
    const sexoMap: Record<string, string> = {
      'Feminino': 'mulher',
      'Masculino': 'homem',
      'Outro': 'outro',
      'Prefiro não informar': 'Não disponível',
    };
    const sexoDB = sexoMap[sexo] ?? 'Não disponível';

    // Manual transaction (Supabase JS has no native multi-table tx).
    // Order: users → user_credentials → patients, with rollback on failure.

    // 1. Create account in `users`
    const { error: userError } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        whatsapp_id: whatsappId,
        nome_completo: nome,
        created_at: now,
        last_seen: now,
      });

    if (userError) {
      console.error('[Signup] Error creating user:', userError);
      return NextResponse.json<SignupResponse>(
        { ok: false, error: 'Erro ao criar conta do usuário' },
        { status: 500 }
      );
    }

    // 2. Store password hash in isolated `user_credentials` table.
    const { error: pwError } = await supabase
      .from('user_credentials')
      .insert({
        user_id: userId,
        password_hash: senhaHash,
        created_at: now,
        updated_at: now,
      });

    if (pwError) {
      console.error('[Signup] Error storing credentials:', pwError);
      await supabase.from('users').delete().eq('user_id', userId);
      return NextResponse.json<SignupResponse>(
        { ok: false, error: 'Erro ao registrar credenciais de acesso' },
        { status: 500 }
      );
    }

    // 3. Create patient (clinical) record
    const { error: patientError } = await supabase
      .from('patients')
      .insert({
        patient_id: patientId,
        user_id: userId,
        nome_completo: nome,
        data_nascimento: dataNascimentoISO,
        sexo: sexoDB,
        cpf: cpf,
        created_at: now,
        updated_at: now,
      });

    if (patientError) {
      console.error('[Signup] Error creating patient:', patientError);
      await supabase.from('user_credentials').delete().eq('user_id', userId);
      await supabase.from('users').delete().eq('user_id', userId);
      return NextResponse.json<SignupResponse>(
        { ok: false, error: 'Erro ao criar perfil do paciente' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId,
      whatsappId,
    });

    return NextResponse.json<SignupResponse>({
      ok: true,
      user: {
        userId,
        patientId,
        whatsappId,
        token,
      },
    });
  } catch (error) {
    console.error('[Signup] Unexpected error:', error);
    return NextResponse.json<SignupResponse>(
      { ok: false, error: 'Erro interno ao criar conta' },
      { status: 500 }
    );
  }
}
