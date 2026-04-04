import { useEffect, useState } from "react";

export default function ApplicantDashboard({ currentUser, onUserUpdate }) {
  const userId = currentUser?.userId;

  const [applications, setApplications] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(true);

  const [paystub1File, setPaystub1File] = useState(null);
  const [paystub2File, setPaystub2File] = useState(null);
  const [idFile, setIdFile] = useState(null);

  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchApplications();
    fetchAvailableUnits();
  }, [userId]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/applications/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Failed to load applications");
        setLoading(false);
        return;
      }

      setApplications(data);
      setLoading(false);

      if (data.length > 0) {
        fetchDocuments(data[0].applicationId);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setLoading(false);
    }
  };

  const fetchAvailableUnits = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/units/available");
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Failed to load units");
        return;
      }

      setAvailableUnits(data);
    } catch (error) {
      console.error("Error fetching available units:", error);
    }
  };

  const fetchDocuments = async (applicationId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/documents/application/${applicationId}`
      );
      const data = await response.json();

      if (!response.ok) {
        console.error(data.message || "Failed to load documents");
        return;
      }

      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedUnitId || !moveInDate || !income) {
      alert("Please select a unit, move-in date, and income.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          unitId: Number(selectedUnitId),
          moveInDate,
          income: Number(income)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to submit application");
        return;
      }

      alert("Application submitted successfully!");
      setSelectedUnitId("");
      setMoveInDate("");
      setIncome("");
      fetchApplications();
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Unable to connect to server");
    }
  };

  const handleDocumentUpload = async (file, documentType, applicationId) => {
    if (!file) {
      alert(`Please select a file for ${documentType}.`);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          documentType,
          applicationId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save document");
        return;
      }

      alert(`${documentType} saved successfully.`);
      fetchDocuments(applicationId);
    } catch (error) {
      console.error("Error saving document metadata:", error);
      alert("Unable to connect to server");
    }
  };

  const handleAcceptLease = async () => {
    if (!latestApplication) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/applications/${latestApplication.applicationId}/accept-lease`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to accept lease");
        return;
      }

      const updatedUser = {
        ...currentUser,
        role: "resident"
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsLeaseModalOpen(false);
      alert("Lease accepted! You are now an official resident.");
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error("Error accepting lease:", error);
      alert("Unable to connect to server");
    }
  };

  const getDocumentByType = (documentType) => {
    return documents.find((doc) => doc.documentType === documentType);
  };

  if (!userId) {
    return <div>Loading user...</div>;
  }

  const latestApplication = applications.length > 0 ? applications[0] : null;
  const paystub1 = getDocumentByType("Paystub 1");
  const paystub2 = getDocumentByType("Paystub 2");
  const driverId = getDocumentByType("Driver License / ID");

  return (
    <div className="portal-container">
      <header className="portal-header">
        <div className="header-content">
          <h1>NextGen Living</h1>
          <h2>Applicant Dashboard</h2>
          <div className="user-badge">Welcome, {currentUser.name}</div>
        </div>
      </header>

      <main className="portal-main">
        {loading ? (
          <section className="info-card">
            <h3>Loading application data...</h3>
          </section>
        ) : latestApplication ? (
          <>
            <section className="info-card">
              <h3>
                Status:{" "}
                <span
                  style={{
                    color:
                      latestApplication.status === "Approved" ? "#059669" : "#f59e0b"
                  }}
                >
                  {latestApplication.status}
                </span>
              </h3>
              <p>Application ID: #{latestApplication.applicationId}</p>
              <p>Submitted: {latestApplication.submissionDate}</p>
              <p>Requested Move-In Date: {latestApplication.moveInDate}</p>
              <p>Income: ${Number(latestApplication.income).toLocaleString()}</p>
            </section>

            {latestApplication.status === "Approved" && (
              <section className="info-card">
                <h3>Your Application Has Been Approved</h3>
                <p>Your lease is ready to review and accept.</p>
                <button className="pay-btn" onClick={() => setIsLeaseModalOpen(true)}>
                  Sign Lease
                </button>
              </section>
            )}

            <section className="info-card">
              <h3>Selected Unit</h3>
              <p>Unit: {latestApplication.unitNumber}</p>
              <p>Bedrooms: {latestApplication.bedrooms}</p>
              <p>Rent: ${Number(latestApplication.rentAmount).toLocaleString()}</p>
            </section>

            <section className="info-card">
              <h3>Upload Center</h3>
              <p>
                For now, this saves document metadata only. The real file itself is
                not being stored yet.
              </p>

              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ fontWeight: "600" }}>Paystub 1</label>
                  <input
                    type="file"
                    onChange={(e) => setPaystub1File(e.target.files[0])}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                  <button
                    className="pay-btn"
                    style={{ marginTop: "8px" }}
                    onClick={() =>
                      handleDocumentUpload(
                        paystub1File,
                        "Paystub 1",
                        latestApplication.applicationId
                      )
                    }
                  >
                    Save Paystub 1
                  </button>
                  <p style={{ marginTop: "8px", fontSize: "0.9rem" }}>
                    {paystub1 ? `Uploaded: ${paystub1.fileName}` : "Not uploaded yet"}
                  </p>
                </div>

                <div>
                  <label style={{ fontWeight: "600" }}>Paystub 2</label>
                  <input
                    type="file"
                    onChange={(e) => setPaystub2File(e.target.files[0])}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                  <button
                    className="pay-btn"
                    style={{ marginTop: "8px" }}
                    onClick={() =>
                      handleDocumentUpload(
                        paystub2File,
                        "Paystub 2",
                        latestApplication.applicationId
                      )
                    }
                  >
                    Save Paystub 2
                  </button>
                  <p style={{ marginTop: "8px", fontSize: "0.9rem" }}>
                    {paystub2 ? `Uploaded: ${paystub2.fileName}` : "Not uploaded yet"}
                  </p>
                </div>

                <div>
                  <label style={{ fontWeight: "600" }}>Driver License / ID</label>
                  <input
                    type="file"
                    onChange={(e) => setIdFile(e.target.files[0])}
                    style={{ display: "block", marginTop: "8px" }}
                  />
                  <button
                    className="pay-btn"
                    style={{ marginTop: "8px" }}
                    onClick={() =>
                      handleDocumentUpload(
                        idFile,
                        "Driver License / ID",
                        latestApplication.applicationId
                      )
                    }
                  >
                    Save Driver License / ID
                  </button>
                  <p style={{ marginTop: "8px", fontSize: "0.9rem" }}>
                    {driverId ? `Uploaded: ${driverId.fileName}` : "Not uploaded yet"}
                  </p>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="info-card">
              <h3>Start Your Application</h3>
              <p>Select a unit and submit your rental application.</p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "15px"
                }}
              >
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                >
                  <option value="">Select an available unit</option>
                  {availableUnits.map((unit) => (
                    <option key={unit.unitId} value={unit.unitId}>
                      Unit {unit.unitNumber} - {unit.bedrooms} BR - ${unit.rentAmount}
                    </option>
                  ))}
                </select>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.9rem", color: "#555", fontWeight: "600" }}>
                    Desired Move-In Date
                  </label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                  />
                </div>

                <input
                  type="number"
                  placeholder="Annual Income"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                />

                <button className="pay-btn" onClick={handleSubmitApplication}>
                  Submit Application
                </button>
              </div>
            </section>

            <section className="info-card">
              <h3>Available Units</h3>
              {availableUnits.length === 0 ? (
                <p>No available units at this time.</p>
              ) : (
                <div>
                  {availableUnits.map((unit) => (
                    <div
                      key={unit.unitId}
                      style={{ padding: "10px 0", borderBottom: "1px solid #eee" }}
                    >
                      <strong>Unit {unit.unitNumber}</strong>
                      <div>{unit.bedrooms} Bedroom</div>
                      <div>${unit.rentAmount}/month</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {isLeaseModalOpen && (
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
              maxWidth: "700px",
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)"
            }}
          >
            <h2 style={{ marginTop: 0 }}>Residential Lease Agreement</h2>

            <p>
              This Residential Lease Agreement is entered into between NextGen Living
              and the approved applicant for Unit {latestApplication.unitNumber}.
            </p>

            <p>
              By accepting this lease, you agree to occupy the assigned unit, pay the
              monthly rent of ${Number(latestApplication.rentAmount).toLocaleString()},
              and follow all community rules and policies beginning on your requested
              move-in date of {latestApplication.moveInDate}.
            </p>

            <p>
              This agreement represents the start of your residency with NextGen
              Living. Additional policies, payment expectations, and resident
              responsibilities apply throughout the lease term.
            </p>

            <p>
              If you accept below, your account will be converted from applicant to
              resident and your assigned unit will be marked as occupied.
            </p>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button className="pay-btn" onClick={handleAcceptLease}>
                Accept Lease
              </button>

              <button
                className="secondary-btn"
                onClick={() => setIsLeaseModalOpen(false)}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}