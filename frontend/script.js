const API = "http://localhost:8081/api";

let currentAccNo = null;
let currentName = null;

async function createAccount() {
  const name = document.getElementById("cname").value;
  const pin = document.getElementById("cpin").value;

  const res = await fetch(`${API}/accounts/create`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, pin })
  });

  const data = await res.json();
  document.getElementById("createMsg").innerText =
    `✅ Account Created: ${data.accountNumber}`;
}

async function login() {
  const accountNumber = document.getElementById("lacc").value;
  const pin = document.getElementById("lpin").value;

  const res = await fetch(`${API}/accounts/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ accountNumber, pin })
    
  });

  const data = await res.json();

  if (data.message === "Login successful") {
    currentAccNo = data.accountNumber;
    currentName = data.name;
    document.getElementById("loginMsg").innerText = "✅ Login successful";
    document.getElementById("userInfo").innerText =
      `Logged in as ${currentName} (Acc: ${currentAccNo})`;
  } else {
    document.getElementById("loginMsg").innerText = "❌ Login failed";
  }
  updateStatus();
}

async function deposit() {
  if (!currentAccNo) return alert("Login first!");

  const amount = document.getElementById("depAmt").value;

  const res = await fetch(`${API}/accounts/deposit`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ accountNumber: currentAccNo, amount })
  });

  const data = await res.json();
  alert(data.message);
  loadBalance();

}

async function withdraw() {
  if (!currentAccNo) return alert("Login first!");

  const amount = document.getElementById("withAmt").value;

  const res = await fetch(`${API}/accounts/withdraw`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ accountNumber: currentAccNo, amount })
  });

  const data = await res.json();
  alert(data.message);
  loadBalance();

}

async function transfer() {
  if (!currentAccNo) return alert("Login first!");

  const toAccount = document.getElementById("toAcc").value;
  const amount = document.getElementById("trAmt").value;

  const res = await fetch(`${API}/accounts/transfer`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ fromAccount: currentAccNo, toAccount, amount })
  });

  const data = await res.json();
  alert(data.message);
  loadBalance();

}

async function loadTransactions() {
  if (!currentAccNo) return alert("Login first!");

  const res = await fetch(`${API}/accounts/${currentAccNo}/transactions`);
  const data = await res.json();

  document.getElementById("txns").innerText = data.join("\n");
}

function updateStatus() {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");

  if (currentAccNo) {
    dot.style.background = "#22c55e";
    text.innerText = `Logged in: ${currentName} (${currentAccNo})`;
  } else {
    dot.style.background = "#ef4444";
    text.innerText = "Not logged in";
  }
}

function logout() {
  currentAccNo = null;
  currentName = null;
  document.getElementById("userInfo").innerText = "Not logged in";
  document.getElementById("loginMsg").innerText = "Logged out ✅";
  document.getElementById("txns").innerText = "No transactions loaded.";
  updateStatus();

  async function loadBalance() {
  if (!currentAccNo) return;

  const res = await fetch(`${API}/accounts/${currentAccNo}/balance`);
  const bal = await res.json();

  document.getElementById("balance").innerText = bal.toFixed(2);
}

function togglePin() {
  const pin = document.getElementById("lpin");
  pin.type = pin.type === "password" ? "text" : "password";
}


}
