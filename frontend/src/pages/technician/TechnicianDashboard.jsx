
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "./TechnicianDashboard.css";

function TechnicianDashboard() {
  const { user, logout } = useAuth();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("ALL");

  const fetchAssignedEquipment = async () => {
    try {
      setLoading(true);

      const response = await API.get("/equipment");

      setEquipment(response.data.equipment || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load assigned equipment."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedEquipment();
  }, []);

  const getConditionClass = (condition) => {
    switch (condition) {
      case "OPERATIONAL":
        return "tech-condition-operational";
      case "NEEDS_INSPECTION":
        return "tech-condition-inspection";
      case "UNDER_MAINTENANCE":
        return "tech-condition-maintenance";
      case "NON_OPERATIONAL":
        return "tech-condition-nonoperational";
      default:
        return "";
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const searchText = `
      ${item.equipmentId}
      ${item.name}
      ${item.category}
      ${item.vesselReference}
    `.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesCondition =
      conditionFilter === "ALL" ||
      item.condition === conditionFilter;

    return matchesSearch && matchesCondition;
  });

  const activeCount = equipment.filter(
    (item) => item.isActive
  ).length;

  const inactiveCount = equipment.filter(
    (item) => !item.isActive
  ).length;

  const inspectionCount = equipment.filter(
    (item) => item.condition === "NEEDS_INSPECTION"
  ).length;

  return (
    <div className="technician-dashboard">

      {/* HEADER */}
      <header className="technician-header">
        <div>
          <span className="technician-eyebrow">
            NAVAL FLEET MAINTENANCE MANAGEMENT
          </span>

          <h1>Technician Dashboard</h1>

          <p>
            Welcome back, {user?.name || "Technician"}
          </p>
        </div>

<div className="technician-header-actions">

  <span className="technician-role-badge">
    TECHNICIAN
  </span>

  <Link
    to="/technician/inspections"
    className="technician-inspection-link"
  >
    My Inspections
  </Link>

  <Link
    to="/technician/problems"
    className="technician-inspection-link"
  >
    Report Problems
  </Link>

  <button
    className="technician-logout-btn"
    onClick={logout}
  >
    Logout
  </button>

</div>

      </header>

      <main className="technician-main">

        {/* SUMMARY CARDS */}
        <section className="technician-stats-grid">

          <div className="technician-stat-card">
            <span>Total Assigned Equipment</span>
            <h2>{equipment.length}</h2>
            <p>Equipment assigned to you</p>
          </div>

          <div className="technician-stat-card">
            <span>Active Equipment</span>
            <h2>{activeCount}</h2>
            <p>Currently active records</p>
          </div>

          <div className="technician-stat-card">
            <span>Inactive Equipment</span>
            <h2>{inactiveCount}</h2>
            <p>Assigned inactive records</p>
          </div>

          <div className="technician-stat-card">
            <span>Needs Inspection</span>
            <h2>{inspectionCount}</h2>
            <p>Equipment requiring inspection</p>
          </div>

        </section>

        {/* EQUIPMENT DIRECTORY */}
        <section className="technician-equipment-section">

          <div className="technician-section-heading">
            <div>
              <span>MY WORKSPACE</span>
              <h2>My Assigned Equipment</h2>
              <p>
                View all active and inactive equipment assigned to you.
              </p>
            </div>

            <button
              className="technician-refresh-btn"
              onClick={fetchAssignedEquipment}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="technician-error">
              {error}
            </div>
          )}

          <div className="technician-filters">
            <input
              type="text"
              placeholder="Search equipment ID, name, category or vessel..."
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

          {loading ? (
            <div className="technician-empty-state">
              Loading your assigned equipment...
            </div>
          ) : filteredEquipment.length > 0 ? (

            <div className="technician-equipment-grid">

              {filteredEquipment.map((item) => (

                <article
                  className="technician-equipment-card"
                  key={item._id}
                >

                  <div className="technician-card-top">
                    <span className="technician-equipment-id">
                      {item.equipmentId}
                    </span>

                    <span
                      className={
                        item.isActive
                          ? "technician-status-active"
                          : "technician-status-inactive"
                      }
                    >
                      {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <h3>{item.name}</h3>

                  <div className="technician-equipment-details">
                    <p>
                      <strong>Category:</strong> {item.category}
                    </p>

                    <p>
                      <strong>Vessel:</strong> {item.vesselReference}
                    </p>

                    <p>
                      <strong>Condition:</strong>
                      {" "}
                      <span
                        className={`technician-condition-badge ${getConditionClass(item.condition)}`}
                      >
                        {item.condition?.replaceAll("_", " ")}
                      </span>
                    </p>

                    <p>
                      <strong>Installation:</strong>
                      {" "}
                      {item.installationDate
                        ? new Date(item.installationDate).toLocaleDateString()
                        : "Not available"}
                    </p>

                    <p>
                      <strong>Next Maintenance:</strong>
                      {" "}
                      {item.nextMaintenanceDate
                        ? new Date(item.nextMaintenanceDate).toLocaleDateString()
                        : "Not scheduled"}
                    </p>
                  </div>

                  <div className="technician-card-footer">
                    <span>
                      {item.isActive
                        ? "Available equipment"
                        : "Inactive equipment"}
                    </span>
                  </div>

                </article>

              ))}

            </div>

          ) : (
            <div className="technician-empty-state">
              {equipment.length === 0
                ? "No equipment has been assigned to you yet."
                : "No equipment matches your search."}
            </div>
          )}

        </section>

      </main>

      <footer className="technician-footer">
        Naval Fleet Maintenance Management Portal
      </footer>

    </div>
  );
}

export default TechnicianDashboard;
