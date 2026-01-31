const API = "http://localhost:8081/api";

function setLoading(button, state) {
  if (state) {
    button.dataset.original = button.innerText;
    button.innerText = "Processing...";
    button.disabled = true;
  } else {
    button.innerText = button.dataset.original;
    button.disabled = false;
  }
}

// ---------------- SESSION ----------------
let currentAccNo = localStorage.getItem("accNo");
let currentName = localStorage.getItem("name");

// ---------------- CREATE ACCOUNT ----------------
async function createAccount() {
  const name = document.getElementById("cname").value;
  const pin = document.getElementById("cpin").value;

  const res = await fetch(`${API}/accounts/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pin })
  });

  const data = await res.json();
  document.getElementById("createMsg").innerText =
    `✅ Account Created: ${data.accountNumber}`;
}

// ---------------- LOGIN ----------------
async function login() {
  const accountNumber = document.getElementById("lacc").value;
  const pin = document.getElementById("lpin").value;

  const res = await fetch(`${API}/accounts/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber, pin })
  });

  if (!res.ok) {
    document.getElementById("loginMsg").innerText = "❌ Login failed";
    return;
  }

  const acc = await res.json();

  localStorage.setItem("accNo", acc.accountNumber);
  localStorage.setItem("name", acc.name);

  window.location.href = "dashboard.html";
}

// ---------------- LOGOUT ----------------
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ---------------- DEPOSIT ----------------
async function deposit(event) {
  if (!currentAccNo) {
    showToast("Login first!", "error");
    return;
  }

  const button = event.target;
  setLoading(button, true);

  const amount = document.getElementById("depAmt").value;

  const res = await fetch(`${API}/accounts/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber: currentAccNo, amount })
  });

  const data = await res.json();

  if (res.ok) {
    showToast(data.message, "success");
    loadBalance();
  } else {
    showToast(data.message || "Deposit failed", "error");
  }

  setLoading(button, false);
}



// ---------------- WITHDRAW ----------------
async function withdraw() {
  if (!currentAccNo) {
    showToast("Login first!", "error");
    return;
  }

  const amount = document.getElementById("withAmt").value;

  const res = await fetch(`${API}/accounts/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber: currentAccNo, amount })
  });

  const data = await res.json();
  if (res.ok) {
    showToast(data.message, "success");
    loadBalance();
  } else {
    showToast(data.message || "Deposit failed", "error");
  }

  setLoading(button, false);
}

// ---------------- TRANSFER ----------------
async function transfer() {
  if (!currentAccNo) {
    showToast("Login first!", "error");
    return;
  }

  const toAccount = document.getElementById("toAcc").value;
  const amount = document.getElementById("trAmt").value;

  const res = await fetch(`${API}/accounts/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromAccount: currentAccNo, toAccount, amount })
  });

  const data = await res.json();
  if (res.ok) {
    showToast(data.message, "success");
    loadBalance();
  } else {
    showToast(data.message || "Deposit failed", "error");
  }

  setLoading(button, false);
}

// ---------------- BALANCE ----------------
async function loadBalance() {
  if (!currentAccNo) return;

  const res = await fetch(`${API}/accounts/${currentAccNo}/balance`);
  const bal = await res.json();

  document.getElementById("balance").innerText = bal.toFixed(2);
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.className = `toast show ${type}`;
  toast.innerText = message;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}


// ---------------- TRANSACTIONS ----------------
async function loadTransactions() {
  if (!currentAccNo) return;

  const res = await fetch(`${API}/accounts/${currentAccNo}/transactions`);
  const data = await res.json();

  const container = document.getElementById("txns");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p class='muted'>No transactions found.</p>";
    return;
  }

  data.forEach(txn => {
    let icon = "🔁";
    if (txn.includes("Deposited")) icon = "💰";
    if (txn.includes("Withdrew")) icon = "💸";

    const card = document.createElement("div");
    card.className = "txnCard";

    card.innerHTML = `
      <div class="txnLeft">
        <div class="txnIcon">${icon}</div>
        <div class="txnAmount">${txn}</div>
      </div>
      <div class="txnTime">${new Date().toLocaleString()}</div>
    `;

    container.appendChild(card);
  });
}

// ---------------- TOGGLE PIN ----------------
function togglePin() {
  const pin = document.getElementById("lpin");
  pin.type = pin.type === "password" ? "text" : "password";
}

// ---------------- DASHBOARD AUTO LOAD ----------------
if (window.location.pathname.includes("dashboard.html")) {
  if (!currentAccNo || !currentName) {
    window.location.href = "login.html";
  } else {
    document.getElementById("userInfo").innerText =
      `${currentName} (Acc: ${currentAccNo})`;

    loadBalance();
    loadTransactions();
  }
}
