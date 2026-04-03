export function checkBasicAuth(headers: Record<string, string | undefined>): boolean {
  const authHeader = headers['authorization'] || headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }
  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const expected = process.env.BASIC_AUTH_CREDENTIALS || '';
  return decoded === expected;
}

export function unauthorizedResponse() {
  return {
    statusCode: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="VitalGuide API"',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ error: 'Unauthorized' }),
  };
}
