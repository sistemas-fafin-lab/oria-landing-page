import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const WA_TOKEN = (process.env.WHATSAPP_API_TOKEN || '').trim();
const WA_PHONE_ID = (process.env.WHATSAPP_PHONE_ID || '').trim();
const WA_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'oria_autentication';
const WA_TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || 'pt_BR';
const WA_API_BASE = 'https://graph.facebook.com/v17.0';
const TOKEN_VALIDADE_MINUTOS = parseInt(process.env.TOKEN_VALIDADE_MINUTOS || '5', 10);

function gerarOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function normalizarTelefone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith('55')) {
    digits = '55' + digits;
  }
  return digits;
}

async function enviarTemplateWhatsApp(toNumber: string, codigo: string): Promise<string | null> {
  if (!WA_TOKEN || !WA_PHONE_ID) {
    throw new Error('WHATSAPP_API_TOKEN ou WHATSAPP_PHONE_ID não configurados');
  }

  const url = `${WA_API_BASE}/${WA_PHONE_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: toNumber,
    type: 'template',
    template: {
      name: WA_TEMPLATE_NAME,
      language: { code: WA_TEMPLATE_LANG },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: codigo }],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: codigo }],
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json() as Record<string, unknown>;

  if (!response.ok) {
    const err = data?.error as Record<string, unknown> | undefined;
    const errCode = err?.code || '';
    const errMsg = err?.message || err?.error_user_msg || JSON.stringify(data);
    const errDetails = (err?.error_data as Record<string, unknown>)?.details || '';
    throw new Error(`WhatsApp API erro (${response.status}): ${[errCode, errMsg, errDetails].filter(Boolean).join(' — ')}`);
  }

  const messages = (data?.messages as Array<{ id?: string }>) || [];
  return messages[0]?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: 'Número de telefone é obrigatório' },
        { status: 400 }
      );
    }

    const whatsappId = normalizarTelefone(phone);
    const codigo = gerarOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_VALIDADE_MINUTOS * 60000);

    const { data: existing } = await supabase
      .from('whatsapp_auth')
      .select('id')
      .eq('whatsapp_id', whatsappId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('whatsapp_auth')
        .update({
          token: codigo,
          expires_at: expiresAt.toISOString(),
          created_at: now.toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('whatsapp_auth').insert({
        whatsapp_id: whatsappId,
        token: codigo,
        expires_at: expiresAt.toISOString(),
        created_at: now.toISOString(),
      });
    }

    console.log(`[2FA] Token gerado para ${whatsappId} → ${codigo}`);

    let waMessageId: string | null = null;
    try {
      waMessageId = await enviarTemplateWhatsApp(whatsappId, codigo);
      console.log(`[2FA] WhatsApp enviado para ${whatsappId} — msg_id: ${waMessageId}`);
    } catch (waErr) {
      const msg = waErr instanceof Error ? waErr.message : String(waErr);
      console.error(`[2FA] Erro WhatsApp: ${msg}`);
      return NextResponse.json(
        { ok: false, error: 'Token gerado mas falha ao enviar WhatsApp', details: msg },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      expires_in_minutes: TOKEN_VALIDADE_MINUTOS,
      whatsapp_id: whatsappId,
      whatsapp_message_id: waMessageId,
    });
  } catch (error) {
    console.error('[API] request-code error:', error);
    return NextResponse.json(
      { ok: false, error: 'Erro interno ao solicitar código' },
      { status: 500 }
    );
  }
}
