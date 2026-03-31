import { useEffect, useState } from 'react';

export default function ResidentDashboard() {
  const [tenant, setTenant] = useState({
    name: "",
    rentBalance: 0,
    rentDue: "",
    utilitiesBalance: 0,
    utilitiesDue: "",
    status: "Unpaid"
  });

  const [announcement, setAnnouncement] = useState("Loading announcement...");

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchTenantDashboard();
    fetchAnnouncements();
    fetchMaintenanceRequests();
  }, []);

  const fetchTenantDashboard = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/dashboard/tenant-dashboard");
      const data = await response.json();

      setTenant({
        name: data.tenant.name,
        rentBalance: Number(data.rentStatus.amountDue),
        rentDue: data.rentStatus.dueDate,
        utilitiesBalance: Number(data.utilities.amountDue),
        utilitiesDue: data.utilities.dueDate,
        status:
          Number(data.rentStatus.amountDue) === 0 && Number(data.utilities.amountDue) === 0
            ? "Paid"
            : "Unpaid"
      });
    } catch (error) {
      console.error("Error fetching tenant dashboard:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/dashboard/announcements");
      const data = await response.json();

      if (data.length > 0) {
        setAnnouncement(data[0].message);
      } else {
        setAnnouncement("No announcements at this time.");
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncement("Unable to load announcements.");
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/maintenance/maintenance-requests/2");
      const data = await response.json();

      const formattedRequests = data.map((req) => ({
        id: req.requestId,
        type: req.title,
        description: req.description,
        status: req.status,
        date: req.requestDate
      }));

      setRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
    }
  };

  const handlePayment = () => {
    if (window.confirm("Confirm payment of $" + (tenant.rentBalance + tenant.utilitiesBalance).toFixed(2) + "?")) {
      setTenant({
        ...tenant,
        rentBalance: 0,
        utilitiesBalance: 0,
        status: "Paid"
      });
    }
  };

  const handleNewRequest = async () => {
    const issue = prompt("What is the maintenance issue?");
    if (!issue) return;

    try {
      const response = await fetch("http://localhost:3000/api/maintenance/maintenance-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: "General",
          description: issue,
          userId: 2,
          unitId: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to submit request");
        return;
      }

      fetchMaintenanceRequests();
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      alert("Unable to connect to server");
    }
  };

  return (
    <div className="portal-container">
      {tenant.status === "Paid" && (
        <div className="success-toast">
          <span>Payment Successful! Your receipt #8829 has been generated.</span>
        </div>
      )}

      <header className="portal-header">
        <div className="header-content">
          <h1>NextGen Living</h1>
          <h2>Resident Portal</h2>
          <div className="user-badge">Welcome, {tenant.name}</div>
        </div>
      </header>

      <div className="announcement-banner">
        <strong>Announcement:</strong> {announcement}
      </div>

      <main className="portal-main">
        <section className="info-card">
          <h3>Rent Status</h3>
          <div className="info-row">
            <span>Balance:</span>
            <span className="amount" style={{ color: tenant.rentBalance === 0 ? "#059669" : "#ef4444" }}>
              ${tenant.rentBalance.toFixed(2)}
            </span>
          </div>
          <p>Due: {tenant.rentDue}</p>
        </section>

        <section className="info-card">
          <h3>Utilities</h3>
          <div className="info-row">
            <span>Water & Electric:</span>
            <span className="amount" style={{ color: tenant.utilitiesBalance === 0 ? "#059669" : "#ef4444" }}>
              ${tenant.utilitiesBalance.toFixed(2)}
            </span>
          </div>
          <p>Due: {tenant.utilitiesDue}</p>
          <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Includes March usage</p>
        </section>
      </main>

      <div className="payment-action-area">
        <button className="pay-btn" onClick={handlePayment} disabled={tenant.status === "Paid"}>
          {tenant.status === "Paid" ? "Paid ✓" : "Pay Now"}
        </button>
      </div>

      <section className="info-card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Maintenance Requests</h3>
          <button className="secondary-btn" onClick={handleNewRequest}>+ New Request</button>
        </div>

        <div className="request-list">
          {requests.map(req => (
            <div key={req.id} className="request-item">
              <div>
                <strong>{req.type}</strong> - {req.description}
                <div style={{ fontSize: '0.8rem', color: '#999' }}>Submitted: {req.date}</div>
              </div>
              <span className={`status-badge ${req.status.replace(/\s+/g, '-').toLowerCase()}`}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}