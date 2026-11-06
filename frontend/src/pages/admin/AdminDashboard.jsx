
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await API.get("/dashboard");
        setDashboard(response.data.dashboard);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const statistics = [
    { label: "Total Personnel", value: dashboard?.totalUsers ?? 0 },
    { label: "Officers", value: dashboard?.totalOfficers ?? 0 },
    { label: "Technicians", value: dashboard?.totalTechnicians ?? 0 },
    { label: "Active Equipment", value: dashboard?.totalEquipment ?? 0 },
    { label: "Reported Problems", value: dashboard?.totalProblems ?? 0 },
    { label: "Total Repairs", value: dashboard?.totalRepairs ?? 0 },
    { label: "Maintenance Records", value: dashboard?.totalMaintenance ?? 0 },
    { label: "Pending Repairs", value: dashboard?.pendingRepairs ?? 0 },
    { label: "Overdue Maintenance", value: dashboard?.overdueMaintenance ?? 0 },
    { label: "Unread Notifications", value: dashboard?.unreadNotifications ?? 0 }
  ];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>NFMMP</h2>
          <p>COMMAND CENTRE</p>
        </div>

        <nav>
          <a className="active" href="/admin">Overview</a>
          <a href="/admin/equipment">Equipment</a>
          <a href="/admin/users">Personnel</a>
          <a href="/admin/maintenance">Maintenance</a>
          <a href="/admin/repairs">Repairs</a>
          <a href="/admin/reports">Reports</a>
        </nav>

        <button onClick={logout}>Sign Out</button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span>FLEET MANAGEMENT / ADMIN</span>
            <h1>Command Overview</h1>
          </div>

          <div className="admin-profile">
            <span>COMMANDER</span>
            <strong>{user?.name}</strong>
          </div>
        </header>

        <section className="welcome-panel">
          <p>NAVAL FLEET MAINTENANCE MANAGEMENT PORTAL</p>
          <h2>Welcome aboard, {user?.name}</h2>
          <span>
            Monitor fleet readiness and maintenance activities.
          </span>
        </section>

        <section className="dashboard-placeholder">
          <h2>Fleet Overview</h2>

          {loading && <p>Loading fleet statistics...</p>}

          {!loading && error && (
            <p className="dashboard-error">{error}</p>
          )}

          {!loading && !error && dashboard && (
            <div className="stats-grid">
              {statistics.map((item) => (
                <div className="stat-card" key={item.label}>
                  <span>{item.label}</span>
                  <h3>{item.value}</h3>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
