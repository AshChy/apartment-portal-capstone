import { useEffect, useState } from "react";

/**
 * Admin Management, Announcements, Employee Creation, and Maintenance Overview
 */
export default function AdminDashboard() {
  const [announcement, setAnnouncement] = useState("");

  // New Admin Creation
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");

  // Maintenance Requests
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/maintenance-requests");
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Failed to fetch maintenance requests");
        setLoadingRequests(false);
        return;
      }

      setRequests(data);
      setLoadingRequests(false);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      setLoadingRequests(false);
    }
  };

  const handleReviewAll = () => {
    alert(
      "Reviewing Active Applications:\n" +
        "---------------------------\n" +
        "1. Sarah Williams (Suite 104) - Status: Waiting for ID\n" +
        "2. John Doe (Suite 305) - Status: Fully Approved\n" +
        "3. 6 additional files loading..."
    );
  };

  const handlePostAnnouncement = () => {
    if (!announcement.trim()) {
      alert("Error: You must type a message before posting an announcement.");
      return;
    }

    alert(`Success: Announcement posted to all Resident Portals!\n\nMessage: "${announcement}"`);
    setAnnouncement("");
  };

  const handleCreateAdmin = async () => {
    if (!newAdminName || !newAdminEmail || !newAdminPass) {
      alert("Error: Please provide name, email, and a temporary password for the new admin.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPass
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create admin account");
        return;
      }

      alert(`Success: Admin account created for ${data.user.email}.`);

      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPass("");
    } catch (error) {
      console.error("Create admin error:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div className="header-content">
          <h1>NextGen Living</h1>
          <h2>Admin Portal</h2>
          <div className="user-badge">Role: Property Manager</div>
        </div>
      </header>

      <main className="portal-main">
        <section className="info-card">
          <h3>Unit Inventory</h3>
          <div className="info-row">
            <span>Total Units:</span> <span className="amount">48</span>
          </div>
          <div className="info-row">
            <span>Vacant & Ready:</span>{" "}
            <span style={{ color: "#059669", fontWeight: "bold" }}>3</span>
          </div>
          <div className="info-row">
            <span>Pending Lease:</span>{" "}
            <span style={{ color: "var(--primary)", fontWeight: "bold" }}>5</span>
          </div>
        </section>

        <section className="info-card">
          <h3>Review Queue</h3>
          <div style={{ fontSize: "0.9rem", marginBottom: "15px" }}>
            <div
              style={{
                padding: "8px",
                background: "#f9fafb",
                marginBottom: "5px",
                borderRadius: "4px",
                borderLeft: "4px solid #f59e0b"
              }}
            >
              <strong>Sarah Williams</strong> - Suite 104 <br /> <small>Status: Waiting for ID</small>
            </div>
            <div
              style={{
                padding: "8px",
                background: "#f9fafb",
                borderRadius: "4px",
                borderLeft: "4px solid green"
              }}
            >
              <strong>John Doe</strong> - Suite 305 <br /> <small>Status: Fully Approved</small>
            </div>
          </div>
          <button className="btn pay-btn" style={{ width: "100%" }} onClick={handleReviewAll}>
            Review All Applications
          </button>
        </section>
      </main>

      <section className="info-card" style={{ marginTop: "20px" }}>
        <h3>All Maintenance Requests</h3>

        {loadingRequests ? (
          <p>Loading maintenance requests...</p>
        ) : requests.length === 0 ? (
          <p>No maintenance requests found.</p>
        ) : (
          <div className="request-list">
            {requests.map((req) => (
              <div key={req.requestId} className="request-item">
                <div>
                  <strong>{req.title}</strong> - {req.description}
                  <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
                    Resident: {req.residentName} ({req.residentEmail})
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>Unit: {req.unitNumber}</div>
                  <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "4px" }}>
                    Submitted: {req.requestDate}
                  </div>
                </div>

                <span className={`status-badge ${req.status.replace(/\s+/g, "-").toLowerCase()}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="info-card">
        <h3>Employee Management</h3>
        <p style={{ fontSize: "0.8rem", color: "#666", marginBottom: "10px" }}>
          Authorized: Add a new property manager account.
        </p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="New Admin Name"
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
          />

          <input
            type="email"
            placeholder="New Admin Email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
          />

          <input
            type="password"
            placeholder="Temp Password"
            value={newAdminPass}
            onChange={(e) => setNewAdminPass(e.target.value)}
            style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
          />
        </div>

        <button className="pay-btn" style={{ width: "100%" }} onClick={handleCreateAdmin}>
          + Create New Admin Account
        </button>
      </section>

      <section className="info-card">
        <h3>Broadcast Announcements</h3>
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Enter message for all residents..."
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginBottom: "10px"
          }}
        />
        <button className="btn maintenance-btn" style={{ width: "100%" }} onClick={handlePostAnnouncement}>
          Post Announcement
        </button>
      </section>
    </div>
  );
}