import { useState } from "react";

function Login() {
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");

  const handleLogin = async () => {
    console.log("Login attempt:", accountNumber, pin);
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
