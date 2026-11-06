
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "./Equipment.css";

const initialForm = {
  equipmentId: "",
  name: "",
  category: "",
  vesselReference: "",
  description: "",
  specifications: "",
  installationDate: "",
  lastMaintenanceDate: "",
  nextMaintenanceDate: ""
};

function Equipment() {
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";
  const dashboardPath = isAdmin ? "/admin" : "/officer";

  const [equipment, setEquipment] = useState([]);
  const [formData, setFormData] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusUpdating, setStatusUpdating] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("ALL");

  // Technician assignment states
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignmentEquipment, setAssignmentEquipment] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState([]);
  const [technicianLoading, setTechnicianLoading] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  // Fetch equipment
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/equipment");
      setEquipment(response.data.equipment || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load equipment records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Register equipment
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setFormError("");
    setSuccess("");

    try {
      const response = await API.post("/equipment", {
        ...formData,
        lastMaintenanceDate: formData.lastMaintenanceDate || null,
        nextMaintenanceDate: formData.nextMaintenanceDate || null
      });

      setSuccess(
        response.data.message || "Equipment registered successfully!"
      );

      setFormData(initialForm);
      setShowForm(false);

      await fetchEquipment();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Equipment registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Activate / Deactivate equipment
  const handleStatusChange = async (item) => {
    const newStatus = !item.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } ${item.name}?`
    );

    if (!confirmed) return;

    try {
      setStatusUpdating(item._id);
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/equipment/${item._id}/status`,
        { isActive: newStatus }
      );

      setSuccess(
        response.data.message ||
        `Equipment ${newStatus ? "activated" : "deactivated"} successfully!`
      );

      await fetchEquipment();
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
        "Unable to update equipment status."
      );
    } finally {
      setStatusUpdating("");
    }
  };

  // Open Technician Assignment
  const openAssignment = async (item) => {
    setAssignmentEquipment(item);
    setAssignmentError("");
    setTechnicians([]);
    setShowAssignment(true);

    const existingIds = (item.assignedTechnicians || []).map(
      (technician) =>
        typeof technician === "object"
          ? technician._id
          : technician
    );

    setSelectedTechnicianIds(existingIds);

    try {
      setTechnicianLoading(true);

      const response = await API.get("/users/technicians");
      setTechnicians(response.data.technicians || []);
    } catch (err) {
      setAssignmentError(
        err.response?.data?.message ||
        "Unable to load active Technicians."
      );
    } finally {
      setTechnicianLoading(false);
    }
  };

  // Select / Deselect Technician
  const handleTechnicianSelection = (technicianId) => {
    setSelectedTechnicianIds((previous) =>
      previous.includes(technicianId)
        ? previous.filter((id) => id !== technicianId)
        : [...previous, technicianId]
    );
  };

  // Save Technician Assignment
  const handleAssignmentSubmit = async () => {
    if (!assignmentEquipment) return;

    if (selectedTechnicianIds.length === 0) {
      setAssignmentError(
        "Please select at least one Technician."
      );
      return;
    }

    try {
      setAssignmentSaving(true);
      setAssignmentError("");

      const response = await API.patch(
        `/equipment/${assignmentEquipment._id}/assign-technicians`,
        {
          technicianIds: selectedTechnicianIds
        }
      );

      setSuccess(
        response.data.message ||
        "Technicians assigned successfully!"
      );

      setShowAssignment(false);
      setAssignmentEquipment(null);
      setSelectedTechnicianIds([]);

      await fetchEquipment();
    } catch (err) {
      setAssignmentError(
        err.response?.data?.message ||
        "Unable to assign Technicians."
      );
    } finally {
      setAssignmentSaving(false);
    }
  };

  // Search and filter
  const filteredEquipment = equipment.filter((item) => {
    const searchText =
      `${item.equipmentId} ${item.name} ${item.category} ${item.vesselReference}`
        .toLowerCase();

    const matchesSearch = searchText.includes(
      search.toLowerCase()
    );

    const matchesCondition =
      conditionFilter === "ALL" ||
      item.condition === conditionFilter;

    return matchesSearch && matchesCondition;
  });

  // Condition styling
  const getConditionClass = (condition) => {
    switch (condition) {
      case "OPERATIONAL":
        return "condition-operational";

      case "NEEDS_INSPECTION":
        return "condition-inspection";

      case "UNDER_MAINTENANCE":
        return "condition-maintenance";

      case "NON_OPERATIONAL":
        return "condition-nonoperational";

      default:
        return "";
    }
  };

  return (
    <div className="equipment-page">

      {/* Header */}
      <header className="equipment-header">
        <div>
          <span>
            FLEET MANAGEMENT / {isAdmin ? "ADMIN" : "OFFICER"}
          </span>

          <h1>Equipment Management</h1>

          <p>Register and monitor fleet equipment.</p>
        </div>

        <Link to={dashboardPath} className="equipment-back">
          Back to Dashboard
        </Link>
      </header>

      <section className="equipment-content">

        {/* Toolbar */}
        <div className="equipment-toolbar">
          <div>
            <h2>Equipment Directory</h2>
            <p>
              {equipment.filter((item) => item.isActive).length}
              {" "}active equipment records
            </p>
          </div>

          <button
            type="button"
            className="add-equipment-btn"
            onClick={() => {
              setShowForm(!showForm);
              setFormError("");
              setSuccess("");
            }}
          >
            {showForm ? "Close Form" : "+ Register Equipment"}
          </button>
        </div>

        {success && (
          <div className="equipment-success">{success}</div>
        )}

        {error && (
          <div className="equipment-error">{error}</div>
        )}

        {/* Registration Form */}
        {showForm && (
          <div className="equipment-form-panel">
            <h2>Register New Equipment</h2>
            <p>Enter the equipment details for fleet registration.</p>

            <form onSubmit={handleSubmit}>
              <div className="equipment-form-grid">

                <div className="equipment-field">
                  <label>Equipment ID *</label>
                  <input
                    name="equipmentId"
                    value={formData.equipmentId}
                    onChange={handleChange}
                    placeholder="Example: EQ-001"
                    required
                  />
                </div>

                <div className="equipment-field">
                  <label>Equipment Name *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter equipment name"
                    required
                  />
                </div>

                <div className="equipment-field">
                  <label>Category *</label>
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Enter category"
                    required
                  />
                </div>

                <div className="equipment-field">
                  <label>Vessel Reference *</label>
                  <input
                    name="vesselReference"
                    value={formData.vesselReference}
                    onChange={handleChange}
                    placeholder="Example: Training Vessel A"
                    required
                  />
                </div>

                <div className="equipment-field full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the equipment"
                    rows="3"
                    required
                  />
                </div>

                <div className="equipment-field full-width">
                  <label>Specifications</label>
                  <textarea
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                    placeholder="Enter specifications (optional)"
                    rows="3"
                  />
                </div>

                <div className="equipment-field">
                  <label>Installation Date *</label>
                  <input
                    type="date"
                    name="installationDate"
                    value={formData.installationDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="equipment-field">
                  <label>Last Maintenance Date</label>
                  <input
                    type="date"
                    name="lastMaintenanceDate"
                    value={formData.lastMaintenanceDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="equipment-field">
                  <label>Next Maintenance Date</label>
                  <input
                    type="date"
                    name="nextMaintenanceDate"
                    value={formData.nextMaintenanceDate}
                    onChange={handleChange}
                    min={formData.installationDate || undefined}
                  />
                </div>

              </div>

              {formError && (
                <div className="equipment-error">{formError}</div>
              )}

              <button
                type="submit"
                className="submit-equipment-btn"
                disabled={submitting}
              >
                {submitting ? "Registering..." : "Register Equipment"}
              </button>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="equipment-filters">
          <input
            type="text"
            placeholder="Search ID, name, category or vessel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
          >
            <option value="ALL">All Conditions</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="NEEDS_INSPECTION">Needs Inspection</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="NON_OPERATIONAL">Non-Operational</option>
          </select>
        </div>

        {/* Equipment Table */}
        {loading ? (
          <p className="equipment-loading">
            Loading equipment records...
          </p>
        ) : (
          <div className="equipment-table-wrapper">
            <table className="equipment-table">

              <thead>
                <tr>
                  <th>Equipment ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Vessel</th>
                  <th>Condition</th>
                  <th>Assigned Technicians</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEquipment.length > 0 ? (
                  filteredEquipment.map((item) => (
                    <tr key={item._id}>
                      <td>{item.equipmentId}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.vesselReference}</td>

                      <td>
                        <span
                          className={`condition-badge ${getConditionClass(item.condition)}`}
                        >
                          {item.condition?.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td>
                        {item.assignedTechnicians?.length > 0 ? (
                          <div className="assigned-technician-list">
                            {item.assignedTechnicians.map((technician) => (
                              <span key={technician._id || technician}>
                                {technician.name || "Technician"}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="no-technician">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            item.isActive
                              ? "equipment-active"
                              : "equipment-inactive"
                          }
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="equipment-action-buttons">

                          <button
                            type="button"
                            className="assign-technician-btn"
                            onClick={() => openAssignment(item)}
                          >
                            Assign
                          </button>

                          <button
                            type="button"
                            className="status-toggle-btn"
                            onClick={() => handleStatusChange(item)}
                            disabled={statusUpdating === item._id}
                          >
                            {statusUpdating === item._id
                              ? "Updating..."
                              : item.isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">
                      No equipment records found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}
      </section>

      {/* Technician Assignment Modal */}
      {showAssignment && (
        <div className="assignment-modal-overlay">
          <div className="assignment-modal">

            <div className="assignment-modal-header">
              <div>
                <span>FLEET MANAGEMENT</span>
                <h2>Assign Technicians</h2>
                <p>
                  Equipment: {assignmentEquipment?.name}
                  {" "}({assignmentEquipment?.equipmentId})
                </p>
              </div>

              <button
                type="button"
                className="assignment-close-btn"
                onClick={() => {
                  setShowAssignment(false);
                  setAssignmentEquipment(null);
                  setAssignmentError("");
                }}
              >
                ×
              </button>
            </div>

            <div className="assignment-modal-body">
              <p className="assignment-instruction">
                Select one or more active Technicians for this equipment.
              </p>

              {assignmentError && (
                <div className="equipment-error">
                  {assignmentError}
                </div>
              )}

              {technicianLoading ? (
                <p className="equipment-loading">
                  Loading active Technicians...
                </p>
              ) : technicians.length > 0 ? (
                <div className="technician-selection-list">
                  {technicians.map((technician) => (
                    <label
                      className="technician-selection-item"
                      key={technician._id}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTechnicianIds.includes(
                          technician._id
                        )}
                        onChange={() =>
                          handleTechnicianSelection(technician._id)
                        }
                      />

                      <div>
                        <strong>{technician.name}</strong>
                        <span>{technician.email}</span>
                      </div>

                      <span className="technician-role">
                        TECHNICIAN
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                !assignmentError && (
                  <p className="no-technician-message">
                    No active Technicians found. Create or activate a
                    Technician account first.
                  </p>
                )
              )}

              <p className="selected-technician-count">
                Selected Technicians: {selectedTechnicianIds.length}
              </p>
            </div>

            <div className="assignment-modal-footer">
              <button
                type="button"
                className="assignment-cancel-btn"
                onClick={() => {
                  setShowAssignment(false);
                  setAssignmentEquipment(null);
                  setAssignmentError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="assignment-save-btn"
                onClick={handleAssignmentSubmit}
                disabled={
                  assignmentSaving ||
                  technicianLoading ||
                  technicians.length === 0
                }
              >
                {assignmentSaving
                  ? "Saving..."
                  : "Save Assignment"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Equipment;
