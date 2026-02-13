const API = "http://localhost:8081/api";

// ============= SESSION =============
let currentAccNo = localStorage.getItem("accNo");
let currentName = localStorage.getItem("name");
let currentFilter = "all";

// ============= UTILITY FUNCTIONS =============
function setLoading(button, state) {
  if (!button) return;
  if (state) {
    button.dataset.original = button.innerText;
    button.innerText = "Processing...";
    button.disabled = true;
  } else {
    button.innerText = button.dataset.original || button.innerText.replace("Processing...", "Submit");
    button.disabled = false;
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.className = `toast show ${type}`;
  toast.innerText = message;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    return { ok: res.ok, data };
  } catch (error) {
    console.error("Fetch error:", error);
    showToast("Network error. Server might be down.", "error");
    return { ok: false, data: null };
  }
}

// ============= CREATE ACCOUNT =============
async function createAccount(event) {
  const button = event?.target;
  if (button) setLoading(button, true);

  const name = document.getElementById("cname")?.value;
  const pin = document.getElementById("cpin")?.value;
  const msgEl = document.getElementById("createMsg");

  if (!name || !pin) {
    if (msgEl) msgEl.innerText = "⚠ Please enter name and PIN";
    showToast("Please fill all fields", "error");
    if (button) setLoading(button, false);
    return;
  }

  const result = await safeFetch(`${API}/accounts/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pin })
  });

  if (result.ok && result.data) {
    if (msgEl) msgEl.innerText = `✅ Account Created: ${result.data.accountNumber}`;
    document.getElementById("cname").value = "";
    document.getElementById("cpin").value = "";
    showToast(`Account ${result.data.accountNumber} created successfully!`, "success");
  } else {
    if (msgEl) msgEl.innerText = "❌ Error creating account";
    showToast("Failed to create account", "error");
  }

  if (button) setLoading(button, false);
}

// ============= LOGIN =============
async function login(event) {
  const button = event?.target;
  if (button) setLoading(button, true);

  const accountNumber = document.getElementById("lacc")?.value;
  const pin = document.getElementById("lpin")?.value;
  const msgEl = document.getElementById("loginMsg");

  if (!accountNumber || !pin) {
    if (msgEl) msgEl.innerText = "⚠ Please enter account number and PIN";
    showToast("Please fill all fields", "error");
    if (button) setLoading(button, false);
    return;
  }

  const result = await safeFetch(`${API}/accounts/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountNumber, pin })
  });

  if (result.ok && result.data && result.data.accountNumber) {
    localStorage.setItem("accNo", result.data.accountNumber);
    localStorage.setItem("name", result.data.name);
    
    if (msgEl) msgEl.innerText = "✅ Login successful! Redirecting...";
    showToast("Login successful!", "success");
    
    // Clear PIN for security
    document.getElementById("lpin").value = "";
    
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);
  } else {
    if (msgEl) msgEl.innerText = "❌ Invalid account number or PIN";
    showToast("Login failed. Check your credentials.", "error");
  }

  if (button) setLoading(button, false);
}

// ============= LOGOUT =============
function logout() {
  localStorage.clear();
  currentAccNo = null;
  currentName = null;
  showToast("Logged out successfully", "success");
  setTimeout(() => {
    window.location.href = "login.html";
  }, 500);
}

// ============= TOGGLE PIN VISIBILITY =============
function togglePin() {
  const pin = document.getElementById("lpin");
  if (!pin) return;
  pin.type = pin.type === "password" ? "text" : "password";
}

// ============= DEPOSIT =============
async function deposit(event) {
  if (!currentAccNo) {
    showToast("Please login first!", "error");
    return;
  }

  const button = event?.target;
  if (button) setLoading(button, true);

  const amount = document.getElementById("depAmt")?.value;

  if (!amount || parseFloat(amount) <= 0) {
    showToast("Enter valid amount", "error");
    if (button) setLoading(button, false);
    return;
  }

  const result = await safeFetch(`${API}/accounts/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountNumber: currentAccNo,
      amount: amount
    })
  });

  if (result.ok) {
    showToast(result.data.message || "Deposit successful!", "success");
    document.getElementById("depAmt").value = "";
    await loadBalance();
    await loadTransactions();
  } else {
    showToast(result.data?.message || "Deposit failed", "error");
  }

  if (button) setLoading(button, false);
}

// ============= WITHDRAW =============
async function withdraw(event) {
  if (!currentAccNo) {
    showToast("Please login first!", "error");
    return;
  }

  const button = event?.target;
  if (button) setLoading(button, true);

  const amount = document.getElementById("withAmt")?.value;

  if (!amount || parseFloat(amount) <= 0) {
    showToast("Enter valid amount", "error");
    if (button) setLoading(button, false);
    return;
  }

  const result = await safeFetch(`${API}/accounts/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountNumber: currentAccNo,
      amount: amount
    })
  });

  if (result.ok) {
    showToast(result.data.message || "Withdrawal successful!", "success");
    document.getElementById("withAmt").value = "";
    await loadBalance();
    await loadTransactions();
  } else {
    showToast(result.data?.message || "Withdrawal failed", "error");
  }

  if (button) setLoading(button, false);
}

// ============= TRANSFER =============
async function transfer(event) {
  if (!currentAccNo) {
    showToast("Please login first!", "error");
    return;
  }

  const button = event?.target;
  if (button) setLoading(button, true);

  const toAccount = document.getElementById("toAcc")?.value;
  const amount = document.getElementById("trAmt")?.value;

  if (!toAccount || !amount || parseFloat(amount) <= 0) {
    showToast("Enter valid details", "error");
    if (button) setLoading(button, false);
    return;
  }

  const result = await safeFetch(`${API}/accounts/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromAccount: currentAccNo,
      toAccount: toAccount,
      amount: amount
    })
  });

  if (result.ok) {
    showToast(result.data.message || "Transfer successful!", "success");
    document.getElementById("toAcc").value = "";
    document.getElementById("trAmt").value = "";
    await loadBalance();
    await loadTransactions();
  } else {
    showToast(result.data?.message || "Transfer failed", "error");
  }

  if (button) setLoading(button, false);
}

// ============= LOAD BALANCE =============
async function loadBalance() {
  if (!currentAccNo) return;

  try {
    const res = await fetch(`${API}/accounts/${currentAccNo}/balance`);
    if (!res.ok) throw new Error("Failed to load balance");
    
    const balance = await res.json();
    const balanceEl = document.getElementById("balance");
    if (balanceEl) {
      balanceEl.innerText = parseFloat(balance).toFixed(2);
    }
    
    updateBalanceGraph(balance);
  } catch (error) {
    console.error("Error loading balance:", error);
    showToast("Failed to load balance", "error");
  }
}

// ============= LOAD TRANSACTIONS =============
async function loadTransactions() {
  if (!currentAccNo) return;

  try {
    const res = await fetch(`${API}/accounts/${currentAccNo}/transactions`);
    if (!res.ok) throw new Error("Failed to load transactions");
    
    const data = await res.json();
    const container = document.getElementById("txns");
    
    if (!container) return;
    
    container.innerHTML = "";

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; opacity:0.6;">
          📭 <br><br>
          <span style="font-size:16px; font-weight:600;">No transactions found</span>
        </div>
      `;
      const txnCountEl = document.getElementById("txnCount");
      if (txnCountEl) txnCountEl.innerText = "0";
      updateTotals(0, 0);
      return;
    }

    let visibleCount = 0;
    let totalDeposits = 0;
    let totalWithdrawals = 0;

    // First pass: Calculate totals from ALL transactions
    data.forEach(txn => {
      if (txn.includes("Deposited")) {
        const match = txn.match(/Rs\.\s*([0-9.]+)/);
        if (match) {
          totalDeposits += parseFloat(match[1]);
        }
      } else if (txn.includes("Withdrew")) {
        const match = txn.match(/Rs\.\s*([0-9.]+)/);
        if (match) {
          totalWithdrawals += parseFloat(match[1]);
        }
      }
    });

    // Second pass: Display filtered transactions
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

      // Apply filter
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

    // Update totals
    updateTotals(totalDeposits, totalWithdrawals);
  } catch (error) {
    console.error("Error loading transactions:", error);
    showToast("Failed to load transactions", "error");
  }
}

// ============= UPDATE TOTALS =============
function updateTotals(deposits, withdrawals) {
  const depositsEl = document.getElementById("totalDeposits");
  const withdrawalsEl = document.getElementById("totalWithdrawals");
  
  if (depositsEl) {
    depositsEl.innerText = deposits.toFixed(2);
  }
  
  if (withdrawalsEl) {
    withdrawalsEl.innerText = withdrawals.toFixed(2);
  }
}

// ============= FILTER TRANSACTIONS =============
function setFilter(type, button) {
  currentFilter = type;

  // Remove active class from all filter buttons
  document.querySelectorAll(".filterBtn").forEach(btn => {
    btn.classList.remove("active");
  });

  // Add active class to clicked button
  if (button) {
    button.classList.add("active");
  }

  loadTransactions();
}

// ============= BALANCE CHART =============
let balanceHistory = [];
let chart;

function updateBalanceGraph(balance) {
  balanceHistory.push(parseFloat(balance));

  // Keep only last 10 data points
  if (balanceHistory.length > 10) {
    balanceHistory = balanceHistory.slice(-10);
  }

  const chartCanvas = document.getElementById("balanceChart");
  if (!chartCanvas) return;

  // Destroy existing chart if exists
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
        }
      }
    }
  });
}

// ============= DASHBOARD INITIALIZATION =============
if (window.location.pathname.includes("dashboard.html")) {
  // Check if user is logged in
  if (!currentAccNo || !currentName) {
    showToast("Please login first!", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  } else {
    // Update user info
    const userInfoEl = document.getElementById("userInfo");
    if (userInfoEl) {
      userInfoEl.innerText = currentName;
    }
    
    const accNumberEl = document.getElementById("accNumber");
    if (accNumberEl) {
      accNumberEl.innerText = currentAccNo;
    }

    // Load initial data
    loadBalance();
    loadTransactions();
    
    // Add mouse tracking for confidence cards glow effect
    document.querySelectorAll('.confidence-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--x', `${x}%`);
        card.style.setProperty('--y', `${y}%`);
      });
    });
  }
}

// ============= HOME PAGE INITIALIZATION =============
if (window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/")) {
  // Update status indicator if user is logged in
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const userInfoEl = document.getElementById("userInfo");

  if (currentAccNo && currentName) {
    if (statusDot) statusDot.classList.add("online");
    if (statusText) statusText.innerText = `Logged in as ${currentName}`;
    if (userInfoEl) userInfoEl.innerText = `${currentName} (Acc: ${currentAccNo})`;
    
    // Load data if on home page
    loadBalance();
    loadTransactions();
  } else {
    if (statusText) statusText.innerText = "Not logged in";
    if (userInfoEl) userInfoEl.innerText = "Not logged in";
  }
}

