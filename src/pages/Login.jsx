import { useState } from "react";

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");

  function handleLogin() {
    if (name.trim() === "") {
      alert("Please enter your name");
      return;
    }
    onLogin({ name: name.trim(), role: role });
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>TriageCare AI</h1>
        <p>Tell us what is wrong, and we will find the right doctor faster.</p>
        <ul>
          <li>Describe your symptoms in your own words</li>
          <li>Get the right department suggested</li>
          <li>Book a slot and track your health</li>
        </ul>
      </div>

      <div className="login-right">
        <div className="card login-box">
          <h2>Welcome</h2>
          <p className="muted">Login to continue</p>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
          <label>Login as</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="patient">Patient / Caregiver</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default Login;