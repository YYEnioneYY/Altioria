export async function logoutAdmin(): Promise<void> {
  let response: Response;

  try {
    response = await fetch('/api/admin/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    throw new Error('Не удалось подключиться к серверу');
  }

  if (!response.ok && response.status !== 401) {
    throw new Error('Не удалось завершить сессию');
  }
}