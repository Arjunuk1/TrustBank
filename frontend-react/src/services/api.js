const API_BASE = "http://localhost:8081/api";

async function parseApiResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    throw new Error("Unable to read server response");
  }

  if (!response.ok) {
    const message = payload?.message || "Request failed";
    throw new Error(message);
  }

  // Backend responses are wrapped as { success, message, data }.
  if (payload && Object.prototype.hasOwnProperty.call(payload, "success")) {
    if (!payload.success) {
      throw new Error(payload.message || "Request failed");
    }
    return payload.data;
  }

  // Fallback for endpoints returning plain JSON.
  return payload;
}

// Create Account
export async function createAccount(name, pin) {
  const response = await fetch(`${API_BASE}/accounts/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pin }),
  });

  return parseApiResponse(response);
}

// Login
export async function loginUser(accountNumber, pin) {
  const response = await fetch(`${API_BASE}/accounts/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber, pin }),
  });

  return parseApiResponse(response);
}

// Deposit
export async function deposit(accountNumber, amount) {
  const response = await fetch(`${API_BASE}/accounts/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber, amount }),
  });

  return parseApiResponse(response);
}

// Withdraw
export async function withdraw(accountNumber, amount) {
  const response = await fetch(`${API_BASE}/accounts/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber, amount }),
  });

  return parseApiResponse(response);
}

// Transfer
export async function transfer(fromAccount, toAccount, amount) {
  const response = await fetch(`${API_BASE}/accounts/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromAccount, toAccount, amount }),
  });

  return parseApiResponse(response);
}

// Get Balance
export async function getBalance(accountNumber) {
  const response = await fetch(`${API_BASE}/accounts/${accountNumber}/balance`);

  return parseApiResponse(response);
}

// Get Transactions
export async function getTransactions(accountNumber) {
  const response = await fetch(`${API_BASE}/accounts/${accountNumber}/transactions`);

  return parseApiResponse(response);
}
