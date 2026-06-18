import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function normalizarTelefone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith('55')) {
    digits = '55' + digits;
  }
  return digits;
}

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { ok: false, error: 'Telefone e código são obrigatórios' },
        { status: 400 }
      );
    }

    const whatsappId = normalizarTelefone(phone);
    const now = new Date();

    const { data: rows, error: queryErr } = await supabase
      .from('whatsapp_auth')
      .select('id, whatsapp_id, token, expires_at')
      .eq('whatsapp_id', whatsappId)
      .gt('expires_at', now.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (queryErr) {
      console.error('[2FA] Erro query Supabase:', queryErr);
      return NextResponse.json(
        { ok: false, error: 'Erro ao consultar token' },
        { status: 500 }
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        ok: true,
        valido: false,
        message: 'Nenhum token ativo encontrado. Solicite um novo código.',
      });
    }

    const row = rows[0];

    if (row.token !== code) {
      return NextResponse.json({
        ok: true,
        valido: false,
        message: 'Código inválido. Verifique e tente novamente.',
      });
    }

    console.log(`[2FA] Código verificado com sucesso para ${row.whatsapp_id}`);

    return NextResponse.json({
      ok: true,
      valido: true,
      whatsapp_id: row.whatsapp_id,
    });
  } catch (error) {
    console.error('[API] verify-code error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro interno ao verificar código' },
      { status: 500 }
    );
  }
}
