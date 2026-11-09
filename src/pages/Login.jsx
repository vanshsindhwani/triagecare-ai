import { useState } from "react";

function Login({ onLogin, departments = [] }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [selectedDept, setSelectedDept] = useState(departments[2]?.name || departments[0]?.name || "Neurology");

  // Get current doctor for selected department
  const currentDeptObj = departments.find((d) => d.name === selectedDept) || departments[0];

  function handleRoleChange(newRole) {
    setRole(newRole);
    if (newRole === "staff") {
      const dept = currentDeptObj || departments[0];
      if (dept) {
        setName(dept.doctor || "Doctor");
      }
    } else if (newRole === "admin") {
      if (!name) setName("Hospital Admin");
    }
  }

  function handleDeptChange(deptName) {
    setSelectedDept(deptName);
    const found = departments.find((d) => d.name === deptName);
    if (found) {
      setName(found.doctor);
    }
  }

  function handleLogin() {
    const finalName = name.trim();
    if (role === "patient" && finalName === "") {
      alert("Please enter your name");
      return;
    }

    if (role === "staff") {
      const docName = finalName || currentDeptObj?.doctor || "Doctor";
      onLogin({
        name: docName,
        role: "staff",
        department: selectedDept,
        doctor: docName,
      });
      return;
    }

    if (role === "admin") {
      onLogin({
        name: finalName || "Hospital Admin",
        role: "admin",
      });
      return;
    }

    onLogin({ name: finalName, role: "patient" });
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>TriageCare AI</h1>
        <p>Tell us what is wrong, and we will find the right doctor faster.</p>
        <ul>
          <li>Describe your symptoms in your own words</li>
          <li>Semantic AI symptom triage & department recommendation</li>
          <li>Doctor portal filtered strictly by specialty (e.g. Neurology)</li>
          <li>Comprehensive administrator intake & booking logs</li>
        </ul>
      </div>

      <div className="login-right">
        <div className="card login-box">
          <h2>Welcome</h2>
          <p className="muted">Login to continue</p>

          <label>Login as</label>
          <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
            <option value="patient">Patient / Caregiver</option>
            <option value="staff">Doctor / Specialist</option>
            <option value="admin">Hospital Administrator</option>
          </select>

          {role === "staff" && (
            <>
              <label>Specialization / Department</label>
              <select value={selectedDept} onChange={(e) => handleDeptChange(e.target.value)}>
                {departments.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.doctor})
                  </option>
                ))}
              </select>
              <p className="muted" style={{ fontSize: "12px", marginTop: "-8px", marginBottom: "12px" }}>
                🔒 Doctor privacy: You will only see patients triaged to <b>{selectedDept}</b>.
              </p>
            </>
          )}

          <label>{role === "staff" ? "Doctor Name" : "Name"}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={role === "staff" ? "e.g. Dr. Sandeep Kapoor" : role === "admin" ? "Hospital Admin" : "Enter your name"}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
}

export default Login;