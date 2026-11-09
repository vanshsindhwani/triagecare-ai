import { useState } from "react";

function AdminDashboard({ departments, setDepartments, appointments = [], setAppointments }) {
  const [tab, setTab] = useState("bookings"); // "bookings" or "departments"
  const [name, setName] = useState("");
  const [doctor, setDoctor] = useState("");
  const [words, setWords] = useState("");

  // Filters for bookings
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const collected = appointments.filter((a) => a.paid).reduce((sum, a) => sum + (a.fee || 300), 0);
  const highCount = appointments.filter((a) => a.priority === "High").length;

  function changeDoctor(deptName, newDoctor) {
    setDepartments(departments.map((d) => (d.name === deptName ? { ...d, doctor: newDoctor } : d)));
  }

  function removeDepartment(deptName) {
    setDepartments(departments.filter((d) => d.name !== deptName));
  }

  function addDepartment() {
    if (name.trim() === "" || doctor.trim() === "") return;
    const keywords = words.split(",").map((w) => w.trim().toLowerCase()).filter((w) => w !== "");
    setDepartments([...departments, { name: name.trim(), doctor: doctor.trim(), words: keywords }]);
    setName("");
    setDoctor("");
    setWords("");
  }

  function updateBookingStatus(id, newStatus) {
    if (setAppointments) {
      setAppointments(appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    }
  }

  // Filter bookings
  const filteredBookings = appointments.filter((a) => {
    const matchesDept = deptFilter === "All" || a.department === deptFilter;
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      q === "" ||
      (a.patient && a.patient.toLowerCase().includes(q)) ||
      (a.id && a.id.toLowerCase().includes(q)) ||
      (a.problem && a.problem.toLowerCase().includes(q)) ||
      (a.doctor && a.doctor.toLowerCase().includes(q)) ||
      (a.department && a.department.toLowerCase().includes(q));
    return matchesDept && matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="stats">
        <div className="stat">
          <h1>{appointments.length}</h1>
          Total Bookings
        </div>
        <div className="stat">
          <h1 style={{ color: highCount > 0 ? "#dc2626" : undefined }}>{highCount}</h1>
          High Priority Cases
        </div>
        <div className="stat">
          <h1>{departments.length}</h1>
          Active Departments
        </div>
        <div className="stat">
          <h1 style={{ color: "#0f766e" }}>Rs. {collected}</h1>
          Total Revenue Collected
        </div>
      </div>

      <div className="tabs">
        <button
          className={tab === "bookings" ? "active" : ""}
          onClick={() => setTab("bookings")}
        >
          📋 All Bookings & Patient Registry ({appointments.length})
        </button>
        <button
          className={tab === "departments" ? "active" : ""}
          onClick={() => setTab("departments")}
        >
          🏥 Manage Departments & Doctors ({departments.length})
        </button>
      </div>

      {tab === "bookings" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, paddingBottom: 0, borderBottom: "none" }}>Hospital Patient Intake & Booking Records</h3>
            <span className="muted" style={{ fontSize: "13px" }}>
              Showing {filteredBookings.length} of {appointments.length} records
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Search by patient name, token ID, symptoms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ margin: 0, flex: "1 1 240px", padding: "9px 12px" }}
            />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ margin: 0, flex: "1 1 180px", padding: "9px 12px" }}
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ margin: 0, flex: "1 1 140px", padding: "9px 12px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {filteredBookings.length === 0 ? (
            <p className="muted" style={{ textAlign: "center", padding: "24px 0" }}>
              No booking records found matching current search/filters.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Booked By (Patient)</th>
                    <th>Symptoms / Problem</th>
                    <th>Department</th>
                    <th>Doctor</th>
                    <th>Slot</th>
                    <th>Priority</th>
                    <th>Fee</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((a) => (
                    <tr key={a.id}>
                      <td><b>{a.id}</b></td>
                      <td><b>{a.patient}</b></td>
                      <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.problem}>
                        {a.problem}
                      </td>
                      <td>{a.department}</td>
                      <td className="muted">{a.doctor}</td>
                      <td>{a.slot}</td>
                      <td>
                        <span className={a.priority}>{a.priority}</span>
                      </td>
                      <td>
                        <span style={{ color: "#166534", fontWeight: "600", fontSize: "13px" }}>
                          Rs. {a.fee || 300} {a.paid ? "✓" : ""}
                        </span>
                      </td>
                      <td>
                        <select
                          value={a.status}
                          onChange={(e) => updateBookingStatus(a.id, e.target.value)}
                          style={{ margin: 0, padding: "4px 8px", fontSize: "13px" }}
                        >
                          <option value="Booked">Booked</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => setSelectedBooking(a)}
                          style={{ padding: "5px 10px", fontSize: "12px", background: "#e6f4f1", color: "#0f766e", border: "1px solid #0f766e" }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "departments" && (
        <div className="grid2">
          <div className="card">
            <h3>Departments & Doctors</h3>
            <table>
              <thead>
                <tr><th>Department</th><th>Doctor</th><th>Action</th></tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.name}>
                    <td><b>{d.name}</b></td>
                    <td>
                      <input
                        value={d.doctor}
                        onChange={(e) => changeDoctor(d.name, e.target.value)}
                        style={{ margin: 0 }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => removeDepartment(d.name)}
                        style={{ background: "#fee2e2", color: "#b91c1c", padding: "6px 12px" }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Add Department</h3>
            <label>Department Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ophthalmology"
            />
            <label>Assigned Specialist Doctor</label>
            <input
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="e.g. Dr. Rajesh Gupta"
            />
            <label>Keywords for Semantic Triage (comma separated)</label>
            <input
              value={words}
              onChange={(e) => setWords(e.target.value)}
              placeholder="eye, vision, blurred, cataract, redness"
            />
            <button onClick={addDepartment}>Add Department</button>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "16px",
        }}>
          <div className="card" style={{ maxWidth: "520px", width: "100%", margin: 0 }}>
            <h3>Intake Record: {selectedBooking.id}</h3>
            <div style={{ margin: "16px 0", lineHeight: "1.8", fontSize: "14px" }}>
              <div><b>Booked By (Patient):</b> {selectedBooking.patient}</div>
              <div><b>Department:</b> {selectedBooking.department}</div>
              <div><b>Assigned Doctor:</b> {selectedBooking.doctor}</div>
              <div><b>Consultation Slot:</b> {selectedBooking.slot}</div>
              <div><b>Triage Urgency:</b> <span className={selectedBooking.priority}>{selectedBooking.priority}</span></div>
              <div><b>Payment:</b> Rs. {selectedBooking.fee || 300} (Paid)</div>
              <div><b>Booking Time:</b> {selectedBooking.bookedAt || "Recent"}</div>
              <div><b>Status:</b> {selectedBooking.status}</div>
              <div style={{ marginTop: "12px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <b>Reported Symptoms:</b>
                <p style={{ margin: "4px 0 0", color: "#334155" }}>{selectedBooking.problem}</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
