function Dashboard() {
  return (
    <div className="appLayout">
      <div className="sidebar">
        <h2>🏦 TrustBank</h2>
        <button>Dashboard</button>
        <button>Transactions</button>
        <button>Analytics</button>
        <button>Logout</button>
      </div>

      <div className="mainContent">
        <h1>Dashboard</h1>

        <div className="cardGrid">
          <div className="card">
            <p>Current Balance</p>
            <div className="balance">₹ 25,000</div>
          </div>

          <div className="card">
            <p>Total Deposits</p>
            <div>₹ 40,000</div>
          </div>

          <div className="card">
            <p>Total Withdrawals</p>
            <div>₹ 15,000</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
