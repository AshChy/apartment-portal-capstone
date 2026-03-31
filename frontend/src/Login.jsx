import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (role) => {
    setErrorMessage("");

    const roleMap = {
      Resident: "resident",
      Admin: "admin",
      Applicant: "applicant"
    };

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          role: roleMap[role]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Login failed");
        return;
      }

      onLogin(role);
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Unable to connect to server");
    }
  };

  return (
    <div className="portal-container login-screen">
      <header className="portal-header">
        <div className="header-content">
          <h1>NextGen Living</h1>
          <h2>Tenant Management System</h2>
          <p>Log in to your secure portal</p>
        </div>
      </header>

      <main className="info-card">
        <div
          className="input-group"
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
          />
        </div>

        {errorMessage && (
          <p style={{ color: "red", marginTop: "12px" }}>
            {errorMessage}
          </p>
        )}

        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button className="secondary-btn" onClick={() => handleLogin("Resident")}>
            Login as Resident
          </button>
          <button className="secondary-btn" onClick={() => handleLogin("Admin")}>
            Login as Administrator
          </button>
          <button className="secondary-btn" onClick={() => handleLogin("Applicant")}>
            Login as Applicant
          </button>
        </div>
      </main>
    </div>
  );
}