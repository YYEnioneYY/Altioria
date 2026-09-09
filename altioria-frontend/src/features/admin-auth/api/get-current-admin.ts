import type { AdminLoginResult } from './login-admin';

export async function getCurrentAdmin(): Promise<AdminLoginResult> {
  let response: Response;

  try {
    response = await fetch('/api/admin/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
  } catch {
    throw new Error('Не удалось подключиться к серверу');
  }

  if (!response.ok) {
    throw new Error('Сессия отсутствует или истекла');
  }

  return response.json() as Promise<AdminLoginResult>;
}