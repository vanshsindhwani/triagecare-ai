import { useState, useEffect, useRef } from "react";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { defaultDepartments, load, save } from "./data";

function App() {
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState(load("departments", defaultDepartments));
  const [appointments, setAppointments] = useState(load("appointments", []));
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

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div>
      <div className="navbar">
        <h2>TriageCare AI</h2>
        <div>
          {user.name} ({user.role})
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
          <StaffDashboard appointments={appointments} setAppointments={setAppointments} departments={departments} />
        )}
        {user.role === "admin" && (
          <AdminDashboard departments={departments} setDepartments={setDepartments} appointments={appointments} />
        )}
      </div>
    </div>
  );
}

export default App;
