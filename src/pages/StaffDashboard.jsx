import { useState } from "react";

function StaffDashboard({ appointments, setAppointments, departments }) {
  const [filter, setFilter] = useState("All");

  const shown = appointments.filter((a) => filter === "All" || a.department === filter);
  const highCount = appointments.filter((a) => a.priority === "High").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;

  function updateStatus(id, status) {
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: status } : a)));
  }

  return (
    <div>
      <div className="stats">
        <div className="stat"><h1>{appointments.length}</h1>Total Requests</div>
        <div className="stat"><h1>{highCount}</h1>High Priority</div>
        <div className="stat"><h1>{completed}</h1>Completed</div>
      </div>

      <div className="card">
        <h3>Patient Requests</h3>
        <label>Filter by department</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          {departments.map((d) => <option key={d.name}>{d.name}</option>)}
        </select>

        {shown.length === 0 ? <p className="muted">No requests found.</p> : (
          <table>
            <thead>
              <tr><th>Token</th><th>Patient</th><th>Problem</th><th>Department</th><th>Slot</th><th>Priority</th><th>Status</th></tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td><td>{a.patient}</td><td>{a.problem}</td><td>{a.department}</td><td>{a.slot}</td>
                  <td className={a.priority}>{a.priority}</td>
                  <td>
                    <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                      <option>Booked</option><option>In Progress</option><option>Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StaffDashboard;
