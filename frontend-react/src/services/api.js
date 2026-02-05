const API_BASE = "http://localhost:8081/api";

export async function loginUser(accountNumber, pin) {
  const response = await fetch(`${API_BASE}/accounts/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accountNumber,
      pin,
    }),
  });

  if (!response.ok) {
    throw new Error("Invalid login");
  }

  return await response.json();
}
