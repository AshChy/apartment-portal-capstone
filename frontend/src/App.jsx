import { useState } from "react";
import Login from "./Login";
import ResidentDashboard from "./ResidentDashboard";
import ApplicantDashboard from "./ApplicantDashboard";
import AdminDashboard from "./AdminDashboard";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-wrapper">
      <nav className="debug-nav">
        <span>
          Logged in as: <strong>{currentUser.role}</strong> ({currentUser.name})
        </span>
        <button onClick={handleLogout}>Sign Out</button>
      </nav>

      {currentUser.role === "resident" && <ResidentDashboard currentUser={currentUser} />}
      {currentUser.role === "applicant" && <ApplicantDashboard currentUser={currentUser} />}
      {currentUser.role === "admin" && <AdminDashboard currentUser={currentUser} />}
    </div>
  );
}

export default App;