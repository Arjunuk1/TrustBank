const API_BASE = "http://localhost:8081/api";

// Create Account
export async function createAccount(name, pin) {
  const response = await fetch(`${API_BASE}/accounts/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pin }),
  });

  if (!response.ok) throw new Error("Failed to create account");
  return await response.json();
}

// Login
export async function loginUser(accountNumber, pin) {
  const response = await fetch(`${API_BASE}/accounts/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber, pin }),
  });

  if (!response.ok) throw new Error("Invalid login");
  return await response.json();
}

// Deposit
export async function deposit(accountNumber, amount) {
  const response = await fetch(`${API_BASE}/accounts/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber, amount }),
  });

  if (!response.ok) throw new Error("Deposit failed");
  return await response.json();
}

// Withdraw
export async function withdraw(accountNumber, amount) {
  const response = await fetch(`${API_BASE}/accounts/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber, amount }),
  });

  if (!response.ok) throw new Error("Withdrawal failed");
  return await response.json();
}

// Transfer
export async function transfer(fromAccount, toAccount, amount) {
  const response = await fetch(`${API_BASE}/accounts/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromAccount, toAccount, amount }),
  });

  if (!response.ok) throw new Error("Transfer failed");
  return await response.json();
}

// Get Balance
export async function getBalance(accountNumber) {
  const response = await fetch(`${API_BASE}/accounts/${accountNumber}/balance`);
  
  if (!response.ok) throw new Error("Failed to fetch balance");
  return await response.json();
}

// Get Transactions
export async function getTransactions(accountNumber) {
  const response = await fetch(`${API_BASE}/accounts/${accountNumber}/transactions`);
  
  if (!response.ok) throw new Error("Failed to fetch transactions");
  return await response.json();
}
