export function getAuthHeaders() {
  const token = process.env.NEXT_PUBLIC_JWT_SECRET_KEY;

  console.log(token);

  return {
    Authorization: `Bearer ${token}`,
  };
}
