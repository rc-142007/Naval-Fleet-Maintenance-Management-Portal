
import { useEffect, useState } from "react";
import API from "../../services/api";
import "./Inspections.css";

function Inspections() {
  const [equipment, setEquipment] = useState([]);
  const [inspections, setInspections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    equipmentId: "",
    inspectionType: "ROUTINE",
    inspectionDate: new Date().toISOString().split("T")[0],
    findings: "",
    condition: "OPERATIONAL",
    recommendations: "",
    remarks: ""
  });

  // Fetch assigned equipment and inspection history
  const fetchInspectionData = async () => {
    try {
      setLoading(true);
      setError("");

      const [equipmentResponse, inspectionResponse] =
        await Promise.all([
          API.get("/equipment"),
          API.get("/inspections")
        ]);

      setEquipment(equipmentResponse.data.equipment || []);
      setInspections(inspectionResponse.data.inspections || []);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load inspection data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspectionData();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Submit inspection
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.equipmentId) {
      setError("Please select equipment.");
      return;
    }

    if (!formData.findings.trim()) {
      setError("Please enter inspection findings.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await API.post("/inspections", {
        ...formData,
        inspectionDate: formData.inspectionDate
          ? new Date(formData.inspectionDate).toISOString()
          : undefined
      });

      setSuccess(
        response.data.message ||
        "Inspection submitted successfully."
      );

      setFormData({
        equipmentId: "",
        inspectionType: "ROUTINE",
        inspectionDate: new Date().toISOString().split("T")[0],
        findings: "",
        condition: "OPERATIONAL",
        recommendations: "",
        remarks: ""
      });

      setShowForm(false);

      await fetchInspectionData();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit inspection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getConditionClass = (condition) => {
    switch (condition) {
      case "OPERATIONAL":
        return "inspection-operational";
      case "NEEDS_INSPECTION":
        return "inspection-needs";
      case "UNDER_MAINTENANCE":
        return "inspection-maintenance";
      case "NON_OPERATIONAL":
        return "inspection-nonoperational";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="inspection-page">
        <div className="inspection-loading">
          Loading inspection workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="inspection-page">

      <header className="inspection-header">
        <div>
          <span className="inspection-eyebrow">
            NAVAL FLEET MAINTENANCE MANAGEMENT
          </span>

          <h1>Equipment Inspections</h1>

          <p>
            Submit equipment inspection reports and track their review status.
          </p>
        </div>

        <button
          className="inspection-refresh-btn"
          onClick={fetchInspectionData}
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      <main className="inspection-main">

        {error && (
          <div className="inspection-alert inspection-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="inspection-alert inspection-alert-success">
            {success}
          </div>
        )}

        <section className="inspection-summary">
          <div className="inspection-summary-card">
            <span>Assigned Equipment</span>
            <h2>{equipment.length}</h2>
          </div>

          <div className="inspection-summary-card">
            <span>Total Inspections</span>
            <h2>{inspections.length}</h2>
          </div>

          <div className="inspection-summary-card">
            <span>Awaiting Review</span>
            <h2>
              {inspections.filter(
                (item) => item.status === "SUBMITTED"
              ).length}
            </h2>
          </div>

          <div className="inspection-summary-card">
            <span>Reviewed</span>
            <h2>
              {inspections.filter(
                (item) => item.status === "REVIEWED"
              ).length}
            </h2>
          </div>
        </section>

        <section className="inspection-form-section">

          <div className="inspection-section-heading">
            <div>
              <span>INSPECTION WORKSPACE</span>
              <h2>Submit New Inspection</h2>
              <p>
                Record your findings for equipment assigned to you.
              </p>
            </div>

            <button
              className="inspection-primary-btn"
              onClick={() => {
                setShowForm((previous) => !previous);
                setError("");
                setSuccess("");
              }}
            >
              {showForm ? "Close Form" : "+ New Inspection"}
            </button>
          </div>

          {showForm && (
            <form
              className="inspection-form"
              onSubmit={handleSubmit}
            >

              <div className="inspection-form-grid">

                <div className="inspection-field">
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
                        value={item._id}
                      >
                        {item.equipmentId} - {item.name}
                        {!item.isActive ? " (Inactive)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inspection-field">
                  <label>Inspection Type *</label>

                  <select
                    name="inspectionType"
                    value={formData.inspectionType}
                    onChange={handleChange}
                    required
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="UNSCHEDULED">Unscheduled</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                  </select>
                </div>

                <div className="inspection-field">
                  <label>Inspection Date *</label>

                  <input
                    type="date"
                    name="inspectionDate"
                    value={formData.inspectionDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="inspection-field">
                  <label>Equipment Condition *</label>

                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                  >
                    <option value="OPERATIONAL">Operational</option>
                    <option value="NEEDS_INSPECTION">Needs Inspection</option>
                    <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                    <option value="NON_OPERATIONAL">Non-Operational</option>
                  </select>
                </div>

                <div className="inspection-field inspection-full-width">
                  <label>Inspection Findings *</label>

                  <textarea
                    name="findings"
                    value={formData.findings}
                    onChange={handleChange}
                    placeholder="Describe the inspection observations and findings..."
                    rows="4"
                    required
                  />
                </div>

                <div className="inspection-field inspection-full-width">
                  <label>Recommendations</label>

                  <textarea
                    name="recommendations"
                    value={formData.recommendations}
                    onChange={handleChange}
                    placeholder="Enter recommended maintenance or corrective actions..."
                    rows="3"
                  />
                </div>

                <div className="inspection-field inspection-full-width">
                  <label>Additional Remarks</label>

                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Enter any additional remarks..."
                    rows="3"
                  />
                </div>

              </div>

              <div className="inspection-form-actions">
                <button
                  type="button"
                  className="inspection-cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inspection-submit-btn"
                  disabled={submitting || equipment.length === 0}
                >
                  {submitting ? "Submitting..." : "Submit Inspection"}
                </button>
              </div>

            </form>
          )}

          {equipment.length === 0 && (
            <div className="inspection-empty">
              No assigned equipment is available for inspection.
            </div>
          )}

        </section>

        <section className="inspection-history-section">

          <div className="inspection-section-heading">
            <div>
              <span>RECORDS</span>
              <h2>My Inspection History</h2>
              <p>Track your submitted inspection reports.</p>
            </div>
          </div>

          {inspections.length > 0 ? (

            <div className="inspection-table-wrapper">
              <table className="inspection-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Condition</th>
                    <th>Review Status</th>
                  </tr>
                </thead>

                <tbody>
                  {inspections.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>
                          {item.equipment?.equipmentId || "N/A"}
                        </strong>
                        <span className="inspection-equipment-name">
                          {item.equipment?.name || "Equipment unavailable"}
                        </span>
                      </td>

                      <td>
                        {item.inspectionType?.replaceAll("_", " ")}
                      </td>

                      <td>
                        {item.inspectionDate
                          ? new Date(item.inspectionDate).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td>
                        <span
                          className={`inspection-condition ${getConditionClass(item.condition)}`}
                        >
                          {item.condition?.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            item.status === "REVIEWED"
                              ? "inspection-reviewed"
                              : "inspection-pending"
                          }
                        >
                          {item.status === "REVIEWED"
                            ? "REVIEWED"
                            : "AWAITING REVIEW"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : (
            <div className="inspection-empty">
              You haven't submitted any inspections yet.
            </div>
          )}

        </section>

      </main>

      <footer className="inspection-footer">
        Naval Fleet Maintenance Management Portal
      </footer>

    </div>
  );
}

export default Inspections;
