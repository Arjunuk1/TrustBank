import { useState } from "react";
import { createAccount, loginUser } from "../services/api";

function Login({ onLogin }) {
  const [accountNumber, setAccountNumber] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!accountNumber || !pin) {
      setError("⚠️ Please enter both account number and PIN");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const data = await loginUser(accountNumber, pin);

      if (data.accountNumber) {
        localStorage.setItem("accNo", data.accountNumber);
        localStorage.setItem("name", data.name);
        setSuccess("✅ Login successful! Redirecting...");
        
        setTimeout(() => {
          onLogin();
        }, 800);
      } else {
        setError("❌ Invalid account number or PIN");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err) {
      setError("❌ Invalid account number or PIN");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!name || !pin) {
      setError("⚠️ Please enter name and PIN");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const data = await createAccount(name, pin);
      setSuccess(`✅ Account Created! Your Account Number: ${data.accountNumber}`);
      setName("");
      setPin("");
      
      setTimeout(() => {
        setIsCreating(false);
        setSuccess("");
      }, 4000);
    } catch (err) {
      setError("❌ Failed to create account. Try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Background Glow */}
      <div style={styles.glowTopLeft}></div>
      <div style={styles.glowBottomRight}></div>
      
      {/* Login Card */}
      <div style={styles.card}>
        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logo}>🏦</div>
          <h1 style={styles.brandName}>TrustBank</h1>
          <p style={styles.tagline}>Secure Banking Platform</p>
        </div>

        {/* Login Form */}
        {!isCreating ? (
          <div style={styles.form}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.15)"}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPin ? "text" : "password"}
                  placeholder="PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  style={{...styles.input, paddingRight: "50px"}}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.15)"}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={styles.eyeButton}
                  disabled={loading}
                >
                  {showPin ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button 
              onClick={handleLogin} 
              style={loading ? {...styles.primaryButton, opacity: 0.7} : styles.primaryButton}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}

            {success && (
              <div style={styles.successMessage}>
                {success}
              </div>
            )}

            <div style={styles.divider}>
              <span style={styles.dividerText}>New to TrustBank?</span>
            </div>

            <button 
              onClick={() => setIsCreating(true)} 
              style={styles.secondaryButton}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.target.style.borderColor = "#3b82f6")}
              onMouseLeave={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
            >
              Create New Account
            </button>
          </div>
        ) : (
          // Create Account Form
          <div style={styles.form}>
            <h2 style={styles.formTitle}>Create Account</h2>
            
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.15)"}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPin ? "text" : "password"}
                  placeholder="Set a Secure PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  style={{...styles.input, paddingRight: "50px"}}
                  onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.15)"}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={styles.eyeButton}
                  disabled={loading}
                >
                  {showPin ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button 
              onClick={handleCreateAccount} 
              style={loading ? {...styles.primaryButton, opacity: 0.7} : styles.primaryButton}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}

            {success && (
              <div style={styles.successMessage}>
                {success}
              </div>
            )}

            <button 
              onClick={() => setIsCreating(false)} 
              style={styles.secondaryButton}
              disabled={loading}
              onMouseEnter={(e) => !loading && (e.target.style.borderColor = "#3b82f6")}
              onMouseLeave={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.2)"}
            >
              ← Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0f1419 100%)",
    position: "relative",
    overflow: "hidden",
    animation: "fadeIn 0.6s ease-out",
  },
  glowTopLeft: {
    position: "absolute",
    top: "-20%",
    left: "-10%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
    animation: "pulse 8s ease-in-out infinite alternate",
  },
  glowBottomRight: {
    position: "absolute",
    bottom: "-20%",
    right: "-10%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
    animation: "pulse 8s ease-in-out infinite alternate-reverse",
  },
  card: {
    position: "relative",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "440px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.5), 0 10px 30px rgba(0, 0, 0, 0.3)",
    animation: "slideUp 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 10,
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "40px",
  },
  logo: {
    fontSize: "64px",
    marginBottom: "16px",
    animation: "float 3s ease-in-out infinite",
  },
  brandName: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#f8fafc",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  tagline: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  inputGroup: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "16px 18px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    background: "rgba(255, 255, 255, 0.03)",
    color: "#f8fafc",
    outline: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "inherit",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "20px",
    padding: "8px",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
    fontFamily: "inherit",
  },
  secondaryButton: {
    width: "100%",
    padding: "14px",
    fontSize: "15px",
    fontWeight: "500",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "inherit",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    margin: "8px 0",
  },
  dividerText: {
    width: "100%",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
  },
  errorMessage: {
    padding: "14px 16px",
    borderRadius: "10px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
    animation: "shake 0.5s, fadeIn 0.3s",
  },
  successMessage: {
    padding: "14px 16px",
    borderRadius: "10px",
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#6ee7b7",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
    animation: "fadeIn 0.3s",
  },
};

// Inject keyframe animations
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
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes pulse {
      0% { opacity: 0.3; transform: scale(1); }
      100% { opacity: 0.6; transform: scale(1.1); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
  `;
  
  if (!document.head.querySelector('style[data-login-animations]')) {
    styleSheet.setAttribute('data-login-animations', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default Login;
