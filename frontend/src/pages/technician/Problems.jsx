
import { useEffect, useState } from "react";
import API from "../../services/api";
import "./Problems.css";

function Problems() {
  const [equipment, setEquipment] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [problems, setProblems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    equipmentId: "",
    inspectionId: "",
    title: "",
    description: "",
    severity: "MEDIUM"
  });

  // Fetch equipment, inspections and problem history
  const fetchProblemData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        equipmentResponse,
        inspectionResponse,
        problemResponse
      ] = await Promise.all([
        API.get("/equipment"),
        API.get("/inspections"),
        API.get("/problems")
      ]);

      setEquipment(equipmentResponse.data.equipment || []);
      setInspections(inspectionResponse.data.inspections || []);
      setProblems(problemResponse.data.problems || []);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load problem reporting data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemData();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,

      // Reset inspection when equipment changes
      ...(name === "equipmentId" ? { inspectionId: "" } : {})
    }));
  };

  // Inspections belonging to selected equipment
  const availableInspections = inspections.filter(
    (item) =>
      item.equipment?._id ===
      equipment.find(
        (eq) => eq.equipmentId === formData.equipmentId
      )?._id
  );

  // Submit problem report
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.equipmentId ||
      !formData.title.trim() ||
      !formData.description.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        equipmentId: formData.equipmentId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity
      };

      if (formData.inspectionId) {
        payload.inspectionId = formData.inspectionId;
      }

      const response = await API.post("/problems", payload);

      setSuccess(
        response.data.message ||
        "Problem reported successfully."
      );

      setFormData({
        equipmentId: "",
        inspectionId: "",
        title: "",
        description: "",
        severity: "MEDIUM"
      });

      setShowForm(false);

      await fetchProblemData();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit problem report."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "LOW":
        return "problem-severity-low";
      case "MEDIUM":
        return "problem-severity-medium";
      case "HIGH":
        return "problem-severity-high";
      case "CRITICAL":
        return "problem-severity-critical";
      default:
        return "";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "REPORTED":
        return "problem-status-reported";
      case "UNDER_REVIEW":
        return "problem-status-review";
      case "REPAIR_ASSIGNED":
        return "problem-status-repair";
      case "RESOLVED":
      case "CLOSED":
        return "problem-status-resolved";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="problem-page">
        <div className="problem-loading">
          Loading problem reporting workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="problem-page">

      {/* HEADER */}
      <header className="problem-header">
        <div>
          <span className="problem-eyebrow">
            NAVAL FLEET MAINTENANCE MANAGEMENT
          </span>

          <h1>Problem Reporting</h1>

          <p>
            Report equipment problems and track their progress.
          </p>
        </div>

        <button
          className="problem-refresh-btn"
          onClick={fetchProblemData}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      <main className="problem-main">

        {error && (
          <div className="problem-alert problem-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="problem-alert problem-alert-success">
            {success}
          </div>
        )}

        {/* SUMMARY */}
        <section className="problem-summary">

          <div className="problem-summary-card">
            <span>Total Reports</span>
            <h2>{problems.length}</h2>
          </div>

          <div className="problem-summary-card">
            <span>Reported</span>
            <h2>
              {problems.filter(
                (item) => item.status === "REPORTED"
              ).length}
            </h2>
          </div>

          <div className="problem-summary-card">
            <span>Under Review</span>
            <h2>
              {problems.filter(
                (item) => item.status === "UNDER_REVIEW"
              ).length}
            </h2>
          </div>

          <div className="problem-summary-card">
            <span>Resolved / Closed</span>
            <h2>
              {problems.filter(
                (item) =>
                  ["RESOLVED", "CLOSED"].includes(item.status)
              ).length}
            </h2>
          </div>

        </section>

        {/* REPORT FORM */}
        <section className="problem-form-section">

          <div className="problem-section-heading">
            <div>
              <span>REPORTING WORKSPACE</span>
              <h2>Report New Problem</h2>
              <p>
                Record problems identified in assigned equipment.
              </p>
            </div>

            <button
              className="problem-primary-btn"
              onClick={() => {
                setShowForm((previous) => !previous);
                setError("");
                setSuccess("");
              }}
            >
              {showForm ? "Close Form" : "+ Report Problem"}
            </button>
          </div>

          {showForm && (
            <form
              className="problem-form"
              onSubmit={handleSubmit}
            >

              <div className="problem-form-grid">

                <div className="problem-field">
                  <label>Select Equipment *</label>

                  <select
                    name="equipmentId"
                    value={formData.equipmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose equipment</option>

                    {equipment.map((item) => (
                      <option
                        key={item._id}
                        value={item.equipmentId}
                      >
                        {item.equipmentId} - {item.name}
                        {!item.isActive ? " (Inactive)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="problem-field">
                  <label>Related Inspection (Optional)</label>

                  <select
                    name="inspectionId"
                    value={formData.inspectionId}
                    onChange={handleChange}
                    disabled={!formData.equipmentId}
                  >
                    <option value="">No linked inspection</option>

                    {availableInspections.map((item) => (
                      <option
                        key={item._id}
                        value={item._id}
                      >
                        {new Date(
                          item.inspectionDate
                        ).toLocaleDateString()} - {item.inspectionType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="problem-field">
                  <label>Problem Title *</label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter problem title"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="problem-field">
                  <label>Severity *</label>

                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div className="problem-field problem-full-width">
                  <label>Problem Description *</label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the problem and your observations..."
                    rows="5"
                    required
                  />
                </div>

              </div>

              <div className="problem-form-actions">

                <button
                  type="button"
                  className="problem-cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="problem-submit-btn"
                  disabled={submitting || equipment.length === 0}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Problem Report"}
                </button>

              </div>

            </form>
          )}

          {equipment.length === 0 && (
            <div className="problem-empty">
              No assigned equipment is available for reporting.
            </div>
          )}

        </section>

        {/* PROBLEM HISTORY */}
        <section className="problem-history-section">

          <div className="problem-section-heading">
            <div>
              <span>REPORT RECORDS</span>
              <h2>My Problem Reports</h2>
              <p>
                Track the severity and current status of your reports.
              </p>
            </div>
          </div>

          {problems.length > 0 ? (

            <div className="problem-table-wrapper">

              <table className="problem-table">

                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Problem</th>
                    <th>Severity</th>
                    <th>Reported Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {problems.map((item) => (

                    <tr key={item._id}>

                      <td>
                        <strong>
                          {item.equipment?.equipmentId || "N/A"}
                        </strong>

                        <span className="problem-equipment-name">
                          {item.equipment?.name || "Equipment unavailable"}
                        </span>
                      </td>

                      <td>
                        <strong>{item.title}</strong>

                        <span className="problem-description-preview">
                          {item.description}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`problem-severity ${getSeverityClass(item.severity)}`}
                        >
                          {item.severity}
                        </span>
                      </td>

                      <td>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td>
                        <span
                          className={`problem-status ${getStatusClass(item.status)}`}
                        >
                          {item.status?.replaceAll("_", " ")}
                        </span>
                      </td>

                    </tr>

                  ))}
                </tbody>

              </table>

            </div>

          ) : (
            <div className="problem-empty">
              You haven't reported any problems yet.
            </div>
          )}

        </section>

      </main>

      <footer className="problem-footer">
        Naval Fleet Maintenance Management Portal
      </footer>

    </div>
  );
}

export default Problems;
