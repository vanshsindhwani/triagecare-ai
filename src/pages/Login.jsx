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

  // Field-level errors state
  const [errors, setErrors] = useState({});

  function clearError(field) {
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  }

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
    setErrors({});
  }

  function handleDeptChange(deptName) {
    setSelectedDept(deptName);
    clearError("dept");
    clearError("auth");
  }

  // Patient step 1: Validate name and mobile number, then proceed to OTP verification
  function handleSendOtp() {
    const errs = {};
    const trimmed = patientName.trim();
    if (trimmed === "") {
      errs.name = "Please enter patient full name.";
    } else {
      const validNamePattern = /^[a-zA-Z\s.'-]{2,50}$/;
      if (!validNamePattern.test(trimmed)) {
        errs.name = "Please enter a valid patient name.";
      }
    }

    const cleanPhone = patientPhone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setPatientStep("otp");
    setOtpCode("");
    setResendTimer(30);
  }

  // Patient step 2: Verify OTP
  function handleVerifyOtp() {
    const entered = otpCode.trim();
    if (entered === "") {
      setErrors({ otp: "Please enter the 6-digit verification code." });
      return;
    }

    if (entered === "123456") {
      setErrors({});
      onLogin({
        name: patientName.trim(),
        phone: patientPhone.trim(),
        role: "patient",
      });
    } else {
      setErrors({ otp: "Invalid verification code. Please check the OTP sent to your mobile." });
    }
  }

  function handleResendOtp() {
    if (resendTimer > 0) return;
    setErrors({});
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
    const errs = {};
    if (!selectedDept) {
      errs.dept = "Please select a medical department.";
    }
    const rawDocName = doctorName.trim();
    if (!rawDocName) {
      errs.doctor = "Doctor name is required.";
    } else {
      const validDocPattern = /^[a-zA-Z\s.'-]{2,50}$/;
      if (!validDocPattern.test(cleanDocName(rawDocName))) {
        errs.doctor = "Please enter a valid doctor name.";
      }
    }

    if (!staffId.trim()) {
      errs.staffId = "Hospital Staff ID is required.";
    }
    if (!doctorPassword.trim()) {
      errs.password = "Doctor password is required.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Verify doctor against eligible hospital department roster
    const targetDept = departments.find((d) => d.name === selectedDept);
    const cleanedEntered = cleanDocName(rawDocName);
    const registeredCleaned = targetDept ? cleanDocName(targetDept.doctor) : "";

    if (cleanedEntered !== registeredCleaned || doctorPassword.trim() !== "doctor123") {
      setErrors({ auth: "Access denied: Invalid credentials or unauthorized department access." });
      return;
    }

    setErrors({});
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
    const errs = {};
    if (!adminUsername.trim()) {
      errs.adminUser = "Administrator username is required.";
    }
    if (!adminPassword.trim()) {
      errs.adminPass = "Administrator password is required.";
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (adminUsername.trim().toLowerCase() !== "admin" || adminPassword !== "admin123") {
      setErrors({ adminAuth: "Invalid administrator credentials. Access denied." });
      return;
    }

    setErrors({});
    onLogin({
      name: "Hospital Administrator",
      role: "admin",
    });
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>TriageCare AI</h1>
        <p>Intelligent Clinical Intake & Semantic Symptom Triage Portal</p>
        <ul>
          <li>Free-text symptom intake with automated department routing</li>
          <li>Clinical urgency assessment and specialist queuing</li>
          <li>Dedicated specialist dashboard with isolated department rosters</li>
          <li>Appointment scheduling, patient records, and vitals monitoring</li>
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

          {/* PATIENT LOGIN FLOW - STEP 1: NAME & PHONE */}
          {role === "patient" && patientStep === "details" && (
            <>
              <label>Patient Name</label>
              <input
                value={patientName}
                onChange={(e) => {
                  setPatientName(e.target.value);
                  clearError("name");
                }}
                placeholder="Patient full name"
                style={{
                  borderColor: errors.name ? "#dc2626" : undefined,
                  marginBottom: errors.name ? "4px" : "14px",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              />
              {errors.name && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px", marginTop: "-2px" }}>
                  {errors.name}
                </div>
              )}

              <label>Mobile Number</label>
              <div style={{
                display: "flex",
                alignItems: "stretch",
                margin: errors.phone ? "6px 0 4px" : "6px 0 14px",
              }}>
                <span style={{
                  background: "#e8f5f2",
                  color: "#0b5d56",
                  border: errors.phone ? "1.5px solid #dc2626" : "1.5px solid #c9d6d3",
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
                  onChange={(e) => {
                    setPatientPhone(e.target.value.replace(/\D/g, ""));
                    clearError("phone");
                  }}
                  placeholder="10-digit mobile number"
                  style={{
                    borderRadius: "0 8px 8px 0",
                    borderColor: errors.phone ? "#dc2626" : undefined,
                    margin: 0,
                    width: "100%",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                />
              </div>
              {errors.phone && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px", marginTop: "-2px" }}>
                  {errors.phone}
                </div>
              )}

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
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, ""));
                  clearError("otp");
                }}
                placeholder="------"
                style={{
                  textAlign: "center",
                  letterSpacing: "8px",
                  fontSize: "22px",
                  fontWeight: "700",
                  padding: "12px",
                  borderColor: errors.otp ? "#dc2626" : undefined,
                  marginBottom: errors.otp ? "4px" : "14px",
                }}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />
              {errors.otp && (
                <div style={{ color: "#dc2626", fontSize: "12px", textAlign: "center", marginBottom: "12px", marginTop: "-2px" }}>
                  {errors.otp}
                </div>
              )}

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
                    setErrors({});
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
              <select
                value={selectedDept}
                onChange={(e) => handleDeptChange(e.target.value)}
                style={{
                  borderColor: errors.dept ? "#dc2626" : undefined,
                  marginBottom: errors.dept ? "4px" : "14px",
                }}
              >
                <option value="">-- Select Department / Specialty --</option>
                {departments.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.dept && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px", marginTop: "-2px" }}>
                  {errors.dept}
                </div>
              )}

              <label>Doctor Name</label>
              <input
                value={doctorName}
                onChange={(e) => {
                  setDoctorName(e.target.value);
                  clearError("doctor");
                  clearError("auth");
                }}
                placeholder="Doctor name"
                style={{
                  borderColor: errors.doctor ? "#dc2626" : undefined,
                  marginBottom: errors.doctor ? "4px" : "14px",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
              />
              {errors.doctor && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px", marginTop: "-2px" }}>
                  {errors.doctor}
                </div>
              )}

              <label>Hospital Staff ID</label>
              <input
                value={staffId}
                onChange={(e) => {
                  setStaffId(e.target.value);
                  clearError("staffId");
                  clearError("auth");
                }}
                placeholder="Hospital staff ID"
                style={{
                  borderColor: errors.staffId ? "#dc2626" : undefined,
                  marginBottom: errors.staffId ? "4px" : "14px",
                }}
              />
              {errors.staffId && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px", marginTop: "-2px" }}>
                  {errors.staffId}
                </div>
              )}

              <label>Security Password</label>
              <input
                type="password"
                value={doctorPassword}
                onChange={(e) => {
                  setDoctorPassword(e.target.value);
                  clearError("password");
                  clearError("auth");
                }}
                placeholder="Enter password"
                style={{
                  borderColor: errors.password ? "#dc2626" : undefined,
                  marginBottom: errors.password ? "4px" : "14px",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleDoctorLogin()}
              />
              {errors.password && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px", marginTop: "-2px" }}>
                  {errors.password}
                </div>
              )}

              {errors.auth && (
                <div style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "12px",
                  border: "1px solid #fecaca",
                }}>
                  {errors.auth}
                </div>
              )}

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
                onChange={(e) => {
                  setAdminUsername(e.target.value);
                  clearError("adminUser");
                  clearError("adminAuth");
                }}
                placeholder="Enter admin username"
                style={{
                  borderColor: errors.adminUser ? "#dc2626" : undefined,
                  marginBottom: errors.adminUser ? "4px" : "14px",
                }}
              />
              {errors.adminUser && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px", marginTop: "-2px" }}>
                  {errors.adminUser}
                </div>
              )}

              <label>Administrator Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  clearError("adminPass");
                  clearError("adminAuth");
                }}
                placeholder="Enter admin password"
                style={{
                  borderColor: errors.adminPass ? "#dc2626" : undefined,
                  marginBottom: errors.adminPass ? "4px" : "14px",
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              />
              {errors.adminPass && (
                <div style={{ color: "#dc2626", fontSize: "12px", marginBottom: "12px", marginTop: "-2px" }}>
                  {errors.adminPass}
                </div>
              )}

              {errors.adminAuth && (
                <div style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  marginBottom: "12px",
                  border: "1px solid #fecaca",
                }}>
                  {errors.adminAuth}
                </div>
              )}

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