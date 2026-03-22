/**
 * TrustBank Main Application Script
 * 
 * Dependencies: config.js (must be loaded first)
 * 
 * This file contains all the client-side logic for the TrustBank application
 * including account management, transactions, and UI interactions.
 */

// ============= SESSION =============
let currentAccNo = localStorage.getItem("accNo");
let currentName = localStorage.getItem("name");
let currentFilter = "all";
let allTransactions = []; // Store all transactions for search/filter

// ============= SESSION TIMEOUT =============
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const WARNING_TIME = 60 * 1000; // Show warning 1 minute before timeout
let sessionTimer = null;
let warningTimer = null;

function startSessionTimer() {
  clearSessionTimer();
  
  // Set warning timer (4 minutes)
  warningTimer = setTimeout(() => {
    showSessionWarning();
  }, SESSION_TIMEOUT - WARNING_TIME);
  
  // Set logout timer (5 minutes)
  sessionTimer = setTimeout(() => {
    autoLogout();
  }, SESSION_TIMEOUT);
}

function resetSessionTimer() {
  if (currentAccNo) {
    startSessionTimer();
  }
}

function clearSessionTimer() {
  if (sessionTimer) clearTimeout(sessionTimer);
  if (warningTimer) clearTimeout(warningTimer);
  sessionTimer = null;
  warningTimer = null;
}

function showSessionWarning() {
  const warning = document.createElement('div');
  warning.id = 'sessionWarning';
  warning.className = 'session-warning';
  warning.innerHTML = `
    <div class="session-warning-content">
      <h3>⏰ Session Expiring Soon</h3>
      <p>You will be logged out in <strong>60 seconds</strong> due to inactivity.</p>
      <div style="display: flex; gap: 12px; margin-top: 16px;">
        <button class="btn success" onclick="extendSession()">Stay Logged In</button>
        <button class="btn danger" onclick="logout()">Logout Now</button>
      </div>
    </div>
  `;
  document.body.appendChild(warning);
  setTimeout(() => warning.classList.add('active'), 10);
}

function extendSession() {
  const warning = document.getElementById('sessionWarning');
  if (warning) {
    warning.classList.remove('active');
    setTimeout(() => warning.remove(), 300);
  }
  resetSessionTimer();
  showToast('Session extended successfully', 'success');
}

function autoLogout() {
  showToast('Session expired due to inactivity', 'error');
  setTimeout(() => logout(), 1500);
}

// Activity listeners to reset timer
if (typeof window !== 'undefined') {
  ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
    document.addEventListener(event, resetSessionTimer, { passive: true });
  });
}

// ============= LOADING OVERLAY =============
function showLoader() {
  let loader = document.getElementById("loadingOverlay");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loadingOverlay";
    loader.className = "loading-overlay";
    loader.innerHTML = `
      <div>
        <div class="loading-spinner">
          <div class="loading-text">🏦</div>
        </div>
        <div class="loading-message">Processing your request...</div>
      </div>
    `;
    document.body.appendChild(loader);
  }
  setTimeout(() => loader.classList.add("active"), 10);
}

function hideLoader() {
  const loader = document.getElementById("loadingOverlay");
  if (loader) {
    loader.classList.remove("active");
  }
}

// ============= UTILITY FUNCTIONS =============
function setLoading(button, state) {
  if (!button) return;
  if (state) {
    button.dataset.original = button.innerText;
    button.innerHTML = '<span class="spinner"></span>' + button.dataset.original;
    button.disabled = true;
  } else {
    button.innerText = button.dataset.original || button.innerText.replace("Processing...", "Submit");
    button.disabled = false;
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  // Clear any existing timeout
  if (toast.timeoutId) {
    clearTimeout(toast.timeoutId);
  }

  toast.className = `toast show ${type}`;
  toast.innerText = message;

  // Add entrance sound effect simulation (visual feedback)
  toast.style.transform = 'translateX(0) scale(1)';

  toast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

async function safeFetch(url, options) {
  showLoader();
  try {
    const res = await fetch(url, options);
    let responseData = null;

    try {
      responseData = await res.json();
    } catch {
      responseData = null;
    }

    hideLoader();
    
    // Handle new ApiResponse wrapper format
    if (responseData && responseData.success !== undefined) {
      return { ok: responseData.success, data: responseData.data, response: responseData };
    }

    // Fallback for old/non-wrapped format
    return { ok: res.ok, data: responseData, response: responseData };
  } catch (error) {
    console.error("Fetch error:", error);
    hideLoader();
    showToast("Network error. Server might be down.", "error");
    return { ok: false, data: null };
  }
}

// ============= INPUT VALIDATION =============
function validateInput(inputId, validationType) {
  const input = document.getElementById(inputId);
  if (!input) return true;
  
  const value = input.value;
  let isValid = true;
  let errorMessage = "";
  
  // Remove previous validation classes
  input.classList.remove('input-valid', 'input-invalid');
  
  // Remove existing error message
  const existingError = input.parentElement.querySelector('.input-error');
  if (existingError) existingError.remove();
  
  if (!value) {
    return true; // Don't show error for empty fields (let form submission handle it)
  }
  
  switch (validationType) {
    case 'name':
      if (value.length < 2) {
        isValid = false;
        errorMessage = "Name must be at least 2 characters";
      } else if (value.length > 50) {
        isValid = false;
        errorMessage = "Name must be less than 50 characters";
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        isValid = false;
        errorMessage = "Name can only contain letters and spaces";
      }
      break;
      
    case 'pin':
      if (!/^\d+$/.test(value)) {
        isValid = false;
        errorMessage = "PIN must contain only numbers";
      } else if (value.length < 4 || value.length > 6) {
        isValid = false;
        errorMessage = "PIN must be 4-6 digits";
      }
      break;
      
    case 'amount':
      const amount = parseFloat(value);
      if (isNaN(amount)) {
        isValid = false;
        errorMessage = "Please enter a valid number";
      } else if (amount <= 0) {
        isValid = false;
        errorMessage = "Amount must be greater than 0";
      } else if (amount > 1000000) {
        isValid = false;
        errorMessage = "Amount cannot exceed ₹10,00,000";
      } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        isValid = false;
        errorMessage = "Use up to 2 decimal places";
      }
      break;
      
    case 'accountNumber':
      if (!/^\d+$/.test(value)) {
        isValid = false;
        errorMessage = "Account number must contain only digits";
      } else if (value.length < 3) {
        isValid = false;
        errorMessage = "Account number too short";
      }
      break;
  }
  
  // Apply validation styling
  if (value && isValid) {
    input.classList.add('input-valid');
  } else if (value && !isValid) {
    input.classList.add('input-invalid');
    
    // Add error message
    const errorEl = document.createElement('div');
    errorEl.className = 'input-error';
    errorEl.textContent = errorMessage;
    input.parentElement.insertBefore(errorEl, input.nextSibling);
  }
  
  return isValid;
}

// Attach validation listeners
function attachValidationListeners() {
  // Name validation
  const nameInput = document.getElementById('cname');
  if (nameInput) {
    nameInput.addEventListener('input', () => validateInput('cname', 'name'));
    nameInput.addEventListener('blur', () => validateInput('cname', 'name'));
  }
  
  // PIN validation
  const pinInputs = ['cpin', 'lpin'];
  pinInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => validateInput(id, 'pin'));
      input.addEventListener('blur', () => validateInput(id, 'pin'));
    }
  });
  
  // Amount validation
  const amountInputs = ['depAmt', 'withAmt', 'trAmt'];
  amountInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => validateInput(id, 'amount'));
      input.addEventListener('blur', () => validateInput(id, 'amount'));
    }
  });
  
  // Account number validation
  const accInputs = ['lacc', 'toAcc'];
  accInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => validateInput(id, 'accountNumber'));
      input.addEventListener('blur', () => validateInput(id, 'accountNumber'));
    }
  });
}

// Call after DOM loads
setTimeout(attachValidationListeners, 100);

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
    body: JSON.stringify({ name, pin: parseInt(pin) })
  });

  if (result.ok && result.data) {
    if (msgEl) msgEl.innerText = `✅ Account Created: ${result.data.accountNumber}`;
    document.getElementById("cname").value = "";
    document.getElementById("cpin").value = "";
    showToast(`Account ${result.data.accountNumber} created successfully!`, "success");
  } else {
    const errorMsg = result.response?.message || "Error creating account";
    if (msgEl) msgEl.innerText = `❌ ${errorMsg}`;
    showToast(errorMsg, "error");
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
    body: JSON.stringify({ accountNumber: parseInt(accountNumber), pin: parseInt(pin) })
  });

  if (result.ok && result.data && result.data.accountNumber) {
    localStorage.setItem("accNo", result.data.accountNumber);
    localStorage.setItem("name", result.data.name);
    
    if (msgEl) msgEl.innerText = "✅ Login successful! Redirecting...";
    showToast("Login successful!", "success");
    
    // Start session timeout
    startSessionTimer();
    
    // Clear PIN for security
    document.getElementById("lpin").value = "";
    
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 500);
  } else {
    const errorMsg = result.response?.message || "Invalid account number or PIN";
    if (msgEl) msgEl.innerText = `❌ ${errorMsg}`;
    showToast(errorMsg, "error");
  }

  if (button) setLoading(button, false);
}

// ============= LOGOUT =============
function logout() {
  // Clear session timer
  clearSessionTimer();
  
  // Remove session warning if present
  const warning = document.getElementById('sessionWarning');
  if (warning) warning.remove();
  
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

// ============= TRANSACTION CONFIRMATION DIALOG =============
function showConfirmationDialog(type, amount, toAccount = null) {
  return new Promise((resolve) => {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.id = 'confirmationModal';
    
    const icons = {
      'deposit': '💰',
      'withdrawal': '💸',
      'transfer': '🔄'
    };
    
    const titles = {
      'deposit': 'Confirm Deposit',
      'withdrawal': 'Confirm Withdrawal',
      'transfer': 'Confirm Transfer'
    };
    
    const icon = icons[type] || '❓';
    const title = titles[type] || 'Confirm Transaction';
    
    modal.innerHTML = `
      <div class="confirmation-content">
        <div class="confirmation-header">
          <div class="confirmation-icon">${icon}</div>
          <h3>${title}</h3>
          <p>Please review the transaction details</p>
        </div>
        
        <div class="confirmation-details">
          <div class="confirmation-row">
            <span class="confirmation-label">Transaction Type</span>
            <span class="confirmation-value">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </div>
          ${toAccount ? `
          <div class="confirmation-row">
            <span class="confirmation-label">To Account</span>
            <span class="confirmation-value">${toAccount}</span>
          </div>
          ` : ''}
          <div class="confirmation-row">
            <span class="confirmation-label">Amount</span>
            <span class="confirmation-value amount">₹ ${amount}</span>
          </div>
          <div class="confirmation-row">
            <span class="confirmation-label">From Account</span>
            <span class="confirmation-value">${currentAccNo}</span>
          </div>
        </div>
        
        <div class="confirmation-actions">
          <button class="btn btn-cancel" id="btnCancel">
            ❌ Cancel
          </button>
          <button class="btn btn-confirm" id="btnConfirm">
            ✓ Confirm
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Handle confirm
    document.getElementById('btnConfirm').onclick = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(modal);
        resolve(true);
      }, 300);
    };
    
    // Handle cancel
    document.getElementById('btnCancel').onclick = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(modal);
        resolve(false);
      }, 300);
    };
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => {
          document.body.removeChild(modal);
          resolve(false);
        }, 300);
      }
    });
  });
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

  // Show confirmation dialog
  const confirmed = await showConfirmationDialog('deposit', amount);
  
  if (!confirmed) {
    showToast("Deposit cancelled", "info");
    if (button) setLoading(button, false);
    return;
  }

  const result = await safeFetch(`${API}/accounts/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountNumber: parseInt(currentAccNo),
      amount: parseFloat(amount)
    })
  });

  if (result.ok) {
    showToast(result.response?.message || "Deposit successful!", "success");
    document.getElementById("depAmt").value = "";
    await loadBalance();
    await loadTransactions();
  } else {
    showToast(result.response?.message || "Deposit failed", "error");
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

  // Show confirmation dialog
  const confirmed = await showConfirmationDialog('withdrawal', amount);
  
  if (!confirmed) {
    showToast("Withdrawal cancelled", "info");
    if (button) setLoading(button, false);
    return;
  }

  const result = await safeFetch(`${API}/accounts/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountNumber: parseInt(currentAccNo),
      amount: parseFloat(amount)
    })
  });

  if (result.ok) {
    showToast(result.response?.message || "Withdrawal successful!", "success");
    document.getElementById("withAmt").value = "";
    await loadBalance();
    await loadTransactions();
  } else {
    showToast(result.response?.message || "Withdrawal failed", "error");
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

  // Show confirmation dialog
  const confirmed = await showConfirmationDialog('transfer', amount, toAccount);
  
  if (!confirmed) {
    showToast("Transfer cancelled", "info");
    if (button) setLoading(button, false);
    return;
  }

  const result = await safeFetch(`${API}/accounts/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromAccount: parseInt(currentAccNo),
      toAccount: parseInt(toAccount),
      amount: parseFloat(amount)
    })
  });

  if (result.ok) {
    showToast(result.response?.message || "Transfer successful!", "success");
    document.getElementById("toAcc").value = "";
    document.getElementById("trAmt").value = "";
    await loadBalance();
    await loadTransactions();
  } else {
    showToast(result.response?.message || "Transfer failed", "error");
  }

  if (button) setLoading(button, false);
}

// ============= CHANGE PIN =============
async function changePin(event) {
  if (!currentAccNo) {
    showToast("Please login first!", "error");
    return;
  }

  const button = event?.target;
  if (button) setLoading(button, true);

  const currentPin = document.getElementById("currentPin")?.value;
  const newPin = document.getElementById("newPin")?.value;
  const confirmNewPin = document.getElementById("confirmNewPin")?.value;

  // Validation
  if (!currentPin || !newPin || !confirmNewPin) {
    showToast("Please fill all PIN fields", "error");
    if (button) setLoading(button, false);
    return;
  }

  if (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
    showToast("New PIN must be 4-6 digits", "error");
    if (button) setLoading(button, false);
    return;
  }

  if (newPin !== confirmNewPin) {
    showToast("New PINs do not match", "error");
    if (button) setLoading(button, false);
    return;
  }

  if (currentPin === newPin) {
    showToast("New PIN must be different from current PIN", "error");
    if (button) setLoading(button, false);
    return;
  }

  const result = await safeFetch(`${API}/accounts/change-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountNumber: parseInt(currentAccNo),
      currentPin: parseInt(currentPin),
      newPin: parseInt(newPin)
    })
  });

  if (result.ok) {
    showToast("PIN changed successfully! Please login again.", "success");
    // Clear fields
    document.getElementById("currentPin").value = "";
    document.getElementById("newPin").value = "";
    document.getElementById("confirmNewPin").value = "";
    
    // Logout after 2 seconds
    setTimeout(() => {
      logout();
    }, 2000);
  } else {
    showToast(result.response?.message || "Failed to change PIN", "error");
  }

  if (button) setLoading(button, false);
}

// ============= LOAD BALANCE =============
async function loadBalance() {
  if (!currentAccNo) return;

  try {
    const res = await fetch(`${API}/accounts/${currentAccNo}/balance`);
    if (!res.ok) throw new Error("Failed to load balance");
    
    const responseData = await res.json();
    // Handle ApiResponse wrapper
    const balance = responseData.data !== undefined ? responseData.data : responseData;
    
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
    
    const responseData = await res.json();
    // Handle ApiResponse wrapper
    const data = responseData.data !== undefined ? responseData.data : responseData;
    
    // Store all transactions
    allTransactions = data || [];
    
    // Render with current filter and search
    renderTransactions();
  } catch (error) {
    console.error("Error loading transactions:", error);
    showToast("Failed to load transactions", "error");
  }
}

// ============= RENDER TRANSACTIONS =============
function renderTransactions() {
  const container = document.getElementById("txns");
  if (!container) return;
  
  container.innerHTML = "";

  if (!allTransactions || allTransactions.length === 0) {
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

  // Get search term
  const searchEl = document.getElementById("txnSearch");
  const searchTerm = searchEl ? searchEl.value.toLowerCase().trim() : "";

  let visibleCount = 0;
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let depositCount = 0;
  let withdrawCount = 0;
  let transferCount = 0;

  // First pass: Calculate totals and counts from ALL transactions
  allTransactions.forEach(txn => {
    if (txn.includes("Deposited")) {
      depositCount++;
      const match = txn.match(/Rs\.\s*([0-9.]+)/);
      if (match) {
        totalDeposits += parseFloat(match[1]);
      }
    } else if (txn.includes("Withdrew")) {
      withdrawCount++;
      const match = txn.match(/Rs\.\s*([0-9.]+)/);
      if (match) {
        totalWithdrawals += parseFloat(match[1]);
      }
    } else {
      transferCount++;
    }
  });

  // Second pass: Display filtered transactions
  allTransactions.forEach(txn => {
    let type = "transfer";
    let icon = "🔁";

    if (txn.includes("Deposited")) {
      type = "deposit";
      icon = "💰";
    } else if (txn.includes("Withdrew")) {
      type = "withdraw";
      icon = "💸";
    }

    // Apply type filter
    if (currentFilter !== "all" && currentFilter !== type) return;

    // Apply search filter
    if (searchTerm && !txn.toLowerCase().includes(searchTerm)) return;

    visibleCount++;

    const card = document.createElement("div");
    card.className = `txnCard ${type}`;

    // Generate random recent date for demo
    const now = new Date();
    const randomHoursAgo = Math.floor(Math.random() * 72); // Random within last 3 days
    const txnDate = new Date(now - randomHoursAgo * 60 * 60 * 1000);
    
    const dateOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const formattedDate = txnDate.toLocaleDateString('en-GB', dateOptions);

    card.innerHTML = `
      <div class="txnIcon">${icon}</div>
      <div class="txnLeft">
        <div class="txnDetails">
          <div class="txnAmount">${txn}</div>
        </div>
      </div>
      <div class="txnTime">
        <span>🕒</span>
        <span>${formattedDate}</span>
      </div>
    `;
    
    // Add click handler for receipt modal
    card.style.cursor = 'pointer';
    card.onclick = () => showTransactionReceipt(txn, type, icon, formattedDate);

    container.appendChild(card);
  });

  const txnCountEl = document.getElementById("txnCount");
  if (txnCountEl) {
    txnCountEl.innerText = visibleCount;
  }

  // Update totals and counts
  updateTotals(totalDeposits, totalWithdrawals, depositCount, withdrawCount, transferCount);
  
  // Show "no results" message if search filtered everything out
  if (visibleCount === 0 && searchTerm) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; opacity:0.6;">
        🔍 <br><br>
        <span style="font-size:16px; font-weight:600;">No transactions match "${searchTerm}"</span><br>
        <span style="font-size:14px; margin-top:8px; display:block;">Try a different search term</span>
      </div>
    `;
  }
}

// ============= UPDATE TOTALS =============
function updateTotals(deposits, withdrawals, depCount = 0, withCount = 0, transCount = 0) {
  const depositsEl = document.getElementById("totalDeposits");
  const withdrawalsEl = document.getElementById("totalWithdrawals");
  
  if (depositsEl) {
    depositsEl.innerText = deposits.toFixed(2);
  }
  
  if (withdrawalsEl) {
    withdrawalsEl.innerText = withdrawals.toFixed(2);
  }
  
  // Update transaction counts
  const totalCountEl = document.getElementById("totalTransactionCount");
  const depositCountEl = document.getElementById("depositCount");
  const withdrawCountEl = document.getElementById("withdrawCount");
  const transferCountEl = document.getElementById("transferCount");
  
  if (totalCountEl) {
    totalCountEl.innerText = depCount + withCount + transCount;
  }
  
  if (depositCountEl) {
    depositCountEl.innerText = depCount;
  }
  
  if (withdrawCountEl) {
    withdrawCountEl.innerText = withCount;
  }
  
  if (transferCountEl) {
    transferCountEl.innerText = transCount;
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

  renderTransactions();
}

// ============= SEARCH TRANSACTIONS =============
function filterTransactions() {
  renderTransactions();
}

// ============= SORT TRANSACTIONS =============
function sortTransactions() {
  const sortSelect = document.getElementById('sortSelect');
  if (!sortSelect || !allTransactions) return;
  
  const sortType = sortSelect.value;
  
  // Create a copy with metadata for sorting
  const transactionsWithMeta = allTransactions.map((txn, index) => {
    let amount = 0;
    const match = txn.match(/Rs\.\s*([0-9.]+)/);
    if (match) {
      amount = parseFloat(match[1]);
    }
    
    return {
      text: txn,
      amount: amount,
      originalIndex: index
    };
  });
  
  // Sort based on selection
  switch (sortType) {
    case 'newest':
      transactionsWithMeta.reverse(); // Most recent first
      break;
    case 'oldest':
      // Keep original order (oldest first)
      break;
    case 'amount-high':
      transactionsWithMeta.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-low':
      transactionsWithMeta.sort((a, b) => a.amount - b.amount);
      break;
  }
  
  // Update allTransactions with sorted order
  allTransactions = transactionsWithMeta.map(item => item.text);
  
  // Re-render
  renderTransactions();
  
  showToast(`Sorted by ${sortSelect.options[sortSelect.selectedIndex].text}`, 'info');
}

// ============= DATE RANGE FILTER =============
function filterByDateRange() {
  const dateFrom = document.getElementById('dateFrom')?.value;
  const dateTo = document.getElementById('dateTo')?.value;
  
  if (!dateFrom && !dateTo) {
    renderTransactions(); // Show all if no dates selected
    return;
  }
  
  const fromDate = dateFrom ? new Date(dateFrom) : new Date('1900-01-01');
  const toDate = dateTo ? new Date(dateTo) : new Date('2100-12-31');
  
  // Set to end of day for 'to' date to include all transactions on that day
  toDate.setHours(23, 59, 59, 999);
  
  // Filter transactions by date range
  // Note: In production, dates would come from backend
  // For demo, we'll generate dates based on transaction index
  const filteredTransactions = allTransactions.filter((txn, index) => {
    // Generate a pseudo-date for each transaction (older = higher index)
    const now = new Date();
    const daysAgo = Math.floor(index * 7 / allTransactions.length); // Spread over ~1 week
    const txnDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    
    return txnDate >= fromDate && txnDate <= toDate;
  });
  
  // Render filtered results
  const txnList = document.getElementById('txns');
  if (!txnList) return;
  
  if (filteredTransactions.length === 0) {
    txnList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
        <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
        <p style="font-size: 16px; font-weight: 600;">No transactions found in selected date range</p>
        <p style="font-size: 14px; margin-top: 8px;">Try selecting a different date range</p>
      </div>
    `;
    showToast(`No transactions found in selected range`, 'info');
  } else {
    txnList.innerHTML = filteredTransactions.map(txn => createTransactionHTML(txn)).join('');
    showToast(`Showing ${filteredTransactions.length} transaction(s)`, 'success');
  }
}

function resetDateFilter() {
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  
  if (dateFrom) dateFrom.value = '';
  if (dateTo) dateTo.value = '';
  
  renderTransactions(); // Show all transactions
  showToast('Date filter cleared', 'info');
}

// ============= TRANSACTION RECEIPT MODAL =============
function showTransactionReceipt(txn, type, icon, dateTime) {
  // Extract amount from transaction text
  let amount = "N/A";
  const match = txn.match(/Rs\.\s*([0-9.]+)/);
  if (match) {
    amount = match[1];
  }
  
  // Generate transaction ID
  const txnId = `TXN${Date.now().toString().slice(-8)}`;
  
  // Determine status and color
  const statusMap = {
    'deposit': { status: 'Completed', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
    'withdraw': { status: 'Completed', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' },
    'transfer': { status: 'Completed', color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' }
  };
  
  const statusInfo = statusMap[type] || statusMap['transfer'];
  
  const modal = document.createElement('div');
  modal.id = 'receiptModal';
  modal.className = 'receipt-modal active';
  modal.innerHTML = `
    <div class="receipt-content">
      <div class="receipt-header">
        <h2>🧾 Transaction Receipt</h2>
        <button class="receipt-close" onclick="closeReceipt()">✕</button>
      </div>
      
      <div class="receipt-body">
        <div class="receipt-icon-large" style="background: ${statusInfo.bg};">
          <span style="font-size: 48px;">${icon}</span>
        </div>
        
        <div class="receipt-status" style="color: ${statusInfo.color};">
          ✓ ${statusInfo.status}
        </div>
        
        <div class="receipt-amount">₹ ${amount}</div>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-details">
          <div class="receipt-row">
            <span class="receipt-label">Transaction ID</span>
            <span class="receipt-value">${txnId}</span>
          </div>
          
          <div class="receipt-row">
            <span class="receipt-label">Type</span>
            <span class="receipt-value">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </div>
          
          <div class="receipt-row">
            <span class="receipt-label">Account Number</span>
            <span class="receipt-value">${currentAccNo}</span>
          </div>
          
          <div class="receipt-row">
            <span class="receipt-label">Account Holder</span>
            <span class="receipt-value">${currentName}</span>
          </div>
          
          <div class="receipt-row">
            <span class="receipt-label">Date & Time</span>
            <span class="receipt-value">${dateTime}</span>
          </div>
          
          <div class="receipt-row">
            <span class="receipt-label">Description</span>
            <span class="receipt-value">${txn}</span>
          </div>
        </div>
        
        <div class="receipt-divider"></div>
        
        <div class="receipt-footer">
          <p>🏦 TrustBank • Bank-grade Security</p>
          <p class="receipt-note">This is a digitally generated receipt</p>
        </div>
        
        <div class="receipt-actions">
          <button class="btn success" onclick="printReceipt()">🖨️ Print</button>
          <button class="btn primary" onclick="shareReceipt('${txnId}', '${amount}', '${type}')">📤 Share</button>
          <button class="btn" onclick="closeReceipt()">Close</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function closeReceipt() {
  const modal = document.getElementById('receiptModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

function printReceipt() {
  window.print();
  showToast('Opening print dialog...', 'info');
}

function shareReceipt(txnId, amount, type) {
  const shareText = `TrustBank Transaction\nID: ${txnId}\nType: ${type}\nAmount: ₹${amount}\nAccount: ${currentAccNo}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Transaction Receipt',
      text: shareText
    }).then(() => {
      showToast('Receipt shared successfully', 'success');
    }).catch(() => {
      copyToClipboard(shareText);
    });
  } else {
    copyToClipboard(shareText);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Receipt details copied to clipboard', 'success');
  }).catch(() => {
    showToast('Could not copy receipt details', 'error');
  });
}

// ============= EXPORT TRANSACTIONS TO CSV =============
function exportTransactionsCSV() {
  if (!allTransactions || allTransactions.length === 0) {
    showToast("No transactions to export", "error");
    return;
  }

  try {
    // CSV header
    const csvHeader = "Transaction Type,Description,Amount (₹),Date & Time\n";
    
    // CSV rows
    const csvRows = allTransactions.map((txn, index) => {
      let type = "Transfer";
      let amount = "";
      let description = txn;
      
      // Parse transaction type and amount
      if (txn.includes("Deposited")) {
        type = "Deposit";
        const match = txn.match(/Rs\.\s*([0-9.]+)/);
        if (match) amount = match[1];
      } else if (txn.includes("Withdrew")) {
        type = "Withdrawal";
        const match = txn.match(/Rs\.\s*([0-9.]+)/);
        if (match) amount = match[1];
      } else if (txn.includes("Transferred")) {
        type = "Transfer";
        const match = txn.match(/Rs\.\s*([0-9.]+)/);
        if (match) amount = match[1];
      }
      
      // Generate timestamp (demo - in production this would come from backend)
      const now = new Date();
      const randomHoursAgo = Math.floor(Math.random() * 72 * (index + 1) / allTransactions.length);
      const txnDate = new Date(now - randomHoursAgo * 60 * 60 * 1000);
      const timestamp = txnDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Escape commas in description
      const escapedDescription = `"${description.replace(/"/g, '""')}"`;
      
      return `${type},${escapedDescription},${amount},${timestamp}`;
    }).join("\n");
    
    // Combine header and rows
    const csvContent = csvHeader + csvRows;
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // Generate filename with account number and date
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `TrustBank_Transactions_${currentAccNo}_${dateStr}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`Exported ${allTransactions.length} transactions successfully`, "success");
  } catch (error) {
    console.error("Export error:", error);
    showToast("Failed to export transactions", "error");
  }
}

// ============= DOWNLOAD STATEMENT AS PDF =============
function downloadStatementPDF() {
  if (!allTransactions || allTransactions.length === 0) {
    showToast("No transactions to export", "error");
    return;
  }

  try {
    // Access jsPDF from window
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Primary blue
    doc.text("TrustBank Account Statement", 20, 20);
    
    // Account Info
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Account Holder: ${currentName || 'Account Holder'}`, 20, 35);
    doc.text(`Account Number: ${currentAccNo || 'N/A'}`, 20, 42);
    doc.text(`Statement Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 49);
    doc.text(`Current Balance: ₹${currentBalance || '0.00'}`, 20, 56);
    
    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 62, 190, 62);
    
    // Transaction header
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text("Transaction History", 20, 72);
    
    // Table header
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text("Type", 20, 82);
    doc.text("Description", 50, 82);
    doc.text("Amount (₹)", 155, 82);
    doc.text("Date", 180, 82);
    
    // Reset font
    doc.setFont(undefined, 'normal');
    
    // Table rows
    let yPos = 90;
    let pageNumber = 1;
    
    allTransactions.forEach((txn, index) => {
      // Add new page if needed
      if (yPos > 270) {
        doc.addPage();
        pageNumber++;
        yPos = 20;
        
        // Re-add table header on new page
        doc.setFont(undefined, 'bold');
        doc.text("Type", 20, yPos);
        doc.text("Description", 50, yPos);
        doc.text("Amount (₹)", 155, yPos);
        doc.text("Date", 180, yPos);
        doc.setFont(undefined, 'normal');
        yPos += 8;
      }
      
      // Parse transaction details
      let type = "Transfer";
      let amount = "";
      let description = txn;
      
      if (txn.includes("Deposited")) {
        type = "Deposit";
        const match = txn.match(/Rs\.\s*([0-9.]+)/);
        if (match) amount = match[1];
      } else if (txn.includes("Withdrew")) {
        type = "Withdrawal";
        const match = txn.match(/Rs\.\s*([0-9.]+)/);
        if (match) amount = match[1];
      } else if (txn.includes("Transferred")) {
        type = "Transfer";
        const match = txn.match(/Rs\.\s*([0-9.]+)/);
        if (match) amount = match[1];
      }
      
      // Generate date (demo)
      const now = new Date();
      const daysAgo = Math.floor(index * 7 / allTransactions.length);
      const txnDate = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
      const dateStr = txnDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      
      // Truncate description if too long
      if (description.length > 50) {
        description = description.substring(0, 47) + '...';
      }
      
      // Color code by type
      if (type === "Deposit") {
        doc.setTextColor(16, 185, 129); // Green
      } else if (type === "Withdrawal") {
        doc.setTextColor(239, 68, 68); // Red
      } else {
        doc.setTextColor(245, 158, 11); // Orange
      }
      
      doc.text(type, 20, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(description, 50, yPos, { maxWidth: 100 });
      doc.text(amount, 160, yPos);
      doc.text(dateStr, 182, yPos);
      
      yPos += 7;
    });
    
    // Footer on last page
    const totalPages = pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleString('en-GB')}`, 20, 285);
    doc.text(`TrustBank © 2026 | Page ${totalPages}`, 155, 285);
    
    // Save PDF
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `TrustBank_Statement_${currentAccNo}_${dateStr}.pdf`;
    doc.save(filename);
    
    showToast(`Statement downloaded successfully`, "success");
  } catch (error) {
    console.error("PDF generation error:", error);
    showToast("Failed to generate PDF. Please try again.", "error");
  }
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
  }
}

// ============= ADD RIPPLE EFFECT TO BUTTONS =============
document.addEventListener('DOMContentLoaded', () => {
  // Add simple click ripple effect - optimized for performance
  document.addEventListener('click', function(e) {
    const button = e.target.closest('.btn');
    if (!button) return;
    
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
      animation: rippleEffect 0.5s ease-out;
      z-index: 0;
    `;
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
  
  // Add CSS for ripple animation if not exists
  if (!document.getElementById('ripple-style')) {
    const style = document.createElement('style');
    style.id = 'ripple-style';
    style.textContent = `
      @keyframes rippleEffect {
        from {
          transform: scale(0);
          opacity: 1;
        }
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
});

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
    
    // Start session timer for logged-in users
    startSessionTimer();
    
    // Load data if on home page
    loadBalance();
    loadTransactions();
  } else {
    if (statusText) statusText.innerText = "Not logged in";
    if (userInfoEl) userInfoEl.innerText = "Not logged in";
  }
}

// ============= DASHBOARD PAGE INITIALIZATION =============
if (window.location.pathname.includes("dashboard.html")) {
  if (currentAccNo && currentName) {
    // Start session timer for dashboard
    startSessionTimer();
  }
}

// ============= KEYBOARD SHORTCUTS =============
document.addEventListener('keydown', (event) => {
  // Get the active element to avoid conflicts with input fields
  const activeElement = document.activeElement;
  const isInputField = activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';
  
  // Ctrl/Cmd + K: Focus search (only when not in input field)
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    const searchInput = document.getElementById('txnSearch');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
      showToast('Search focused - start typing', 'info');
    }
  }
  
  // Ctrl/Cmd + L: Logout
  if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
    event.preventDefault();
    if (currentAccNo) {
      logout();
    }
  }
  
  // Ctrl/Cmd + R: Refresh transactions (override default refresh)
  if ((event.ctrlKey || event.metaKey) && event.key === 'r' && !isInputField) {
    const txnList = document.getElementById('txns');
    if (txnList && currentAccNo) {
      event.preventDefault();
      loadTransactions();
      showToast('Transactions refreshed', 'success');
    }
  }
  
  // Ctrl/Cmd + E: Export CSV
  if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
    event.preventDefault();
    if (currentAccNo && allTransactions && allTransactions.length > 0) {
      exportTransactionsCSV();
    }
  }
  
  // Escape: Close modals/warnings
  if (event.key === 'Escape') {
    const sessionWarning = document.getElementById('sessionWarning');
    if (sessionWarning) {
      sessionWarning.classList.remove('active');
      setTimeout(() => sessionWarning.remove(), 300);
      resetSessionTimer();
    }
  }
  
  // Enter on login form: Submit
  if (event.key === 'Enter' && isInputField) {
    const loginPin = document.getElementById('lpin');
    const loginAcc = document.getElementById('lacc');
    const createPin = document.getElementById('cpin');
    const createName = document.getElementById('cname');
    
    // Login form
    if (activeElement === loginPin || activeElement === loginAcc) {
      event.preventDefault();
      const loginBtn = document.querySelector('button[onclick*="login"]');
      if (loginBtn) loginBtn.click();
    }
    
    // Create account form
    if (activeElement === createPin || activeElement === createName) {
      event.preventDefault();
      const createBtn = document.querySelector('button[onclick*="createAccount"]');
      if (createBtn) createBtn.click();
    }
  }
  
  // ? key: Show keyboard shortcuts help (when not in input)
  if (event.key === '?' && !isInputField) {
    event.preventDefault();
    showKeyboardShortcutsHelp();
  }
});

// ============= KEYBOARD SHORTCUTS HELP =============
function showKeyboardShortcutsHelp() {
  const helpModal = document.createElement('div');
  helpModal.id = 'keyboardHelp';
  helpModal.className = 'session-warning active';
  helpModal.innerHTML = `
    <div class="keyboard-help-content">
      <h3>⌨️ Keyboard Shortcuts</h3>
      <div class="shortcuts-list">
        <div class="shortcut-item">
          <kbd>Ctrl/Cmd + K</kbd>
          <span>Focus search</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl/Cmd + L</kbd>
          <span>Logout</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl/Cmd + R</kbd>
          <span>Refresh transactions</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl/Cmd + E</kbd>
          <span>Export CSV</span>
        </div>
        <div class="shortcut-item">
          <kbd>Escape</kbd>
          <span>Close modal</span>
        </div>
        <div class="shortcut-item">
          <kbd>Enter</kbd>
          <span>Submit form</span>
        </div>
        <div class="shortcut-item">
          <kbd>?</kbd>
          <span>Show this help</span>
        </div>
      </div>
      <button class="btn primary" onclick="closeKeyboardHelp()" style="margin-top: 20px;">Got it!</button>
    </div>
  `;
  document.body.appendChild(helpModal);
}

function closeKeyboardHelp() {
  const helpModal = document.getElementById('keyboardHelp');
  if (helpModal) {
    helpModal.classList.remove('active');
    setTimeout(() => helpModal.remove(), 300);
  }
}

// ============= BALANCE VISIBILITY TOGGLE =============
let balanceVisible = true;

function toggleBalanceVisibility() {
  balanceVisible = !balanceVisible;
  const balanceEl = document.getElementById('balance');
  const toggleIcon = document.getElementById('balanceToggleIcon');
  const depositsEl = document.getElementById('totalDeposits');
  const withdrawalsEl = document.getElementById('totalWithdrawals');
  
  if (balanceVisible) {
    // Show balances
    balanceEl?.classList.remove('hidden-balance');
    depositsEl?.classList.remove('hidden-balance');
    withdrawalsEl?.classList.remove('hidden-balance');
    if (toggleIcon) toggleIcon.textContent = '👁️';
    
    // Reload actual values
    loadBalance();
    showToast('Balance visible', 'info');
  } else {
    // Hide balances
    balanceEl?.classList.add('hidden-balance');
    depositsEl?.classList.add('hidden-balance');
    withdrawalsEl?.classList.add('hidden-balance');
    if (toggleIcon) toggleIcon.textContent = '🙈';
    
    showToast('Balance hidden', 'info');
  }
  
  // Save preference to localStorage
  localStorage.setItem('balanceVisible', balanceVisible);
}

// ============= THEME TOGGLE =============
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  const isLight = body.classList.toggle('light-theme');
  
  // Update icon
  if (themeIcon) {
    themeIcon.textContent = isLight ? '☀️' : '🌙';
  }
  
  // Save preference to localStorage
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  
  // Show toast
  showToast(`${isLight ? 'Light' : 'Dark'} theme activated`, 'success');
}

// Load theme preference on page load
function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme');
  const themeIcon = document.getElementById('themeIcon');
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
  } else {
    if (themeIcon) themeIcon.textContent = '🌙';
  }
}

// ============= QUICK AMOUNT BUTTONS =============
function setQuickAmount(inputId, amount) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const currentValue = parseFloat(input.value) || 0;
  const newValue = currentValue + amount;
  input.value = newValue;
  
  // Add visual feedback
  input.classList.add('amount-updated');
  setTimeout(() => input.classList.remove('amount-updated'), 300);
  
  showToast(`Added ₹${amount}`, 'success');
}

// ============= COPY ACCOUNT NUMBER =============
async function copyAccountNumber() {
  if (!currentAccNo) {
    showToast('No account number to copy', 'error');
    return;
  }
  
  try {
    // Use modern clipboard API
    await navigator.clipboard.writeText(currentAccNo);
    
    // Update icon temporarily
    const copyIcon = document.getElementById('copyIcon');
    if (copyIcon) {
      copyIcon.textContent = '✅';
      setTimeout(() => {
        copyIcon.textContent = '📋';
      }, 2000);
    }
    
    showToast(`Account number ${currentAccNo} copied!`, 'success');
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = currentAccNo;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      showToast(`Account number ${currentAccNo} copied!`, 'success');
      
      const copyIcon = document.getElementById('copyIcon');
      if (copyIcon) {
        copyIcon.textContent = '✅';
        setTimeout(() => {
          copyIcon.textContent = '📋';
        }, 2000);
      }
    } catch (e) {
      showToast('Failed to copy account number', 'error');
    }
    
    document.body.removeChild(textarea);
  }
}

// Restore balance visibility preference on page load
window.addEventListener('DOMContentLoaded', () => {
  // Restore theme preference
  loadThemePreference();
  
  // Restore balance visibility
  const savedPreference = localStorage.getItem('balanceVisible');
  if (savedPreference === 'false') {
    balanceVisible = true; // Set to true first so toggle makes it false
    toggleBalanceVisibility();
  }
});
