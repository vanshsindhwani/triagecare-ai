import { useState } from "react";
import { updateAppointmentStatusApi } from "../api";

function StaffDashboard({ user, appointments, setAppointments }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const doctorDept = user?.department;

  // STRICT FILTER: Doctor only sees patients assigned to their department
  const doctorAppointments = doctorDept
    ? appointments.filter((a) => a.department === doctorDept)
    : appointments;

  const filteredAppointments = doctorAppointments.filter((a) => {
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      a.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.problem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const highCount = doctorAppointments.filter((a) => a.priority === "High").length;
  const completedCount = doctorAppointments.filter((a) => a.status === "Completed").length;

  function updateStatus(id, newStatus) {
    updateAppointmentStatusApi(id, newStatus);
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#0f766e", fontWeight: "700" }}>
              {doctorDept ? `${doctorDept} Specialist Clinic` : "Specialist Clinic"}
            </h2>
            <div style={{ marginTop: "4px", fontSize: "13px", color: "#64748b" }}>
              Attending Specialist: <b>{user?.name || "Specialist"}</b> {user?.staffId ? `• Staff ID: ${user.staffId}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{
              background: "#e6f4f1",
              color: "#0f766e",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              border: "1px solid #cce8e2",
            }}>
              {doctorDept || "Clinical Service"}
            </span>
          </div>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <h1>{doctorAppointments.length}</h1>
          Assigned Patients
        </div>
        <div className="stat">
          <h1 style={{ color: highCount > 0 ? "#dc2626" : undefined }}>{highCount}</h1>
          High Urgency Cases
        </div>
        <div className="stat">
          <h1 style={{ color: "#15803d" }}>{completedCount}</h1>
          Completed Consultations
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
          <h3 style={{ margin: 0, paddingBottom: 0, borderBottom: "none" }}>Department Consultation Queue</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search patient, token, symptoms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ margin: 0, width: "230px", padding: "8px 10px" }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ margin: 0, width: "140px", padding: "8px 10px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <p className="muted" style={{ textAlign: "center", padding: "20px 0" }}>
            {doctorAppointments.length === 0
              ? `No patients currently registered for ${doctorDept}.`
              : "No patient matches your search or status filter."}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Reported Symptoms</th>
                <th>Slot</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.id}</b></td>
                  <td><b>{a.patient}</b></td>
                  <td style={{ maxWidth: "280px" }}>{a.problem}</td>
                  <td>{a.slot}</td>
                  <td>
                    <span className={a.priority}>{a.priority}</span>
                  </td>
                  <td>
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      style={{ padding: "4px 8px" }}
                    >
                      <option value="Booked">Booked</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    {a.status !== "Completed" ? (
                      <button
                        onClick={() => updateStatus(a.id, "Completed")}
                        style={{ padding: "6px 12px", fontSize: "12px", background: "#0b5d56" }}
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="muted" style={{ fontSize: "12px" }}>✓ Done</span>
                    )}
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
