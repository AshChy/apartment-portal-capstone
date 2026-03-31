import { useState } from 'react'
import Login from './Login'
import ResidentDashboard from './ResidentDashboard'
import ApplicantDashboard from './ApplicantDashboard'
import AdminDashboard from './AdminDashboard'
import './App.css'

function App() {
  const [userRole, setUserRole] = useState(null); // null means not logged in

  const handleLogin = (role) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  // 1. If no userRole, show Login page
  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. If logged in, show the correct Dashboard
  return (
    <div className="app-wrapper">
      {/* Logout button stays at the top of all dashboards */}
      <nav className="debug-nav">
        <span>Logged in as: <strong>{userRole}</strong></span>
        <button onClick={handleLogout}>Sign Out</button>
      </nav>

      {userRole === "Resident" && <ResidentDashboard />}
      {userRole === "Applicant" && <ApplicantDashboard />}
      {userRole === "Admin" && <AdminDashboard />}
    </div>
  );
}

export default App
