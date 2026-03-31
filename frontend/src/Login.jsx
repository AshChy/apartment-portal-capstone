import { useState } from "react"; 

export default function Login({ onLogin }) { 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 
  
  /* State for Registration Popup */
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regRole, setRegRole] = useState("Applicant");

  /* Standard Login Logic for ALL users (Admin, Resident, Applicant) */
  const handleLogin = async () => { 
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }
    setErrorMessage(""); 
    
    try { 
      const response = await fetch("http://localhost:3000/api/auth/login", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email, password }) 
      }); 
      const data = await response.json(); 

    if (!response.ok) { 
      setErrorMessage(data.message || "Login failed"); 
      return; 
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    onLogin(data.user); 
    } catch (error) { 
      console.error("Login error:", error); 
      setErrorMessage("Unable to connect to server - Please try again later"); 
    } 
  }; 

  /* Task: Register and Redirect Immediately */
  const handleRegisterAndRedirect = async () => {
    if (!regName || !regEmail || !regPass) {
      alert("Please enter name, email, and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPass,
          role: regRole.toLowerCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create account");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      setIsRegistering(false);
      setRegName("");
      setRegEmail("");
      setRegPass("");
      setRegRole("Applicant");
      onLogin(data.user);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to server");
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
        <div className="input-group" style={{ display: "flex", flexDirection: "column", gap: "10px" }} > 
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} 
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }} /> 
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} 
          style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }} /> 
        </div> 

        {errorMessage && ( 
          <p style={{ color: "red", marginTop: "12px" }}> {errorMessage} </p> 
        )} 

        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}> 
          {/* SINGLE SIGN IN BUTTON (Detects role automatically) */}
          <button className="pay-btn" style={{background: 'var(--primary)', width: '100%'}} onClick={handleLogin}> 
            Sign In 
          </button> 
          
          <div style={{textAlign: 'center', margin: '10px 0', color: '#666', fontSize: '0.9rem'}}>or</div>

          {/* Create Account Button */}
          <button className="secondary-btn" style={{width: '100%', border: '1px solid #ddd'}} onClick={() => setIsRegistering(true)}>
            Create a new account?
          </button>
        </div> 
      </main> 

      {/* --- REGISTRATION POP-UP GUI --- */}
      {isRegistering && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000}}>
          <div className="info-card" style={{width: '400px', textAlign: 'center'}}>
            <h3>New User Registration</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px'}}>
              <input type="text" placeholder="Full Name" value={regName} onChange={(e) => setRegName(e.target.value)}
              style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}/>
              <input type="email" placeholder="Email Address" value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} 
              style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}/>
              <input type="password" placeholder="Create Password" value={regPass} onChange={(e)=>setRegPass(e.target.value)} 
              style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}/>
              
              <div style={{textAlign: 'left'}}>
                <label style={{fontSize: '0.8rem', color: '#666', marginBottom: '5px', display: 'block'}}>I am registering as a:</label>
                <select value={regRole} onChange={(e)=>setRegRole(e.target.value)} style={{width: '100%', padding: '12px', 
                  borderRadius: '8px', border: '1px solid #ddd', background: 'white'}}>
                  <option value="Applicant">Applicant (New Renter)</option>
                  <option value="Resident">Resident (Current Tenant)</option>
                </select>
              </div>

              <button className="pay-btn" onClick={handleRegisterAndRedirect}>Create Account & Sign In</button>
              <button className="secondary-btn" style={{background: 'none', border: 'none', color: '#666'}} 
              onClick={() => setIsRegistering(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- BYPASS BUTTONS (Kept for testing dashboards) --- */}
      <div style={{marginTop: '40px', padding: '20px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center'}}>
        <p style={{fontSize: '0.8rem', color: '#999'}}>Dev Tools: Bypass Login to View Dashboards</p>
        <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
          <button
            onClick={() =>
              onLogin({ userId: 1, name: "jaden", email: "jaden@apartment.test", role: "admin" })
            }
            style={{ fontSize: "0.7rem", padding: "5px" }}
          >
            View Admin
          </button>

          <button
            onClick={() =>
              onLogin({ userId: 2, name: "Taylor", email: "Taylor@fake.test", role: "resident" })
            }
            style={{ fontSize: "0.7rem", padding: "5px" }}
          >
            View Resident
          </button>

          <button
            onClick={() =>
              onLogin({ userId: 3, name: "John", email: "John@fake.test", role: "applicant" })
            }
            style={{ fontSize: "0.7rem", padding: "5px" }}
          >
            View Applicant
          </button>
        </div>
      </div>
    </div> 
  ); 
}