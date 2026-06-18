// Client-side authentication service

export interface AuthResponse {
  ok: boolean;
  error?: string;
  user?: {
    userId: string;
    patientId?: string;
    whatsappId: string;
    nome?: string;
    token?: string;
  };
}

export interface VerifyCodeResponse {
  ok: boolean;
  valido?: boolean;
  error?: string;
  message?: string;
  whatsapp_id?: string;
}

export async function requestCode(phone: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/request-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || 'Erro ao solicitar código' };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'Erro de conexão' };
  }
}

export async function verifyCode(phone: string, code: string): Promise<VerifyCodeResponse> {
  try {
    const response = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || 'Erro ao verificar código' };
    }

    return { ok: data.ok, valido: data.valido, message: data.message };
  } catch (error) {
    return { ok: false, error: 'Erro de conexão' };
  }
}

export async function signup(params: {
  phone: string;
  nome: string;
  cpf: string;
  nascimento: string;
  sexo: string;
  senha: string;
}): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || 'Erro ao criar conta' };
    }

    return {
      ok: true,
      user: data.user,
    };
  } catch (error) {
    return { ok: false, error: 'Erro de conexão' };
  }
}

export async function login(phone: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || 'Erro ao fazer login' };
    }

    return {
      ok: true,
      user: data.user,
    };
  } catch (error) {
    return { ok: false, error: 'Erro de conexão' };
  }
}

// Session management
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('oria_auth_token', token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('oria_auth_token');
  }
  return null;
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('oria_auth_token');
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
