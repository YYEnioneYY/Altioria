export interface AdminLoginCredentials {
  username: string;
  password: string;
}

export interface AdminLoginResult {
  admin: {
    id: string;
    username: string;
    createdAt: string;
  };
}

export async function loginAdmin(
  credentials: AdminLoginCredentials,
): Promise<AdminLoginResult> {
  let response: Response;

  try {
    response = await fetch('/api/admin/auth/login', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      credentials: 'include',

      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error('Не удалось подключиться к серверу');
  }

  if (response.status === 401) {
    throw new Error('Неверное имя пользователя или пароль');
  }

  if (!response.ok) {
    throw new Error('Не удалось выполнить вход');
  }

  return response.json() as Promise<AdminLoginResult>;
}