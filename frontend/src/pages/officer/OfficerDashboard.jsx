
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import "./OfficerDashboard.css";

function OfficerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await API.get("/dashboard");
        setDashboard(response.data.dashboard || {});
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = [
    {
      title: "Total Equipment",
      value: dashboard.totalEquipment,
      icon: "⚙️"
    },
    {
      title: "Operational Equipment",
      value: dashboard.operationalEquipment,
      icon: "🟢"
    },
    {
      title: "Needs Inspection",
      value: dashboard.equipmentNeedingInspection,
      icon: "🔍"
    },
    {
      title: "Total Inspections",
      value: dashboard.totalInspections,
      icon: "📋"
    },
    {
      title: "Pending Inspections",
      value: dashboard.pendingInspections,
      icon: "⏳"
    },
    {
      title: "Total Problems",
      value: dashboard.totalProblems,
      icon: "⚠️"
    },
    {
      title: "Reported Problems",
      value: dashboard.reportedProblems,
      icon: "🚨"
    },
    {
      title: "Total Repairs",
      value: dashboard.totalRepairs,
      icon: "🛠️"
    },
    {
      title: "Awaiting Verification",
      value: dashboard.repairsAwaitingVerification,
      icon: "🔧"
    },
    {
      title: "Total Maintenance",
      value: dashboard.totalMaintenance,
      icon: "🗓️"
    },
    {
      title: "Overdue Maintenance",
      value: dashboard.overdueMaintenance,
      icon: "⏰"
    },
    {
      title: "Unread Notifications",
      value: dashboard.unreadNotifications,
      icon: "🔔"
    }
  ];

  return (
    <div className="officer-dashboard">

      {/* HEADER */}
      <header className="officer-header">

        <div>
          <h1>NFMMP</h1>
          <p>Naval Fleet Maintenance Management Portal</p>
        </div>

        <div className="officer-header-right">

          <span className="officer-role">
            OFFICER
          </span>

          <Link
            to="/officer/inspections"
            className="officer-nav-link"
          >
            Inspections
          </Link>

          <Link
            to="/officer/equipment"
            className="officer-nav-link"
          >
            Equipment
          </Link>

          <Link
            to="/officer/problems"
            className="officer-nav-link"
          >
            Problems
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="officer-logout"
          >
            Logout
          </button>

        </div>
      </header>

      {/* MAIN DASHBOARD */}
      <main className="officer-main">

        {/* WELCOME SECTION */}
        <section className="officer-welcome">

          <div>
            <p className="officer-subtitle">
              OFFICER CONTROL PANEL
            </p>

            <h2>
              Welcome, {user?.name || "Officer"}
            </h2>

            <p>
              Monitor equipment, inspections, problems and maintenance.
            </p>
          </div>

          <div className="officer-date">
            NAVAL FLEET MANAGEMENT
          </div>

        </section>

        {/* DASHBOARD HEADING */}
        <section className="officer-section-heading">
          <div>
            <h2>Dashboard Overview</h2>
            <p>Current fleet maintenance statistics</p>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <p className="officer-message">
            Loading dashboard data...
          </p>
        )}

        {/* ERROR */}
        {error && (
          <p className="officer-error">
            {error}
          </p>
        )}

        {/* STATISTICS */}
        {!loading && !error && (
          <section className="officer-stats-grid">

            {stats.map((item) => (
              <div
                className="officer-stat-card"
                key={item.title}
              >

                <div className="officer-stat-top">

                  <span className="officer-stat-icon">
                    {item.icon}
                  </span>

                  <span className="officer-stat-value">
                    {item.value ?? 0}
                  </span>

                </div>

                <h3>{item.title}</h3>

              </div>
            ))}

          </section>
        )}

        {/* RESPONSIBILITIES */}
        <section className="officer-info-panel">

          <h3>Officer Responsibilities</h3>

          <p>
            Review technician inspections, examine reported problems,
            coordinate repairs, and monitor equipment maintenance.
          </p>

        </section>

      </main>

    </div>
  );
}

export default OfficerDashboard;
