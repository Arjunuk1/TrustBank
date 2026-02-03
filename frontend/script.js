const CONFIG = {
  API_BASE: "http://localhost:8081/api"
};

const API = CONFIG.API_BASE;


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

  const button = event?.target;
if (button) setLoading(button, true);


  if (!name || !pin) {
  document.getElementById("createMsg").innerText =
    "⚠ Please enter name and PIN";
  return;
}

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

    document.getElementById("cpin").value = "";

}

function setFilter(type, button) {
  currentFilter = type;

  // Remove active class from all buttons
  document.querySelectorAll(".filterBtn").forEach(btn => {
    btn.classList.remove("active");
  });

  // Add active class to clicked button
  if (button) {
    button.classList.add("active");
  }

  loadTransactions();
  if (button) setLoading(button, false);

}


// ---------------- LOGIN ----------------
async function login() {
  const button = event?.target;
if (button) setLoading(button, true);

  if (!accountNumber || !pin) {
  document.getElementById("loginMsg").innerText =
    "⚠ Please enter account number and PIN";
  return;
}


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
    document.getElementById("lpin").value = "";
    window.location.href = "dashboard.html";

  } else {
    document.getElementById("loginMsg").innerText = "❌ Invalid account number or PIN";
  }
  if (button) setLoading(button, false);

}

function autoClear(elementId, delay = 3000) {
  setTimeout(() => {
    const el = document.getElementById(elementId);
    if (el) el.innerText = "";
  }, delay);
}

autoClear("loginMsg");
autoClear("createMsg");


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
  updateBalanceGraph(bal);
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

let visibleCount = 0;

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

visibleCount++;


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

  document.getElementById("txnCount").innerText = visibleCount;

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

// chart logic

let balanceHistory = [];
let chart;

function updateBalanceGraph(balance) {
  balanceHistory.push(balance);

  if (chart) {
    chart.destroy();
  }

  const ctx = document.getElementById("balanceChart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: balanceHistory.map((_, i) => `T${i+1}`),
      datasets: [{
        label: "Balance",
        data: balanceHistory,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

