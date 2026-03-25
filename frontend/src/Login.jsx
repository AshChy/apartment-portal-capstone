import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");

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
        <div className="input-group" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}
          />
          <input 
            type="password" 
            placeholder="Password" 
            style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}
          />
        </div>

        <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <button className="secondary-btn" onClick={() => onLogin("Resident")}>
            Login as Resident
          </button>
          <button className="secondary-btn" onClick={() => onLogin("Admin")}>
            Login as Administrator
          </button>
          <button className="secondary-btn" onClick={() => onLogin("Applicant")}>
            Login as Applicant
          </button>
        </div>
      </main>
    </div>
  )
}