import { useState } from "react";
import { loginUser } from "../services/api";

function Login() {
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const data = await loginUser(accountNumber, pin);

      // Save session
      localStorage.setItem("accNo", data.accountNumber);
      localStorage.setItem("name", data.name);

      // Redirect
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid account number or PIN");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>

      <input
        placeholder="Account Number"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleLogin} style={styles.button}>
        Login
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "300px",
    margin: "100px auto",
    gap: "10px",
  },
  input: {
    padding: "10px",
  },
  button: {
    padding: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
  },
};

export default Login;

// http://localhost:8081
