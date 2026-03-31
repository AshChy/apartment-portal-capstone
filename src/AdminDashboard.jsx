import { useState } from 'react';

/**
 * Admin Management & Announcements
 */
export default function AdminDashboard() {
  const [announcement, setAnnouncement] = useState("");

  // Review Logic
  // This simulates the 'Review' action by calling out specific applicant data.
  const handleReviewAll = () => {
    alert(
      "Reviewing Active Applications:\n" +
      "---------------------------\n" +
      "1. Sarah Williams (Suite 104) - Status: Waiting for ID\n" +
      "2. John Doe (Suite 305) - Status: Fully Approved\n" +
      "3. 6 additional files loading..."
    );
  };

  // Broadcast Logic with Validation
  const handlePostAnnouncement = () => {
    if (!announcement.trim()) {
      alert("Error: You must type a message before posting an announcement.");
      return;
    }
    alert(`Success: Announcement posted to all Resident Portals!\n\nMessage: "${announcement}"`);
    setAnnouncement(""); // Clears the box after success
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
        {/* Apartment Inventory Tracking */}
        <section className="info-card">
          <h3>Unit Inventory</h3>
          <div className="info-row">
            <span>Total Units:</span>
            <span className="amount">48</span>
          </div>
          <div className="info-row">
            <span>Vacant & Ready:</span>
            <span style={{color: '#059669', fontWeight: 'bold'}}>3</span>
          </div>
          <div className="info-row">
            <span>Pending Lease:</span>
            <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>5</span>
          </div>
        </section>

        {/* Application Review Queue */}
        <section className="info-card">
          <h3>Review Queue</h3>
          <div style={{fontSize: '0.9rem', marginBottom: '15px'}}>
            <div style={{padding: '8px', background: '#f9fafb', marginBottom: '5px', borderRadius: '4px', borderLeft: '4px solid #f59e0b'}}>
              <strong>Sarah Williams</strong> - Suite 104 <br/> 
              <small>Status: Waiting for ID</small>
            </div>
            <div style={{padding: '8px', background: '#f9fafb', borderRadius: '4px', borderLeft: '4px solid green'}}>
              <strong>John Doe</strong> - Suite 305 <br/>
              <small>Status: Fully Approved</small>
            </div>
          </div>
          <button className="btn pay-btn" style={{width: '100%'}} onClick={handleReviewAll}>
            Review All Applications
          </button>
        </section>
      </main>

      {/* Resident Notifications (Broadcast) */}
      <section className="info-card">
        <h3>Broadcast Announcements</h3>
        <textarea 
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Enter message for all residents..." 
          style={{width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px'}}
        />
        <button className="btn maintenance-btn" style={{width: '100%'}} onClick={handlePostAnnouncement}>
          Post Announcement
        </button>
      </section>
    </div>
  );
}
