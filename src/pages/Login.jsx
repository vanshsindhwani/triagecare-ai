import { useState, useEffect } from "react";

function Login({ onLogin, departments = [] }) {
  const [role, setRole] = useState("patient"); // "patient" | "staff" | "admin"

  // Patient State - empty by default
  const [patientStep, setPatientStep] = useState("details"); // "details" | "otp"
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Doctor State - empty by default
  const [selectedDept, setSelectedDept] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [doctorPassword, setDoctorPassword] = useState("");

  // Admin State - empty by default
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Error State
  const [errorMsg, setErrorMsg] = useState("");

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  function handleRoleChange(newRole) {
    setRole(newRole);
    setPatientStep("details");
    setOtpCode("");
    setErrorMsg("");
  }

  function handleDeptChange(deptName) {
    setSelectedDept(deptName);
    setErrorMsg("");
  }

  // Patient step 1: Validate name and mobile number, then proceed to OTP verification
  function handleSendOtp() {
    const trimmed = patientName.trim();
    if (trimmed === "") {
      setErrorMsg("Please enter patient or caregiver name.");
      return;
    }

    // Reject numbers like 123, pure symbols, or 1-letter entries
    const validNamePattern = /^[a-zA-Z\s.'-]{2,50}$/;
    if (!validNamePattern.test(trimmed)) {
      setErrorMsg("Please enter a valid patient name.");
      return;
    }

    const cleanPhone = patientPhone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setErrorMsg("");
    setPatientStep("otp");
    setOtpCode("");
    setResendTimer(30);
  }

  // Patient step 2: Verify OTP
  function handleVerifyOtp() {
    const entered = otpCode.trim();
    if (entered === "") {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    if (entered === "123456") {
      setErrorMsg("");
      onLogin({
        name: patientName.trim(),
        phone: patientPhone.trim(),
        role: "patient",
      });
    } else {
      setErrorMsg("Invalid verification code. Please check the OTP sent to your mobile.");
    }
  }

  function handleResendOtp() {
    if (resendTimer > 0) return;
    setErrorMsg("");
    setResendTimer(30);
  }

  // Helper to normalize doctor name for comparison
  function cleanDocName(str) {
    if (!str) return "";
    return str
      .trim()
      .replace(/^(dr\.?|doctor)\s+/i, "")
      .trim()
      .toLowerCase();
  }

  // Authenticate Doctor - strictly only eligible doctors registered by hospital/admin
  function handleDoctorLogin() {
    if (!selectedDept) {
      setErrorMsg("Please select a medical department.");
      return;
    }
    const rawDocName = doctorName.trim();
    if (!rawDocName) {
      setErrorMsg("Doctor name is required.");
      return;
    }
    const cleanedEntered = cleanDocName(rawDocName);
    const validDocPattern = /^[a-zA-Z\s.'-]{2,50}$/;
    if (!validDocPattern.test(cleanedEntered)) {
      setErrorMsg("Please enter a valid doctor name.");
      return;
    }

    // Verify doctor against eligible hospital department roster
    const targetDept = departments.find((d) => d.name === selectedDept);
    if (!targetDept) {
      setErrorMsg("Selected department is not recognized.");
      return;
    }

    const registeredCleaned = cleanDocName(targetDept.doctor);
    if (cleanedEntered !== registeredCleaned) {
      setErrorMsg("Access denied: Invalid credentials or unauthorized department access.");
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
    if (doctorPassword.trim() !== "doctor123" && doctorPassword.trim() !== "doctor") {
      setErrorMsg("Invalid password. Please enter your authorized doctor password.");
      return;
    }

    setErrorMsg("");
    onLogin({
      name: targetDept.doctor,
      role: "staff",
      department: selectedDept,
      doctor: targetDept.doctor,
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
    if (adminUsername.trim().toLowerCase() !== "admin" || (adminPassword !== "admin123" && adminPassword !== "admin")) {
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

          {/* PATIENT LOGIN FLOW - STEP 1: NAME & PHONE */}
          {role === "patient" && patientStep === "details" && (
            <>
              <label>Patient Name</label>
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient full name"
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />

              <label>Mobile Number</label>
              <div style={{
                display: "flex",
                alignItems: "stretch",
                margin: "6px 0 14px",
              }}>
                <span style={{
                  background: "#e8f5f2",
                  color: "#0b5d56",
                  border: "1.5px solid #c9d6d3",
                  borderRight: "none",
                  borderRadius: "8px 0 0 8px",
                  padding: "10px 14px",
                  fontWeight: "700",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  userSelect: "none",
                }}>
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  style={{
                    borderRadius: "0 8px 8px 0",
                    margin: 0,
                    width: "100%",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                />
              </div>

              <div style={{ marginTop: "16px" }}>
                <button type="button" onClick={handleSendOtp} style={{ width: "100%" }}>
                  Send Verification OTP
                </button>
              </div>
            </>
          )}

          {/* PATIENT LOGIN FLOW - STEP 2: ENTER OTP */}
          {role === "patient" && patientStep === "otp" && (
            <>
              <div style={{
                textAlign: "center",
                padding: "8px 0 16px",
              }}>
                <div style={{ fontSize: "14px", color: "#334155", marginBottom: "4px" }}>
                  Verification code sent to
                </div>
                <div style={{ fontWeight: "700", color: "#0f766e", fontSize: "16px" }}>
                  +91 {patientPhone}
                </div>
              </div>

              <label style={{ textAlign: "center", display: "block" }}>Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="------"
                style={{
                  textAlign: "center",
                  letterSpacing: "8px",
                  fontSize: "22px",
                  fontWeight: "700",
                  padding: "12px",
                }}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />

              <div style={{ marginTop: "14px" }}>
                <button type="button" onClick={handleVerifyOtp} style={{ width: "100%" }}>
                  Verify & Sign In
                </button>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "16px",
                fontSize: "13px",
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setPatientStep("details");
                    setErrorMsg("");
                  }}
                  style={{
                    background: "transparent",
                    color: "#0f766e",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Edit Number
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={handleResendOtp}
                  style={{
                    background: "transparent",
                    color: resendTimer > 0 ? "#94a3b8" : "#0f766e",
                    border: "none",
                    padding: 0,
                    cursor: resendTimer > 0 ? "default" : "pointer",
                    textDecoration: resendTimer > 0 ? "none" : "underline",
                  }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}

          {/* DOCTOR LOGIN FLOW */}
          {role === "staff" && (
            <>
              <label>Department / Specialty</label>
              <select value={selectedDept} onChange={(e) => handleDeptChange(e.target.value)}>
                <option value="">-- Select Department / Specialty --</option>
                {departments.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <label>Doctor Name</label>
              <input
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Doctor name"
                onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
              />

              <label>Hospital Staff ID</label>
              <input
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Hospital staff ID"
              />

              <label>Security Password</label>
              <input
                type="password"
                value={doctorPassword}
                onChange={(e) => setDoctorPassword(e.target.value)}
                placeholder="Enter password"
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
                placeholder="Enter admin username"
              />

              <label>Administrator Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
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