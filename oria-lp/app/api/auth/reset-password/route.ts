import { NextRequest, NextResponse } from 'next/server';
import { supabase, normalizePhone } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

interface ResetPasswordRequest {
  phone: string;
  code: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  ok: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { phone, code, newPassword } = body;

    if (!phone || !code || !newPassword) {
      return NextResponse.json<ResetPasswordResponse>(
        { ok: false, error: 'Telefone, código e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json<ResetPasswordResponse>(
        { ok: false, error: 'A senha deve ter ao menos 8 caracteres' },
        { status: 400 }
      );
    }

    const whatsappId = normalizePhone(phone);
    const now = new Date();

    // 1. Re-validate the WhatsApp token server-side (don't trust the client).
    const { data: rows, error: queryErr } = await supabase
      .from('whatsapp_auth')
      .select('id, token, expires_at')
      .eq('whatsapp_id', whatsappId)
      .gt('expires_at', now.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (queryErr) {
      console.error('[ResetPassword] Erro query token:', queryErr);
      return NextResponse.json<ResetPasswordResponse>(
        { ok: false, error: 'Erro ao validar código' },
        { status: 500 }
      );
    }

    if (!rows || rows.length === 0 || rows[0].token !== code) {
      return NextResponse.json<ResetPasswordResponse>(
        { ok: false, error: 'Código inválido ou expirado. Solicite um novo.' },
        { status: 401 }
      );
    }

    // 2. Find the user that owns this number.
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('user_id')
      .eq('whatsapp_id', whatsappId)
      .maybeSingle();

    if (userErr || !user) {
      return NextResponse.json<ResetPasswordResponse>(
        { ok: false, error: 'Conta não encontrada para este número' },
        { status: 404 }
      );
    }

    // 3. Hash and store the new password (upsert into the isolated table).
    const passwordHash = await hashPassword(newPassword);
    const nowISO = now.toISOString();

    const { error: upsertErr } = await supabase
      .from('user_credentials')
      .upsert(
        {
          user_id: user.user_id,
          password_hash: passwordHash,
          updated_at: nowISO,
        },
        { onConflict: 'user_id' }
      );

    if (upsertErr) {
      console.error('[ResetPassword] Erro ao atualizar credenciais:', upsertErr);
      return NextResponse.json<ResetPasswordResponse>(
        { ok: false, error: 'Erro ao atualizar a senha' },
        { status: 500 }
      );
    }

    // 4. Consume the token so it can't be reused.
    await supabase.from('whatsapp_auth').delete().eq('id', rows[0].id);

    return NextResponse.json<ResetPasswordResponse>({ ok: true });
  } catch (error) {
    console.error('[ResetPassword] Unexpected error:', error);
    return NextResponse.json<ResetPasswordResponse>(
      { ok: false, error: 'Erro interno ao redefinir senha' },
      { status: 500 }
    );
  }
}
