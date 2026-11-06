
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import "./Personnel.css";

function Personnel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "OFFICER"
  });

  // ==========================================
  // FETCH ALL PERSONNEL
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await API.get("/users");

      setUsers(response.data.users || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to load personnel."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // SEARCH PERSONNEL
  // ==========================================

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ==========================================
  // HANDLE FORM INPUTS
  // ==========================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // ==========================================
  // CREATE OFFICER / TECHNICIAN
  // ==========================================

  const handleCreateUser = async (e) => {
    e.preventDefault();

    setCreating(true);
    setFormMessage("");
    setFormError("");

    try {
      const response = await API.post(
        "/auth/create-user",
        formData
      );

      setFormMessage(response.data.message);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "OFFICER"
      });

      setShowForm(false);

      await fetchUsers();

    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Failed to create personnel."
      );
    } finally {
      setCreating(false);
    }
  };

  // ==========================================
  // ACTIVATE / DEACTIVATE ACCOUNT
  // ==========================================

  const toggleStatus = async (user) => {
    const newStatus = !user.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } ${user.name}'s account?`
    );

    if (!confirmed) return;

    try {
      await API.patch(`/users/${user._id}/status`, {
        isActive: newStatus
      });

      await fetchUsers();

    } catch (err) {
      window.alert(
        err.response?.data?.message ||
        "Unable to update account status."
      );
    }
  };

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div className="personnel-page">

      {/* PAGE HEADER */}

      <header className="personnel-header">
        <div>
          <span>FLEET MANAGEMENT / ADMIN</span>
          <h1>Personnel Management</h1>
          <p>Manage Officers and Technical Personnel.</p>
        </div>

        <Link to="/admin" className="back-dashboard">
          Back to Dashboard
        </Link>
      </header>

      {/* PERSONNEL DIRECTORY */}

      <section className="personnel-content">

        <div className="personnel-toolbar">
          <div>
            <h2>Personnel Directory</h2>
            <p>{users.length} registered personnel</p>
          </div>

          <div className="personnel-actions">
            <input
              type="text"
              placeholder="Search name, email or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              className="create-personnel-btn"
              onClick={() => {
                setShowForm(!showForm);
                setFormMessage("");
                setFormError("");
              }}
            >
              {showForm ? "Close Form" : "+ Add Personnel"}
            </button>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}

        {formMessage && (
          <div className="form-success">
            {formMessage}
          </div>
        )}

        {/* CREATE PERSONNEL FORM */}

        {showForm && (
          <div className="create-personnel-panel">

            <h2>Create New Personnel Account</h2>

            <p>
              Register a new Officer or Technical Personnel account.
            </p>

            <form onSubmit={handleCreateUser}>

              <div className="personnel-form-grid">

                <div className="form-group">
                  <label>Full Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>

                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    name="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    minLength={8}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Personnel Role</label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="OFFICER">Officer</option>
                    <option value="TECHNICIAN">Technician</option>
                  </select>
                </div>

              </div>

              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="submit-personnel-btn"
                disabled={creating}
              >
                {creating ? "Creating Account..." : "Create Account"}
              </button>

            </form>
          </div>
        )}

        {/* PERSONNEL TABLE */}

        {loading && <p>Loading personnel...</p>}

        {!loading && error && (
          <p className="personnel-error">{error}</p>
        )}

        {!loading && !error && (
          <div className="personnel-table-wrapper">

            <table className="personnel-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.length > 0 ? (

                  filteredUsers.map((user) => (

                    <tr key={user._id}>

                      <td>{user.name}</td>

                      <td>{user.email}</td>

                      <td>
                        <span className="role-label">
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            user.isActive
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="status-action"
                          onClick={() => toggleStatus(user)}
                        >
                          {user.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td colSpan="5">
                      No personnel found.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>
        )}

      </section>
    </div>
  );
}

export default Personnel;
