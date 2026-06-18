import { NextRequest, NextResponse } from 'next/server';
import { supabase, normalizePhone, type User } from '@/lib/supabase';
import { verifyPassword, generateToken } from '@/lib/auth';

interface LoginRequest {
  phone: string;
  password: string;
}

interface LoginResponse {
  ok: boolean;
  error?: string;
  user?: {
    userId: string;
    whatsappId: string;
    nome?: string;
    token: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { phone, password } = body;

    // Validate required fields
    if (!phone || !password) {
      return NextResponse.json<LoginResponse>(
        { ok: false, error: 'Telefone e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const whatsappId = normalizePhone(phone);

    // Find user by whatsapp_id
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, whatsapp_id, nome_completo')
      .eq('whatsapp_id', whatsappId)
      .maybeSingle();

    if (error || !user) {
      console.error('[Login] User not found:', error);
      return NextResponse.json<LoginResponse>(
        { ok: false, error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Fetch the password hash from the isolated credentials table
    const { data: credential } = await supabase
      .from('user_credentials')
      .select('password_hash')
      .eq('user_id', user.user_id)
      .maybeSingle();

    if (!credential?.password_hash) {
      return NextResponse.json<LoginResponse>(
        { ok: false, error: 'Conta não possui senha definida. Use o login com código.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, credential.password_hash);

    if (!isValid) {
      return NextResponse.json<LoginResponse>(
        { ok: false, error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Update last_seen
    await supabase
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('user_id', user.user_id);

    // Generate JWT token
    const token = generateToken({
      userId: user.user_id,
      whatsappId: user.whatsapp_id,
    });

    return NextResponse.json<LoginResponse>({
      ok: true,
      user: {
        userId: user.user_id,
        whatsappId: user.whatsapp_id,
        nome: user.nome_completo,
        token,
      },
    });
  } catch (error) {
    console.error('[Login] Unexpected error:', error);
    return NextResponse.json<LoginResponse>(
      { ok: false, error: 'Erro interno ao fazer login' },
      { status: 500 }
    );
  }
}
