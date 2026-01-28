// const API = "http://localhost:8081/api";

// let currentAccNo = null;
// let currentName = null;

const API = "http://localhost:8081/api";

let currentAccNo = localStorage.getItem("accNo");
let currentName = localStorage.getItem("name");


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
    localStorage.setItem("accNo", data.accountNumber);
    localStorage.setItem("name", data.name);

    window.location.href = "dashboard.html";
  } else {
    document.getElementById("loginMsg").innerText = "❌ Login failed";
  }
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

if (window.location.pathname.includes("dashboard.html")) {
  if (!currentAccNo) {
    window.location.href = "login.html";
  } else {
    document.getElementById("userInfo").innerText =
      `${currentName} (Acc: ${currentAccNo})`;

    loadBalance();
    loadTransactions();
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}


}
