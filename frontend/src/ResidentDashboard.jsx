import { useState } from 'react';

export default function ResidentDashboard() {

  // 1. State for Tenant Data (Money & Dates)
  const [tenant, setTenant] = useState({
    name: "Alex Johnson",
    rentBalance: 1250.00,
    rentDue: "April 6th, 2026",
    utilitiesBalance: 85.20,
    utilitiesDue: "April 10th, 2026",
    status: "Unpaid"
  });

  // 2. State for Maintenance Tracking List
  const [requests, setRequests] = useState([
    { id: 1, type: "Plumbing", description: "Leaky faucet in kitchen", status: "In Progress", date: "Mar 22" },
    { id: 2, type: "Lighting", description: "Hallway bulb out", status: "Completed", date: "Mar 15" }
  ]);

  // 3. Simulated Payment Logic
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

  // 4. Simulated Maintenance Submission
  const handleNewRequest = () => {
    const issue = prompt("What is the maintenance issue?");
    if (issue) {
      const newReq = {
        id: Date.now(),
        type: "General",
        description: issue,
        status: "Pending",
        date: "Today"
      };
      setRequests([newReq, ...requests]);
    }
  };

  return (
    <div className="portal-container">
      {/* BRANDING & WELCOME MESSAGE */}
      {tenant.status == "Paid" && (<div className="success-toast"> <span>Payment Successful! Your reciept #8829 has been generated.</span> </div>)}
      <header className="portal-header">
        <div className="header-content">
        <h1>NextGen Living</h1>
        <h2>Resident Portal</h2>
        <div className="user-badge">Welcome, {tenant.name}</div>
        </div>
      </header>

      {/* ANNOUNCEMENTS SECTION */}
      <div className="announcement-banner">
        <strong>Announcement:</strong> Pest control will be visiting Building B this Thursday.
      </div>

      <main className="portal-main">
        {/* RENT CARD (Side-by-Side) */}
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

        {/* UTILITIES CARD (Side-by-Side) */}
        <section className="info-card">
          <h3>Utilities</h3>
          <div className="info-row">
            <span>Water & Electric:</span>
            <span className="amount" style={{ color: tenant.utilitiesBalance === 0 ? "#059669" : "#ef4444" }}>
              ${tenant.utilitiesBalance.toFixed(2)}
            </span>
          </div>
          <p>Due: {tenant.utilitiesDue}</p>
          <p style={{fontSize: '0.8rem', color: '#6b7280'}}>Includes March usage</p>
        </section>
      </main>
      
      <div className="payment-action-area">
        <button className="pay-btn" onClick={handlePayment} disabled={tenant.status === "Paid"}>
            {tenant.status === "Paid" ? "Paid ✓" : "Pay Now"}
          </button>
        </div>

      {/* MAINTENANCE TRACKING SECTION (Full Width Below) */}
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
