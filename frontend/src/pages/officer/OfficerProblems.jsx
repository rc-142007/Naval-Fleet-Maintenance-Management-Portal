
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./OfficerProblems.css";

function OfficerProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState("");
  const [reviewing, setReviewing] = useState(false);

  // Fetch all problem reports
  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/problems");
      setProblems(response.data.problems || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load problem reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // Review a reported problem
  const handleReview = async (e) => {
    e.preventDefault();

    if (!selectedProblem) return;

    try {
      setReviewing(true);
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/problems/${selectedProblem._id}/review`,
        {
          reviewRemarks: reviewRemarks.trim()
        }
      );

      setSuccess(
        response.data.message ||
        "Problem reviewed successfully."
      );

      setSelectedProblem(null);
      setReviewRemarks("");

      await fetchProblems();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to review problem."
      );
    } finally {
      setReviewing(false);
    }
  };

  // Severity styling
  const getSeverityClass = (severity) => {
    switch (severity) {
      case "LOW":
        return "officer-problem-severity-low";
      case "MEDIUM":
        return "officer-problem-severity-medium";
      case "HIGH":
        return "officer-problem-severity-high";
      case "CRITICAL":
        return "officer-problem-severity-critical";
      default:
        return "";
    }
  };

  // Status styling
  const getStatusClass = (status) => {
    switch (status) {
      case "REPORTED":
        return "officer-problem-status-reported";
      case "UNDER_REVIEW":
        return "officer-problem-status-review";
      case "REPAIR_ASSIGNED":
        return "officer-problem-status-repair";
      case "RESOLVED":
      case "CLOSED":
        return "officer-problem-status-resolved";
      default:
        return "";
    }
  };

  // Search and filters
  const filteredProblems = problems.filter((item) => {
    const searchText = [
      item.title,
      item.description,
      item.equipment?.equipmentId,
      item.equipment?.name,
      item.reportedBy?.name
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(
      search.toLowerCase()
    );

    const matchesSeverity =
      severityFilter === "ALL" ||
      item.severity === severityFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      item.status === statusFilter;

    return (
      matchesSearch &&
      matchesSeverity &&
      matchesStatus
    );
  });

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="officer-problems-page">

      {/* HEADER */}
      <header className="officer-problems-header">
        <div>
          <span className="officer-problems-eyebrow">
            NAVAL FLEET MAINTENANCE MANAGEMENT
          </span>

          <h1>Problem Management</h1>

          <p>
            Review and monitor equipment problems reported by Technicians.
          </p>
        </div>

        <div className="officer-problems-header-actions">
          <button
            type="button"
            className="officer-problems-refresh"
            onClick={fetchProblems}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            to="/officer"
            className="officer-problems-back"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="officer-problems-main">

        {error && (
          <div className="officer-problems-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="officer-problems-alert success">
            {success}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="officer-problems-summary">

          <div className="officer-problems-card">
            <span>Total Problems</span>
            <h2>{problems.length}</h2>
          </div>

          <div className="officer-problems-card">
            <span>Reported</span>
            <h2>
              {problems.filter(
                (item) => item.status === "REPORTED"
              ).length}
            </h2>
          </div>

          <div className="officer-problems-card">
            <span>Under Review</span>
            <h2>
              {problems.filter(
                (item) => item.status === "UNDER_REVIEW"
              ).length}
            </h2>
          </div>

          <div className="officer-problems-card">
            <span>Critical Problems</span>
            <h2>
              {problems.filter(
                (item) => item.severity === "CRITICAL"
              ).length}
            </h2>
          </div>

        </section>

        {/* PROBLEM DIRECTORY */}
        <section className="officer-problems-content">

          <div className="officer-problems-section-heading">
            <div>
              <span>MAINTENANCE OPERATIONS</span>
              <h2>Reported Problems</h2>
              <p>
                Review Technician submissions and record your remarks.
              </p>
            </div>
          </div>

          {/* SEARCH AND FILTER */}
          <div className="officer-problems-filters">

            <input
              type="text"
              placeholder="Search problem, equipment or Technician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="ALL">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REPAIR_ASSIGNED">Repair Assigned</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

          </div>

          {/* PROBLEM TABLE */}
          {loading ? (
            <div className="officer-problems-empty">
              Loading problem records...
            </div>
          ) : filteredProblems.length > 0 ? (

            <div className="officer-problems-table-wrapper">
              <table className="officer-problems-table">

                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Problem Details</th>
                    <th>Reported By</th>
                    <th>Severity</th>
                    <th>Reported Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProblems.map((item) => (
                    <tr key={item._id}>

                      <td>
                        <strong>
                          {item.equipment?.equipmentId || "N/A"}
                        </strong>

                        <span className="officer-problems-muted">
                          {item.equipment?.name || "Unavailable"}
                        </span>
                      </td>

                      <td>
                        <strong>{item.title}</strong>

                        <span className="officer-problems-description">
                          {item.description}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {item.reportedBy?.name || "Unknown"}
                        </strong>

                        <span className="officer-problems-muted">
                          {item.reportedBy?.email || ""}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`officer-problems-badge ${getSeverityClass(item.severity)}`}
                        >
                          {item.severity}
                        </span>
                      </td>

                      <td>{formatDate(item.createdAt)}</td>

                      <td>
                        <span
                          className={`officer-problems-badge ${getStatusClass(item.status)}`}
                        >
                          {item.status?.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        <div className="officer-problems-actions">

                          <button
                            type="button"
                            className="officer-problems-view-btn"
                            onClick={() => {
                              setSelectedProblem(item);
                              setReviewRemarks(item.reviewRemarks || "");
                              setError("");
                            }}
                          >
                            View Details
                          </button>

                          {item.status === "REPORTED" && (
                            <button
                              type="button"
                              className="officer-problems-review-btn"
                              onClick={() => {
                                setSelectedProblem(item);
                                setReviewRemarks("");
                                setError("");
                              }}
                            >
                              Review
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          ) : (
            <div className="officer-problems-empty">
              No problem records match your search or filters.
            </div>
          )}

        </section>
      </main>

      {/* PROBLEM DETAILS AND REVIEW MODAL */}
      {selectedProblem && (
        <div className="officer-problems-modal-overlay">

          <div className="officer-problems-modal">

            <div className="officer-problems-modal-header">
              <div>
                <span>PROBLEM REPORT DETAILS</span>
                <h2>{selectedProblem.title}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProblem(null)}
                disabled={reviewing}
              >
                ×
              </button>
            </div>

            <div className="officer-problems-modal-body">

              <div className="officer-problems-detail-grid">

                <div>
                  <span>Equipment ID</span>
                  <strong>
                    {selectedProblem.equipment?.equipmentId || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Equipment Name</span>
                  <strong>
                    {selectedProblem.equipment?.name || "N/A"}
                  </strong>
                </div>

                <div>
                  <span>Reported By</span>
                  <strong>
                    {selectedProblem.reportedBy?.name || "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>Severity</span>
                  <strong>{selectedProblem.severity}</strong>
                </div>

                <div>
                  <span>Reported Date</span>
                  <strong>{formatDate(selectedProblem.createdAt)}</strong>
                </div>

                <div>
                  <span>Current Status</span>
                  <strong>
                    {selectedProblem.status?.replaceAll("_", " ")}
                  </strong>
                </div>

              </div>

              <div className="officer-problems-full-description">
                <span>Problem Description</span>
                <p>{selectedProblem.description}</p>
              </div>

              {selectedProblem.inspection && (
                <div className="officer-problems-full-description">
                  <span>Linked Inspection</span>
                  <p>
                    {selectedProblem.inspection.inspectionType || "Inspection"}
                    {" - "}
                    {formatDate(selectedProblem.inspection.inspectionDate)}
                  </p>
                  {selectedProblem.inspection.findings && (
                    <p>{selectedProblem.inspection.findings}</p>
                  )}
                </div>
              )}

              {selectedProblem.reviewedBy && (
                <div className="officer-problems-full-description">
                  <span>Previously Reviewed By</span>
                  <p>{selectedProblem.reviewedBy.name}</p>
                </div>
              )}

              {selectedProblem.reviewRemarks && (
                <div className="officer-problems-full-description">
                  <span>Review Remarks</span>
                  <p>{selectedProblem.reviewRemarks}</p>
                </div>
              )}

              {selectedProblem.status === "REPORTED" ? (
                <form onSubmit={handleReview}>

                  <div className="officer-problems-review-field">
                    <label>Officer Review Remarks</label>

                    <textarea
                      value={reviewRemarks}
                      onChange={(e) => setReviewRemarks(e.target.value)}
                      placeholder="Enter your observations and review remarks..."
                      rows="4"
                    />
                  </div>

                  <div className="officer-problems-modal-actions">

                    <button
                      type="button"
                      className="officer-problems-cancel-btn"
                      onClick={() => setSelectedProblem(null)}
                      disabled={reviewing}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="officer-problems-submit-btn"
                      disabled={reviewing}
                    >
                      {reviewing
                        ? "Reviewing..."
                        : "Confirm Problem Review"}
                    </button>

                  </div>

                </form>
              ) : (
                <div className="officer-problems-reviewed-message">
                  This problem has already been reviewed or processed.
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <footer className="officer-problems-footer">
        Naval Fleet Maintenance Management Portal
      </footer>

    </div>
  );
}

export default OfficerProblems;
