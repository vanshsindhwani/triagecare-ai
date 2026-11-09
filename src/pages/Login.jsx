import { useState } from "react";

function Login({ onLogin, departments = [] }) {
  const [role, setRole] = useState("patient"); // "patient" | "staff" | "admin"

  // Patient State
  const [patientName, setPatientName] = useState("");

  // Doctor State
  const [selectedDept, setSelectedDept] = useState(departments[2]?.name || departments[0]?.name || "Neurology");
  const currentDeptObj = departments.find((d) => d.name === selectedDept) || departments[0];
  const [doctorName, setDoctorName] = useState(currentDeptObj?.doctor || "Dr. Sandeep Kapoor");
  const [staffId, setStaffId] = useState("DOC-NEURO-101");
  const [doctorPassword, setDoctorPassword] = useState("");

  // Admin State
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("");

  // Error State
  const [errorMsg, setErrorMsg] = useState("");

  function handleRoleChange(newRole) {
    setRole(newRole);
    setErrorMsg("");
    if (newRole === "staff") {
      const dept = currentDeptObj || departments[0];
      if (dept) {
        setDoctorName(dept.doctor);
        setStaffId(`DOC-${dept.name.slice(0, 5).toUpperCase()}-101`);
      }
    }
  }

  function handleDeptChange(deptName) {
    setSelectedDept(deptName);
    setErrorMsg("");
    const found = departments.find((d) => d.name === deptName);
    if (found) {
      setDoctorName(found.doctor);
      setStaffId(`DOC-${found.name.slice(0, 5).toUpperCase()}-101`);
    }
  }

  // Patient Login handler
  function handlePatientLogin() {
    if (patientName.trim() === "") {
      setErrorMsg("Please enter patient or caregiver name.");
      return;
    }
    setErrorMsg("");
    onLogin({
      name: patientName.trim(),
      role: "patient",
    });
  }

  // Authenticate Doctor
  function handleDoctorLogin() {
    if (!doctorName.trim()) {
      setErrorMsg("Doctor full name is required.");
      return;
    }
    if (!staffId.trim()) {
      setErrorMsg("Hospital Staff ID is required.");
      return;
    }
    if (!doctorPassword.trim()) {
      setErrorMsg("Please enter your doctor password.");
      return;
    }
    setErrorMsg("");
    onLogin({
      name: doctorName.trim(),
      role: "staff",
      department: selectedDept,
      doctor: doctorName.trim(),
      staffId: staffId.trim(),
    });
  }

  // Authenticate Admin
  function handleAdminLogin() {
    if (!adminUsername.trim()) {
      setErrorMsg("Administrator username is required.");
      return;
    }
    if (!adminPassword.trim()) {
      setErrorMsg("Administrator password is required.");
      return;
    }
    if (adminUsername.trim() !== "admin" || (adminPassword !== "admin123" && adminPassword !== "admin")) {
      setErrorMsg("Invalid administrator credentials. Access denied.");
      return;
    }
    setErrorMsg("");
    onLogin({
      name: "Hospital Administrator",
      role: "admin",
    });
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>TriageCare AI</h1>
        <p>AI-Powered Clinical Patient Portal & Semantic Symptom Triage System.</p>
        <ul>
          <li>Patient intake and free-text symptom triage</li>
          <li>Semantic clinical department and doctor routing</li>
          <li>Dedicated specialist dashboard with patient privacy protection</li>
          <li>Real-time appointment scheduling and vitals monitoring</li>
        </ul>
      </div>

      <div className="login-right">
        <div className="card login-box" style={{ maxWidth: "420px" }}>
          <h2>Portal Sign In</h2>
          <p className="muted" style={{ marginBottom: "14px" }}>Authenticate to access your account</p>

          <label>Select Role</label>
          <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
            <option value="patient">Patient / Caregiver</option>
            <option value="staff">Doctor / Medical Specialist</option>
            <option value="admin">Hospital Administrator</option>
          </select>

          {/* Error Message Alert */}
          {errorMsg && (
            <div style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "9px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "14px",
              border: "1px solid #fecaca",
            }}>
              {errorMsg}
            </div>
          )}

          {/* PATIENT LOGIN FLOW */}
          {role === "patient" && (
            <>
              <label>Patient Name</label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient or caregiver name"
                onKeyDown={(e) => e.key === "Enter" && handlePatientLogin()}
              />

              <div style={{ marginTop: "16px" }}>
                <button type="button" onClick={handlePatientLogin} style={{ width: "100%" }}>
                  Continue to Patient Portal
                </button>
              </div>
            </>
          )}

          {/* DOCTOR LOGIN FLOW */}
          {role === "staff" && (
            <>
              <label>Department / Specialty</label>
              <select value={selectedDept} onChange={(e) => handleDeptChange(e.target.value)}>
                {departments.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} — {d.doctor}
                  </option>
                ))}
              </select>

              <label>Doctor Full Name</label>
              <input
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Doctor name"
              />

              <label>Hospital Staff ID</label>
              <input
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Staff ID (e.g. DOC-NEURO-101)"
              />

              <label>Security Password</label>
              <input
                type="password"
                value={doctorPassword}
                onChange={(e) => setDoctorPassword(e.target.value)}
                placeholder="Enter account password"
                onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
              />

              <div style={{ marginTop: "16px" }}>
                <button type="button" onClick={handleDoctorLogin} style={{ width: "100%" }}>
                  Sign In to Doctor Portal
                </button>
              </div>
            </>
          )}

          {/* ADMIN LOGIN FLOW */}
          {role === "admin" && (
            <>
              <label>Administrator Username</label>
              <input
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Username"
              />

              <label>Administrator Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Password"
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />

              <div style={{ marginTop: "16px" }}>
                <button type="button" onClick={handleAdminLogin} style={{ width: "100%" }}>
                  Sign In as Administrator
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;