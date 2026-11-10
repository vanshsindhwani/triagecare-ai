import { useState } from "react";
import SymptomChecker from "../components/SymptomChecker";
import HealthTracker from "../components/HealthTracker";
import Reminders from "../components/Reminders";

function PatientDashboard(props) {
  const [tab, setTab] = useState("symptoms");
  const myAppointments = props.appointments.filter((a) => a.patient === props.user.name);

  return (
    <div>
      <div className="tabs">
        <button className={tab === "symptoms" ? "active" : ""} onClick={() => setTab("symptoms")}>Symptom Triage</button>
        <button className={tab === "appointments" ? "active" : ""} onClick={() => setTab("appointments")}>My Appointments ({myAppointments.length})</button>
        <button className={tab === "health" ? "active" : ""} onClick={() => setTab("health")}>Vitals & Health Tracker</button>
        <button className={tab === "reminders" ? "active" : ""} onClick={() => setTab("reminders")}>Medication Reminders</button>
      </div>

      {tab === "symptoms" && (
        <SymptomChecker user={props.user} departments={props.departments}
          appointments={props.appointments} setAppointments={props.setAppointments} />
      )}

      {tab === "appointments" && (
        <div className="card">
          <h3>My Appointments</h3>
          {myAppointments.length === 0 ? (
            <p className="muted">No appointments yet.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Token</th><th>Department</th><th>Doctor</th><th>Slot</th><th>Priority</th><th>Status</th></tr>
              </thead>
              <tbody>
                {myAppointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td><td>{a.department}</td><td>{a.doctor}</td><td>{a.slot}</td>
                    <td className={a.priority}>{a.priority}</td><td>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "health" && <HealthTracker user={props.user} logs={props.logs} setLogs={props.setLogs} />}
      {tab === "reminders" && <Reminders user={props.user} reminders={props.reminders} setReminders={props.setReminders} />}
    </div>
  );
}

export default PatientDashboard;
