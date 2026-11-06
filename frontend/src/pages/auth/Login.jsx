
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import shipBackground from "../../assets/images/INS_Mumbai_(D62)_at_sea.jpg";
import garudaLogo from "../../assets/images/garuda-logo.png";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      login(user, token);

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "OFFICER") {
        navigate("/officer");
      } else if (user.role === "TECHNICIAN") {
        navigate("/technician");
      } else {
        setError("Invalid user role.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `linear-gradient(
          rgba(5, 15, 28, 0.40),
          rgba(5, 15, 28, 0.60)
        ), url("${shipBackground}")`,
      }}
    >
      <div className="login-card">
        <img src={garudaLogo} alt="NFMMP Garuda Logo" />

        <h1>NFMMP</h1>

        <p>Naval Fleet Maintenance Management Portal</p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>

        <span>Authorized Personnel Only</span>
      </div>
    </div>
  );
}

export default Login;
