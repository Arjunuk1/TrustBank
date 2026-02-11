const API = "http://localhost:8081/api";

// Centralized API wrapper
async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (error) {
    showToast("Network error. Server might be down.", "error");
    return { ok: false, data: null };
  }
}



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

  const name = document.getElementById("cname").value;
  const pin = document.getElementById("cpin").value;

  if (!name || !pin) {
    document.getElementById("createMsg").innerText = "⚠ Please enter name and PIN";
    if (button) setLoading(button, false);
    return;
  }

  const res = await fetch(`${API}/accounts/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pin })
  });

  const data = await res.json();
  document.getElementById("createMsg").innerText = `✅ Account Created: ${data.accountNumber}`;
  document.getElementById("cname").value = "";
  document.getElementById("cpin").value = "";

  if (button) setLoading(button, false);
}

// async function safeFetch(url, options) {
//   try {
//     const res = await fetch(url, options);
//     return await res.json();
//   } catch (error) {
//     showToast("Network error. Server might be down.", "error");
//     throw error;
//   }
// }


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
async function login(event) {

  const button = event?.target;
  if (button) setLoading(button, true);

  const accountNumber = document.getElementById("lacc").value;
  const pin = document.getElementById("lpin").value;

  const result = await safeFetch(`${API}/accounts/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber, pin })
  });

  if (result.ok && result.data.accountNumber) {

    localStorage.setItem("accNo", result.data.accountNumber);
    localStorage.setItem("name", result.data.name);

    document.getElementById("lpin").value = "";   // security clear

    window.location.href = "dashboard.html";

  } else {
    document.getElementById("loginMsg").innerText =
      "❌ Invalid account number or PIN";
  }

  if (button) setLoading(button, false);
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

  const result = await safeFetch(`${API}/accounts/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountNumber: currentAccNo,
      amount
    })
  });

  if (result.ok) {
    showToast(result.data.message, "success");
    document.getElementById("depAmt").value = "";
    loadBalance();
    loadTransactions();
  } else {
    showToast(result.data?.message || "Deposit failed", "error");
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
    container.innerHTML = `
      <div style="text-align:center; padding:40px; opacity:0.6;">
        📭 <br><br>
        <span style="font-size:16px; font-weight:600;">No transactions found</span>
      </div>
    `;
    document.getElementById("txnCount")?.innerText = "0";
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
});

const txnCountEl = document.getElementById("txnCount");
if (txnCountEl) {
  txnCountEl.innerText = visibleCount;
}
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
    const userInfoEl = document.getElementById("userInfo");
    if (userInfoEl) {
      userInfoEl.innerText = `${currentName} (Acc: ${currentAccNo})`;
    }

    // Update status indicator
    const statusDot = document.getElementById("statusDot");
    const statusText = document.getElementById("statusText");
    if (statusDot) statusDot.classList.add("online");
let balanceHistory = [];
let chart;

function updateBalanceGraph(balance) {
  balanceHistory.push(balance);

  // Keep only last 10 data points
  if (balanceHistory.length > 10) {
    balanceHistory = balanceHistory.slice(-10);
  }

  const chartCanvas = document.getElementById("balanceChart");
  if (!chartCanvas) return;

  if (chart) {
    chart.destroy();
  }

  const ctx = chartCanvas.getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: balanceHistory.map((_, i) => `T${i + 1}`),
      datasets: [{
        label: "Balance (₹)",
        data: balanceHistory,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { 
          display: true,
          labels: {
            color: '#94a3b8',
            font: {
              size: 13,
              weight: 500
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#94a3b8',
            callback: function(value) {
              return '₹' + value;
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          }
        },
        x: {
          ticks: {
            color: '#94a3b8'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          }
       
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

