
import { useEffect, useState } from "react";
import API from "../../services/api";
import "./OfficerInspections.css";

function OfficerInspections() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/inspections");
      setInspections(response.data.inspections || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load inspections."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleReview = async (e) => {
    e.preventDefault();

    if (!selectedInspection) return;

    try {
      setSubmitting(true);

      await API.patch(
        `/inspections/${selectedInspection._id}/review`,
        { reviewRemarks }
      );

      alert("Inspection reviewed successfully!");

      setSelectedInspection(null);
      setReviewRemarks("");
      await fetchInspections();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to review inspection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInspections = inspections.filter((item) => {
    const equipmentName = item.equipment?.name || "";
    const equipmentId = item.equipment?.equipmentId || "";
    const technicianName = item.inspectedBy?.name || "";

    const matchesSearch =
      equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      equipmentId.toLowerCase().includes(search.toLowerCase()) ||
      technicianName.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "ALL" || item.status === filter;

    return matchesSearch && matchesFilter;
  });

  const pendingCount = inspections.filter(
    (item) => item.status === "SUBMITTED"
  ).length;

  const reviewedCount = inspections.filter(
    (item) => item.status === "REVIEWED"
  ).length;

  return (
    <div className="officer-inspections-page">
      <header className="oi-header">
        <div>
          <h1>NFMMP</h1>
          <p>Officer Inspection Management</p>
        </div>
        <span className="oi-role">OFFICER</span>
      </header>

      <main className="oi-main">
        <section className="oi-heading">
          <div>
            <p className="oi-subtitle">OFFICER CONTROL PANEL</p>
            <h2>Inspection Management</h2>
            <p>
              Review and manage inspection reports submitted by Technicians.
            </p>
          </div>
        </section>

        <section className="oi-stats">
          <div className="oi-stat-card">
            <span>Total Inspections</span>
            <h3>{inspections.length}</h3>
          </div>

          <div className="oi-stat-card">
            <span>Pending Review</span>
            <h3>{pendingCount}</h3>
          </div>

          <div className="oi-stat-card">
            <span>Reviewed</span>
            <h3>{reviewedCount}</h3>
          </div>
        </section>

        <section className="oi-content">
          <div className="oi-toolbar">
            <input
              type="text"
              placeholder="Search equipment or technician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Inspections</option>
              <option value="SUBMITTED">Pending Review</option>
              <option value="REVIEWED">Reviewed</option>
            </select>
          </div>

          {loading && (
            <p className="oi-message">Loading inspections...</p>
          )}

          {error && (
            <p className="oi-error">{error}</p>
          )}

          {!loading && !error && (
            <div className="oi-table-wrapper">
              <table className="oi-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Technician</th>
                    <th>Inspection Type</th>
                    <th>Date</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInspections.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="oi-empty">
                        No inspection records found.
                      </td>
                    </tr>
                  ) : (
                    filteredInspections.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <strong>{item.equipment?.name || "N/A"}</strong>
                          <small>
                            {item.equipment?.equipmentId || ""}
                          </small>
                        </td>

                        <td>{item.inspectedBy?.name || "N/A"}</td>

                        <td>{item.inspectionType?.replace("_", " ")}</td>

                        <td>
                          {item.inspectionDate
                            ? new Date(item.inspectionDate).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td>
                          {item.condition?.replaceAll("_", " ")}
                        </td>

                        <td>
                          <span
                            className={`oi-status ${
                              item.status === "REVIEWED"
                                ? "oi-reviewed"
                                : "oi-pending"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="oi-view-button"
                            onClick={() => {
                              setSelectedInspection(item);
                              setReviewRemarks(item.reviewRemarks || "");
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedInspection && (
          <div className="oi-modal-overlay">
            <div className="oi-modal">
              <div className="oi-modal-header">
                <h2>Inspection Details</h2>
                <button
                  type="button"
                  className="oi-close"
                  onClick={() => setSelectedInspection(null)}
                >
                  ×
                </button>
              </div>

              <div className="oi-details">
                <p>
                  <strong>Equipment:</strong>{" "}
                  {selectedInspection.equipment?.name || "N/A"}
                </p>

                <p>
                  <strong>Equipment ID:</strong>{" "}
                  {selectedInspection.equipment?.equipmentId || "N/A"}
                </p>

                <p>
                  <strong>Technician:</strong>{" "}
                  {selectedInspection.inspectedBy?.name || "N/A"}
                </p>

                <p>
                  <strong>Inspection Type:</strong>{" "}
                  {selectedInspection.inspectionType}
                </p>

                <p>
                  <strong>Condition:</strong>{" "}
                  {selectedInspection.condition?.replaceAll("_", " ")}
                </p>

                <p>
                  <strong>Findings:</strong>
                  <br />
                  {selectedInspection.findings}
                </p>

                <p>
                  <strong>Recommendations:</strong>
                  <br />
                  {selectedInspection.recommendations || "None"}
                </p>

                <p>
                  <strong>Technician Remarks:</strong>
                  <br />
                  {selectedInspection.remarks || "None"}
                </p>

                {selectedInspection.status === "REVIEWED" && (
                  <p>
                    <strong>Officer Review Remarks:</strong>
                    <br />
                    {selectedInspection.reviewRemarks || "No remarks"}
                  </p>
                )}
              </div>

              {selectedInspection.status === "SUBMITTED" ? (
                <form onSubmit={handleReview} className="oi-review-form">
                  <label>Officer Review Remarks</label>

                  <textarea
                    value={reviewRemarks}
                    onChange={(e) => setReviewRemarks(e.target.value)}
                    placeholder="Enter your review remarks..."
                    rows="4"
                  />

                  <button
                    type="submit"
                    className="oi-submit-button"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Mark as Reviewed"}
                  </button>
                </form>
              ) : (
                <p className="oi-already-reviewed">
                  This inspection has already been reviewed.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OfficerInspections;
