import { useEffect, useMemo, useState } from "react";

export default function AdminDashboard({ currentUser }) {
  const [announcement, setAnnouncement] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");

  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [applicationDocuments, setApplicationDocuments] = useState({});

  const [allUnits, setAllUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I can review current applications, flag missing documents, compare applicants for the same unit, and suggest alternate available units."
    }
  ]);
  const [inventorySummary, setInventorySummary] = useState({
    totalUnits: 0,
    vacantReady: 0,
    occupied: 0,
    pendingLease: 0
  });
  const [loadingInventory, setLoadingInventory] = useState(true);

  useEffect(() => {
    fetchMaintenanceRequests();
    fetchApplications();
    fetchAllUnits();
    fetchInventorySummary();
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

  const fetchApplications = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/applications/review-queue");
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Failed to fetch applications");
        setLoadingApplications(false);
        return;
      }

      setApplications(data);
      fetchDocumentsForApplications(data);
      setLoadingApplications(false);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setLoadingApplications(false);
    }
  };

  const fetchDocumentsForApplications = async (applicationsList) => {
    try {
      const documentResults = await Promise.all(
        applicationsList.map(async (app) => {
          const response = await fetch(
            `http://localhost:3000/api/documents/application/${app.applicationId}`
          );
          const data = await response.json();

          return {
            applicationId: app.applicationId,
            documents: response.ok ? data : []
          };
        })
      );

      const documentsMap = {};
      documentResults.forEach((item) => {
        documentsMap[item.applicationId] = item.documents;
      });

      setApplicationDocuments(documentsMap);
    } catch (error) {
      console.error("Error fetching application documents:", error);
    }
  };

  const fetchAllUnits = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/units/all");
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Failed to fetch units");
        setLoadingUnits(false);
        return;
      }

      setAllUnits(data);
      setLoadingUnits(false);
    } catch (error) {
      console.error("Error fetching all units:", error);
      setLoadingUnits(false);
    }
  };

  const fetchInventorySummary = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/admin/inventory-summary");
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Failed to fetch inventory summary");
        setLoadingInventory(false);
        return;
      }

      setInventorySummary({
        totalUnits: Number(data.totalUnits || 0),
        vacantReady: Number(data.vacantReady || 0),
        occupied: Number(data.occupied || 0),
        pendingLease: Number(data.pendingLease || 0)
      });

      setLoadingInventory(false);
    } catch (error) {
      console.error("Error fetching inventory summary:", error);
      setLoadingInventory(false);
    }
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

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update application status");
        return;
      }

      alert(`Application ${newStatus.toLowerCase()} successfully.`);
      fetchApplications();
      fetchInventorySummary();
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Unable to connect to server");
    }
  };

  const handlePostAnnouncement = async () => {
    if (!announcement.trim()) {
      alert("Error: You must type a message before posting an announcement.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcement,
          userId: currentUser?.userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to post announcement");
        return;
      }

      alert("Announcement posted successfully.");
      setAnnouncement("");
      setAnnouncementTitle("");
    } catch (error) {
      console.error("Post announcement error:", error);
      alert("Unable to connect to server");
    }
  };

  const getMissingDocuments = (app) => {
    const requiredDocs = ["Paystub 1", "Paystub 2", "Driver License / ID"];
    const uploaded = (applicationDocuments[app.applicationId] || []).map((doc) => doc.documentType);

    return requiredDocs.filter((docType) => !uploaded.includes(docType));
  };

  const scoreApplication = (app) => {
    const docs = applicationDocuments[app.applicationId] || [];
    let score = 0;

    score += Number(app.income || 0);
    score += docs.length * 10000;

    if (app.status === "Pending") score += 5000;
    if (app.status === "Approved") score += 2000;

    return score;
  };

  const groupedByUnit = useMemo(() => {
    const map = {};

    applications.forEach((app) => {
      if (!map[app.unitId]) {
        map[app.unitId] = [];
      }
      map[app.unitId].push(app);
    });

    return map;
  }, [applications]);

  const findBestApplicantForUnit = (unitNumber) => {
    const unit = allUnits.find(
      (u) => u.unitNumber.toLowerCase() === unitNumber.toLowerCase()
    );

    if (!unit) {
      return `I could not find Unit ${unitNumber}.`;
    }

    const unitApplicants = applications.filter((app) => app.unitId === unit.unitId);

    if (unitApplicants.length === 0) {
      return `There are no applications currently assigned to Unit ${unitNumber}.`;
    }

    const sorted = [...unitApplicants].sort(
      (a, b) => scoreApplication(b) - scoreApplication(a)
    );

    const winner = sorted[0];
    const missingDocs = getMissingDocuments(winner);

    return `Best current fit for Unit ${unitNumber}: ${winner.applicantName}. Income: $${Number(
      winner.income
    ).toLocaleString()}. Uploaded docs: ${
      (applicationDocuments[winner.applicationId] || []).length
    } of 3. Missing docs: ${
      missingDocs.length > 0 ? missingDocs.join(", ") : "none"
    }.`;
  };

  const getSameBedroomAlternative = (app) => {
    const currentUnit = allUnits.find((u) => u.unitId === app.unitId);
    if (!currentUnit) return null;

    const alternative = allUnits.find(
      (u) =>
        u.unitId !== app.unitId &&
        u.bedrooms === currentUnit.bedrooms &&
        u.availabilityStatus === "Available"
    );

    return alternative || null;
  };

  const buildAiSummary = () => {
    if (applications.length === 0) {
      return "There are no applications to review right now.";
    }

    const missingDocApps = applications.filter((app) => getMissingDocuments(app).length > 0);

    const crowdedUnits = Object.values(groupedByUnit).filter((appsForUnit) => appsForUnit.length > 1);

    let summary = `There are ${applications.length} applications in the system. `;
    summary += `${missingDocApps.length} application(s) are missing at least one required document. `;
    summary += `${crowdedUnits.length} unit(s) currently have multiple applicants.`;

    return summary;
  };

  const handleReviewAll = () => {
    setIsAiModalOpen(true);

    setAiMessages([
      {
        role: "assistant",
        content: buildAiSummary()
      },
      {
        role: "assistant",
        content:
          "Try asking: 'Who is missing documents?' or 'Who is best for Unit A1?' or 'Do we have duplicate applicants for one unit?'"
      }
    ]);
  };

  const handleReassignApplication = async (applicationId, newUnitId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/applications/${applicationId}/reassign-unit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ newUnitId })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to reassign application");
        return;
      }

      alert("Application reassigned successfully.");
      fetchApplications();
      fetchAllUnits();
      fetchInventorySummary();
    } catch (error) {
      console.error("Reassign error:", error);
      alert("Unable to connect to server");
    }
  };

  const handleAiSubmit = async () => {
    const question = aiInput.trim();
    if (!question) return;

    const lowerQuestion = question.toLowerCase();

    setAiMessages((prev) => [...prev, { role: "user", content: question }]);
    setAiInput("");

    let response = "I could not understand that yet. Try asking about missing documents, best applicant, duplicate unit applications, or available alternate units.";

    if (lowerQuestion.includes("missing") && lowerQuestion.includes("document")) {
      const missingDocApps = applications.filter((app) => getMissingDocuments(app).length > 0);

      if (missingDocApps.length === 0) {
        response = "All current applications have all 3 required document types uploaded.";
      } else {
        response = missingDocApps
          .map((app) => {
            const missing = getMissingDocuments(app);
            return `${app.applicantName} for Unit ${app.unitNumber} is missing: ${missing.join(", ")}.`;
          })
          .join(" ");
      }
    } else if (
      lowerQuestion.includes("multiple") ||
      lowerQuestion.includes("duplicate") ||
      lowerQuestion.includes("same unit")
    ) {
      const crowdedUnits = Object.values(groupedByUnit).filter((appsForUnit) => appsForUnit.length > 1);

      if (crowdedUnits.length === 0) {
        response = "No units currently have multiple applicants.";
      } else {
        response = crowdedUnits
          .map((appsForUnit) => {
            const unitNumber = appsForUnit[0].unitNumber;
            const sorted = [...appsForUnit].sort(
              (a, b) => scoreApplication(b) - scoreApplication(a)
            );
            const best = sorted[0];
            const second = sorted[1];
            let sentence = `Unit ${unitNumber} has ${appsForUnit.length} applicants. Best current fit: ${best.applicantName}.`;

            if (second) {
              const altUnit = getSameBedroomAlternative(second);
              if (altUnit) {
                sentence += ` Secondary option ${second.applicantName} could be reassigned to available Unit ${altUnit.unitNumber}.`;
              }
            }

            return sentence;
          })
          .join(" ");
      }
    } else if (lowerQuestion.includes("best for unit")) {
      const match = question.match(/unit\s+([a-z0-9]+)/i);
      if (match) {
        response = findBestApplicantForUnit(match[1]);
      } else {
        response = "Please ask like this: Who is best for Unit A1?";
      }
    } else if (
      lowerQuestion.includes("available") &&
      (lowerQuestion.includes("alternate") || lowerQuestion.includes("another unit"))
    ) {
      const suggestions = applications
        .map((app) => {
          const alt = getSameBedroomAlternative(app);
          if (!alt) return null;
          return `${app.applicantName} from Unit ${app.unitNumber} could also fit available Unit ${alt.unitNumber}.`;
        })
        .filter(Boolean);

      response =
        suggestions.length > 0
          ? suggestions.join(" ")
          : "I do not see any same-bedroom alternate available units right now.";
    }

    setAiMessages((prev) => [...prev, { role: "assistant", content: response }]);
  };

  const topReassignmentSuggestions = useMemo(() => {
    const suggestions = [];

    Object.values(groupedByUnit).forEach((appsForUnit) => {
      if (appsForUnit.length < 2) return;

      const sorted = [...appsForUnit].sort(
        (a, b) => scoreApplication(b) - scoreApplication(a)
      );

      const second = sorted[1];
      const altUnit = getSameBedroomAlternative(second);

      if (second && altUnit) {
        suggestions.push({
          applicationId: second.applicationId,
          applicantName: second.applicantName,
          currentUnitNumber: second.unitNumber,
          suggestedUnitId: altUnit.unitId,
          suggestedUnitNumber: altUnit.unitNumber
        });
      }
    });

    return suggestions;
  }, [groupedByUnit, allUnits, applicationDocuments]);

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

          {loadingInventory ? (
            <p>Loading unit inventory...</p>
          ) : (
            <>
              <div className="info-row">
                <span>Total Units:</span>
                <span className="amount">{inventorySummary.totalUnits}</span>
              </div>

              <div className="info-row">
                <span>Vacant & Ready:</span>
                <span style={{ color: "#059669", fontWeight: "bold" }}>
                  {inventorySummary.vacantReady}
                </span>
              </div>

              <div className="info-row">
                <span>Occupied:</span>
                <span style={{ color: "#2563eb", fontWeight: "bold" }}>
                  {inventorySummary.occupied}
                </span>
              </div>

              <div className="info-row">
                <span>Pending Lease:</span>
                <span style={{ color: "var(--primary)", fontWeight: "bold" }}>
                  {inventorySummary.pendingLease}
                </span>
              </div>
            </>
          )}
        </section>

        <section className="info-card">
          <h3>Review Queue</h3>

          {loadingApplications ? (
            <p>Loading applications...</p>
          ) : applications.length === 0 ? (
            <p>No applications found.</p>
          ) : (
            <div style={{ fontSize: "0.9rem", marginBottom: "15px", maxHeight: "280px", overflowY: "auto" }}>
              {applications.map((app) => {
                const missingDocs = getMissingDocuments(app);

                return (
                  <div
                    key={app.applicationId}
                    style={{
                      padding: "10px",
                      background: "#f9fafb",
                      marginBottom: "8px",
                      borderRadius: "6px",
                      borderLeft: `4px solid ${
                        app.status === "Approved"
                          ? "green"
                          : app.status === "Pending"
                          ? "#f59e0b"
                          : "#dc2626"
                      }`
                    }}
                  >
                    <strong>{app.applicantName}</strong> - Unit {app.unitNumber}
                    <br />
                    <small>Status: {app.status}</small>
                    <br />
                    <small>Email: {app.applicantEmail}</small>
                    <br />
                    <small>Move-In: {app.moveInDate}</small>
                    <br />
                    <small>Income: ${Number(app.income).toLocaleString()}</small>
                    <br />
                    <small>
                      Docs: {3 - missingDocs.length}/3 uploaded
                      {missingDocs.length > 0 ? ` | Missing: ${missingDocs.join(", ")}` : " | Complete"}
                    </small>

                    <div style={{ marginTop: "10px" }}>
                      <strong>Uploaded Documents:</strong>
                      {applicationDocuments[app.applicationId] &&
                      applicationDocuments[app.applicationId].length > 0 ? (
                        <ul style={{ marginTop: "6px", paddingLeft: "18px" }}>
                          {applicationDocuments[app.applicationId].map((doc) => (
                            <li key={doc.documentId}>
                              {doc.documentType}: {doc.fileName}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ marginTop: "6px" }}>No documents uploaded yet.</p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <button
                        onClick={() => handleUpdateApplicationStatus(app.applicationId, "Approved")}
                        disabled={app.status === "Approved"}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "none",
                          background: app.status === "Approved" ? "#9ca3af" : "#059669",
                          color: "white",
                          cursor: app.status === "Approved" ? "not-allowed" : "pointer"
                        }}
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleUpdateApplicationStatus(app.applicationId, "Rejected")}
                        disabled={app.status === "Rejected"}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "none",
                          background: app.status === "Rejected" ? "#9ca3af" : "#dc2626",
                          color: "white",
                          cursor: app.status === "Rejected" ? "not-allowed" : "pointer"
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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

        <input
          type="text"
          value={announcementTitle}
          onChange={(e) => setAnnouncementTitle(e.target.value)}
          placeholder="Optional title (defaults to Community Update)"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            marginBottom: "10px"
          }}
        />

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

        <button
          className="btn maintenance-btn"
          style={{ width: "100%" }}
          onClick={handlePostAnnouncement}
        >
          Post Announcement
        </button>
      </section>

      {isAiModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 3000,
            padding: "20px"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              maxHeight: "85vh",
              background: "white",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "var(--primary)",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <strong>AI Application Review Assistant</strong>
                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                  Lightweight smart review for current applications
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "1.3rem",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", background: "#fafafa" }}>
              <strong>Quick prompts:</strong>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={() => setAiInput("Who is missing documents?")}>Who is missing documents?</button>
                <button onClick={() => setAiInput("Do we have duplicate applicants for one unit?")}>
                  Duplicate applicants?
                </button>
                <button onClick={() => setAiInput("Who is best for Unit A1?")}>
                  Best for Unit A1?
                </button>
                <button onClick={() => setAiInput("Are there available alternate units?")}>
                  Alternate units?
                </button>
              </div>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", flex: 1, background: "#fcfcfc" }}>
              {aiMessages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: msg.role === "user" ? "#e0e7ff" : "#f3f4f6"
                    }}
                  >
                    <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong> {msg.content}
                  </div>
                </div>
              ))}

              {topReassignmentSuggestions.length > 0 && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    background: "white"
                  }}
                >
                  <strong>Suggested reassignment actions</strong>

                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {topReassignmentSuggestions.map((item) => (
                      <div
                        key={item.applicationId}
                        style={{
                          padding: "12px",
                          borderRadius: "10px",
                          background: "#f9fafb",
                          border: "1px solid #eee"
                        }}
                      >
                        <div>
                          {item.applicantName} is currently assigned to Unit {item.currentUnitNumber}. Suggested alternate:
                          Unit {item.suggestedUnitNumber}.
                        </div>

                        <button
                          style={{ marginTop: "10px" }}
                          onClick={() =>
                            handleReassignApplication(item.applicationId, item.suggestedUnitId)
                          }
                        >
                          Reassign to Unit {item.suggestedUnitNumber}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: "16px 20px", borderTop: "1px solid #eee", display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask about missing docs, best applicant, duplicates, or alternate units..."
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #ddd"
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAiSubmit();
                  }
                }}
              />
              <button className="pay-btn" onClick={handleAiSubmit}>
                Ask
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}