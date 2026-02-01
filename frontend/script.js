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
let currentFilter = "all";
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

function setFilter(type) {
  currentFilter = type;
  loadTransactions();
}

// ---------------- LOGIN ----------------
async function login() {
  const accountNumber = document.getElementById("lacc").value;
  const pin = document.getElementById("lpin").value;

  const res = await fetch(`${API}/accounts/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ accountNumber, pin })
  });

  const data = await res.json();

  // ✅ ONLY redirect if backend returns success
  if (res.ok && data.accountNumber) {

    localStorage.setItem("accNo", data.accountNumber);
    localStorage.setItem("name", data.name);

    window.location.href = "dashboard.html";

  } else {
    document.getElementById("loginMsg").innerText = "❌ Invalid account number or PIN";
  }
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

  if (!amount || amount <= 0) {
    showToast("Enter valid amount", "error");
    setLoading(button, false);
    return;
  }

  try {
    const res = await fetch(`${API}/accounts/deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNumber: currentAccNo,
        amount
      })
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success");
      document.getElementById("depAmt").value = "";
      loadBalance();
      loadTransactions();
    } else {
      showToast(data.message || "Deposit failed", "error");
    }

  } catch (error) {
    showToast("Server error. Try again.", "error");
  }

  setLoading(button, false);
}


// ---------------- WITHDRAW ----------------
async function withdraw(event) {
  if (!currentAccNo) {
    showToast("Login first!", "error");
    return;
  }

  const button = event.target;
  setLoading(button, true);

  const amount = document.getElementById("withAmt").value;

  if (!amount || amount <= 0) {
    showToast("Enter valid amount", "error");
    setLoading(button, false);
    return;
  }

  try {
    const res = await fetch(`${API}/accounts/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountNumber: currentAccNo,
        amount
      })
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success");
      document.getElementById("withAmt").value = "";
      loadBalance();
      loadTransactions();
    } else {
      showToast(data.message || "Withdraw failed", "error");
    }

  } catch (error) {
    showToast("Server error. Try again.", "error");
  }

  setLoading(button, false);
}


// ---------------- TRANSFER ----------------
async function transfer(event) {
  if (!currentAccNo) {
    showToast("Login first!", "error");
    return;
  }

  const button = event.target;
  setLoading(button, true);

  const toAccount = document.getElementById("toAcc").value;
  const amount = document.getElementById("trAmt").value;

  if (!toAccount || !amount || amount <= 0) {
    showToast("Enter valid details", "error");
    setLoading(button, false);
    return;
  }

  try {
    const res = await fetch(`${API}/accounts/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromAccount: currentAccNo,
        toAccount,
        amount
      })
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message, "success");
      document.getElementById("toAcc").value = "";
      document.getElementById("trAmt").value = "";
      loadBalance();
      loadTransactions();
    } else {
      showToast(data.message || "Transfer failed", "error");
    }

  } catch (error) {
    showToast("Server error. Try again.", "error");
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

  let type = "transfer";
  let icon = "🔁";

  if (txn.includes("Deposited")) {
    type = "deposit";
    icon = "💰";
  } else if (txn.includes("Withdrew")) {
    type = "withdraw";
    icon = "💸";
  }

  // FILTER LOGIC
  if (currentFilter !== "all" && currentFilter !== type) return;

  const card = document.createElement("div");
  card.className = "txnCard";

  card.innerHTML = `
    <div class="txnLeft">
      <div class="txnIcon">${icon}</div>
      <div class="txnAmount ${type}">${txn}</div>
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
