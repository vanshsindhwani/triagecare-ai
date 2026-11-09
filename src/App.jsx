import { useState, useEffect, useRef } from "react";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { defaultDepartments, load, save } from "./data";

function App() {
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState(load("departments", defaultDepartments));
  const [appointments, setAppointments] = useState(() => {
    const saved = load("appointments", []);
    return (saved || []).filter(
      (a) => !["Aarav Sharma", "Priya Patel", "Rajesh Kumar", "Simran Kaur", "Amit Verma"].includes(a.patient)
    );
  });
  const [logs, setLogs] = useState(load("logs", []));
  const [reminders, setReminders] = useState(load("reminders", []));
  const lastShown = useRef("");

  // save everything in localStorage whenever it changes
  useEffect(() => save("departments", departments), [departments]);
  useEffect(() => save("appointments", appointments), [appointments]);
  useEffect(() => save("logs", logs), [logs]);
  useEffect(() => save("reminders", reminders), [reminders]);

  // check reminders every 20 seconds (we can use Socket.IO for this later)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().toTimeString().slice(0, 5);
      reminders.forEach((r) => {
        const key = r.id + now;
        if (user && r.owner === user.name && r.time === now && !r.done && lastShown.current !== key) {
          lastShown.current = key;
          alert("Reminder: " + r.text);
        }
      });
    }, 20000);
    return () => clearInterval(timer);
  }, [reminders, user]);

  const [modalNotice, setModalNotice] = useState(null);

  // Safe non-blocking alert override for iframe environment
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      setModalNotice(String(msg));
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <>
      {modalNotice && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
        }}>
          <div className="card" style={{ maxWidth: "420px", width: "100%", margin: 0, textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3>Notification</h3>
            <p style={{ margin: "18px 0", fontSize: "15px", lineHeight: "1.5" }}>{modalNotice}</p>
            <button onClick={() => setModalNotice(null)}>OK</button>
          </div>
        </div>
      )}

      {!user ? (
        <Login onLogin={setUser} departments={departments} />
      ) : (
        <div>
          <div className="navbar">
            <h2>TriageCare AI</h2>
            <div>
              <span style={{ marginRight: "12px", fontWeight: "500" }}>
                {user.name} {user.department ? `(${user.department})` : `(${user.role})`}
              </span>
              <button onClick={() => setUser(null)}>Logout</button>
            </div>
          </div>
          <div className="container">
            {user.role === "patient" && (
              <PatientDashboard user={user} departments={departments} appointments={appointments}
                setAppointments={setAppointments} logs={logs} setLogs={setLogs}
                reminders={reminders} setReminders={setReminders} />
            )}
            {user.role === "staff" && (
              <StaffDashboard user={user} appointments={appointments} setAppointments={setAppointments} departments={departments} />
            )}
            {user.role === "admin" && (
              <AdminDashboard user={user} departments={departments} setDepartments={setDepartments} appointments={appointments} setAppointments={setAppointments} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
