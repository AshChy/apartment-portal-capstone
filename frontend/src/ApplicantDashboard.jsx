import { useState } from 'react';

/**
 * Application, Documents, & AI Chat
 */
export default function ApplicantDashboard() {
  const [step, setStep] = useState(2);
  const [extraDoc, setExtraDoc] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false); // Controls the chat window

  // Simulated Upload Logic
  const handleUpload = () => {
    alert("Uploading Document... Analysis in progress.");
    setExtraDoc(true);
    setStep(3);
  };

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div className="header-content">
          <h1>NextGen Living</h1>
          <h2>Applicant Dashboard</h2>
          <div className="user-badge">Application ID: #44092</div>
        </div>
      </header>

      <main className="portal-main">
        {/* Progress Tracker */}
        <section className="info-card">
          <h3>Status: <span style={{color: '#f59e0b'}}>Under Review</span></h3>
          <p>Step {step} of 4: {step === 2 ? "Documentation" : "Final Verification"}</p>
          <div style={{background: '#eee', height: '10px', borderRadius: '5px', marginTop: '10px'}}>
            <div style={{
              background: 'var(--primary)', 
              width: step === 2 ? '45%' : '75%', 
              height: '100%', 
              borderRadius: '5px',
              transition: 'width 0.6s ease' 
            }}></div>
          </div>
        </section>

        {/* Upload Center */}
        <section className="info-card">
          <h3>Upload Center</h3>
          <ul style={{listStyle: 'none', padding: 0}}>
            <li style={{marginBottom: '12px'}}>Proof of Income - <span className="status-badge status-uploaded">Uploaded</span></li>
            <li style={{marginBottom: '12px'}}>Photo ID - <span className="status-badge status-uploaded">Uploaded</span></li>
            <li style={{marginBottom: '12px'}}>
              Previous Landlord Reference - 
              <span className={extraDoc ? "status-badge status-uploaded" : "status-badge status-missing"}>
                {extraDoc ? "Uploaded" : "Missing"}
              </span>
            </li>
          </ul>
          <button className="btn pay-btn" style={{width: '100%', marginTop: '15px'}} onClick={handleUpload}>
            {extraDoc ? "Upload Additional Files" : "Upload Document"}
          </button>
        </section>
      </main>

      {/* --- AI CHAT BUBBLE & WINDOW --- */}
      <div className="ai-assistant-container">
        {/* The Chat Window */}
        {isAiOpen && (
          <div className="ai-chat-window">
            <div className="chat-header">
              <span>NextGen Living AI Guide</span>
              <button onClick={() => setIsAiOpen(false)} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem'}}>×</button>
            </div>
            
            <div className="chat-messages" style={{flex: 1, padding: '15px', overflowY: 'auto', fontSize: '0.9rem'}}>
              <div style={{background: '#f3f4f6', padding: '10px', borderRadius: '8px', marginBottom: '10px'}}>
                <strong>AI:</strong> Hello! is there anything I can help you with?
              </div>
              {/* PLACEHOLDER MESSAGE*/}
            </div>

            <div className="chat-input-area" style={{padding: '10px', borderTop: '1px solid #eee'}}>
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                style={{width: '100%', padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none'}}
              />
            </div>
          </div>
        )}

        {/* The Floating Bubble Button */}
        <div className="ai-chat-bubble" onClick={() => setIsAiOpen(!isAiOpen)}>
          {isAiOpen ? "AI" : "AI"}
        </div>
      </div>
    </div>
  );
}