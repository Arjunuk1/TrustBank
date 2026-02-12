import { useState, useEffect } from "react";
import { getBalance, getTransactions, deposit, withdraw, transfer } from "../services/api";

function Dashboard({ onLogout }) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [userName, setUserName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const accNo = localStorage.getItem("accNo");
    const name = localStorage.getItem("name");
    
    if (!accNo || !name) {
      onLogout();
      return;
    }

    setAccountNumber(accNo);
    setUserName(name);
    
    fetchBalance(accNo);
    fetchTransactions(accNo);
    
    setTimeout(() => setDataLoaded(true), 300);
  }, [onLogout]);

  const fetchBalance = async (accNo) => {
    try {
      const bal = await getBalance(accNo);
      setBalance(bal);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const fetchTransactions = async (accNo) => {
    try {
      const txns = await getTransactions(accNo);
      setTransactions(txns);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      showMessage("⚠️ Enter valid amount", "error");
      return;
    }

    setLoading(true);
    try {
      await deposit(accountNumber, depositAmount);
      showMessage("✅ Deposit successful!", "success");
      setDepositAmount("");
      await fetchBalance(accountNumber);
      await fetchTransactions(accountNumber);
    } catch (error) {
      showMessage("❌ Deposit failed", "error");
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      showMessage("⚠️ Enter valid amount", "error");
      return;
    }

    setLoading(true);
    try {
      await withdraw(accountNumber, withdrawAmount);
      showMessage("✅ Withdrawal successful!", "success");
      setWithdrawAmount("");
      await fetchBalance(accountNumber);
      await fetchTransactions(accountNumber);
    } catch (error) {
      showMessage("❌ Withdrawal failed", "error");
    }
    setLoading(false);
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount || transferAmount <= 0) {
      showMessage("⚠️ Enter valid details", "error");
      return;
    }

    setLoading(true);
    try {
      await transfer(accountNumber, transferTo, transferAmount);
      showMessage("✅ Transfer successful!", "success");
      setTransferTo("");
      setTransferAmount("");
      await fetchBalance(accountNumber);
      await fetchTransactions(accountNumber);
    } catch (error) {
      showMessage("❌ Transfer failed", "error");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    onLogout();
  };

  const totalDeposits = transactions.filter(t => t.includes("Deposited")).length * 1000;
  const totalWithdrawals = transactions.filter(t => t.includes("Withdrew")).length * 500;

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgGlow1}></div>
      <div style={styles.bgGlow2}></div>

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarContent}>
          {/* Logo Section */}
          <div style={styles.logoSection}>
            <div style={styles.logo}>🏦</div>
            <h2 style={styles.brandName}>TrustBank</h2>
          </div>

          {/* User Info Card */}
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>👤</div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{userName}</div>
              <div style={styles.userAccount}>Acc: {accountNumber}</div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={styles.nav}>
            <button 
              style={{...styles.navButton, ...styles.navButtonActive}}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(4px)";
                e.currentTarget.querySelector('span:first-child').style.transform = "scale(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.querySelector('span:first-child').style.transform = "scale(1)";
              }}
            >
              <span style={styles.navIcon}>📊</span>
              <span>Dashboard</span>
            </button>
            <button 
              style={styles.navButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.color = "#e2e8f0";
                e.currentTarget.style.transform = "translateX(4px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                e.currentTarget.querySelector('span:first-child').style.transform = "scale(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.querySelector('span:first-child').style.transform = "scale(1)";
              }}
            >
              <span style={styles.navIcon}>📜</span>
              <span>Transactions</span>
            </button>
            <button 
              style={styles.navButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.color = "#e2e8f0";
                e.currentTarget.style.transform = "translateX(4px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                e.currentTarget.querySelector('span:first-child').style.transform = "scale(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.querySelector('span:first-child').style.transform = "scale(1)";
              }}
            >
              <span style={styles.navIcon}>📈</span>
              <span>Analytics</span>
            </button>
          </nav>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(239, 68, 68, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(239, 68, 68, 0.3)";
            }}
          >
            <span style={styles.navIcon}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Manage your banking operations</p>
          </div>
        </header>

        {/* Summary Cards Row */}
        <div style={styles.summaryGrid}>
          <div style={{...styles.summaryCard, ...styles.balanceCard, animationDelay: '0.1s'}}>
            <div style={styles.cardIcon}>💰</div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Current Balance</div>
              <div style={styles.cardValue}>₹ {balance.toFixed(2)}</div>
            </div>
            <div style={styles.cardGlow}></div>
          </div>

          <div style={{...styles.summaryCard, animationDelay: '0.2s'}}>
            <div style={{...styles.cardIcon, background: 'rgba(16, 185, 129, 0.1)'}}>📥</div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Total Deposits</div>
              <div style={{...styles.cardValue, color: '#10b981'}}>₹ {totalDeposits}</div>
            </div>
          </div>

          <div style={{...styles.summaryCard, animationDelay: '0.3s'}}>
            <div style={{...styles.cardIcon, background: 'rgba(239, 68, 68, 0.1)'}}>📤</div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Total Withdrawals</div>
              <div style={{...styles.cardValue, color: '#ef4444'}}>₹ {totalWithdrawals}</div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div style={styles.actionsSection}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsGrid}>
            {/* Deposit Card */}
            <div style={styles.actionCard}>
              <h3 style={styles.actionTitle}>💰 Deposit Money</h3>
              <input
                type="number"
                placeholder="Enter Amount (₹)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
              <button 
                onClick={handleDeposit} 
                disabled={loading}
                style={{...styles.actionButton, ...styles.successButton}}
              >
                {loading ? "Processing..." : "Deposit"}
              </button>
            </div>

            {/* Withdraw Card */}
            <div style={styles.actionCard}>
              <h3 style={styles.actionTitle}>💸 Withdraw Money</h3>
              <input
                type="number"
                placeholder="Enter Amount (₹)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
              <button 
                onClick={handleWithdraw} 
                disabled={loading}
                style={{...styles.actionButton, ...styles.dangerButton}}
              >
                {loading ? "Processing..." : "Withdraw"}
              </button>
            </div>

            {/* Transfer Card */}
            <div style={styles.actionCard}>
              <h3 style={styles.actionTitle}>🔄 Transfer Funds</h3>
              <input
                type="text"
                placeholder="Receiver Account"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
              <button 
                onClick={handleTransfer} 
                disabled={loading}
                style={{...styles.actionButton, ...styles.warningButton}}
              >
                {loading ? "Processing..." : "Transfer"}
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div style={styles.transactionsSection}>
          <div style={styles.transactionsHeader}>
            <h2 style={styles.sectionTitle}>📜 Recent Transactions</h2>
            <button 
              onClick={() => fetchTransactions(accountNumber)} 
              style={styles.refreshButton}
            >
              🔄 Refresh
            </button>
          </div>
          
          <div style={styles.transactionsList}>
            {transactions.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📭</div>
                <div style={styles.emptyText}>No transactions yet</div>
              </div>
            ) : (
              transactions.map((txn, index) => {
                let icon = "🔁";
                let color = "#f59e0b";
                let bgColor = "rgba(245, 158, 11, 0.1)";
                
                if (txn.includes("Deposited")) {
                  icon = "💰";
                  color = "#10b981";
                  bgColor = "rgba(16, 185, 129, 0.1)";
                } else if (txn.includes("Withdrew")) {
                  icon = "💸";
                  color = "#ef4444";
                  bgColor = "rgba(239, 68, 68, 0.1)";
                }

                return (
                  <div key={index} style={{...styles.transactionCard, animationDelay: `${index * 0.05}s`}}>
                    <div style={{...styles.txnIcon, background: bgColor}}>{icon}</div>
                    <div style={styles.txnDetails}>
                      <div style={{...styles.txnText, color}}>{txn}</div>
                      <div style={styles.txnTime}>{new Date().toLocaleString()}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Toast Message */}
      {message && (
        <div style={{
          ...styles.toast,
          background: message.type === "success" ? 
            "linear-gradient(135deg, #10b981 0%, #059669 100%)" : 
            "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
        }}>
          {message.text}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0f1419 100%)",
    position: "relative",
    overflow: "hidden",
  },
  bgGlow1: {
    position: "absolute",
    top: "-10%",
    right: "20%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
    animation: "pulse 8s ease-in-out infinite alternate",
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    bottom: "-10%",
    left: "30%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
    animation: "pulse 8s ease-in-out infinite alternate-reverse",
    pointerEvents: "none",
  },
  sidebar: {
    width: "290px",
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "4px 0 24px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 10,
    animation: "slideInLeft 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  sidebarContent: {
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "36px",
    paddingBottom: "24px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  },
  logo: {
    fontSize: "52px",
    marginBottom: "14px",
    animation: "float 3s ease-in-out infinite",
    filter: "drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))",
  },
  brandName: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#f8fafc",
    margin: 0,
    letterSpacing: "-0.5px",
    textShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px",
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    borderRadius: "14px",
    marginBottom: "32px",
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.1)",
  },
  userAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: "5px",
    letterSpacing: "-0.2px",
  },
  userAccount: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
    marginBottom: "24px",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 18px",
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    color: "#94a3b8",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    textAlign: "left",
    position: "relative",
    overflow: "hidden",
  },
  navButtonActive: {
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)",
    border: "1px solid rgba(59, 130, 246, 0.4)",
    color: "#60a5fa",
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  },
  navIcon: {
    fontSize: "20px",
    transition: "transform 0.3s",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "16px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    border: "none",
    borderRadius: "12px",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "auto",
    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.3)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  },
  mainContent: {
    flex: 1,
    padding: "40px",
    overflowY: "auto",
    position: "relative",
    zIndex: 10,
    animation: "fadeIn 0.8s ease-out",
  },
  header: {
    marginBottom: "30px",
  },
  pageTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#f8fafc",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    color: "#94a3b8",
    fontSize: "16px",
    margin: 0,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  summaryCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "24px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    animation: "slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards",
  },
  balanceCard: {
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },
  cardIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    background: "rgba(59, 130, 246, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "6px",
    fontWeight: "500",
  },
  cardValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#f8fafc",
  },
  cardGlow: {
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "100%",
    height: "100%",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(40px)",
    pointerEvents: "none",
  },
  actionsSection: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: "20px",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  actionCard: {
    padding: "24px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    animation: "slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) backwards",
  },
  actionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    marginBottom: "12px",
    fontSize: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    background: "rgba(255, 255, 255, 0.03)",
    color: "#f8fafc",
    outline: "none",
    transition: "all 0.3s",
    fontFamily: "inherit",
  },
  actionButton: {
    width: "100%",
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "none",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "inherit",
  },
  successButton: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
  },
  dangerButton: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
  },
  warningButton: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.3)",
  },
  transactionsSection: {
    marginBottom: "40px",
  },
  transactionsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  refreshButton: {
    padding: "10px 20px",
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "10px",
    color: "#3b82f6",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  transactionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  transactionCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    animation: "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards",
  },
  txnIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  txnDetails: {
    flex: 1,
  },
  txnText: {
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "4px",
  },
  txnTime: {
    fontSize: "13px",
    color: "#64748b",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptyText: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: "500",
  },
  toast: {
    position: "fixed",
    top: "30px",
    right: "30px",
    padding: "16px 24px",
    borderRadius: "12px",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
    zIndex: 1000,
    animation: "slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

// Inject animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(30px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    @keyframes slideInLeft {
      from { 
        opacity: 0;
        transform: translateX(-100%); 
      }
      to { 
        opacity: 1;
        transform: translateX(0); 
      }
    }
    @keyframes slideInRight {
      from { 
        opacity: 0;
        transform: translateX(100%); 
      }
      to { 
        opacity: 1;
        transform: translateX(0); 
      }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes pulse {
      0% { opacity: 0.3; transform: scale(1); }
      100% { opacity: 0.6; transform: scale(1.1); }
    }
  `;
  
  if (!document.head.querySelector('style[data-dashboard-animations]')) {
    styleSheet.setAttribute('data-dashboard-animations', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default Dashboard;
