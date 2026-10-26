import { useState } from "react";

function AdminDashboard({ departments, setDepartments, appointments }) {
  const [name, setName] = useState("");
  const [doctor, setDoctor] = useState("");
  const [words, setWords] = useState("");

  const collected = appointments.filter((a) => a.paid).reduce((sum, a) => sum + a.fee, 0);

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

  return (
    <div>
      <div className="stats">
        <div className="stat"><h1>{departments.length}</h1>Departments</div>
        <div className="stat"><h1>{appointments.length}</h1>Appointments</div>
        <div className="stat"><h1>Rs. {collected}</h1>Collected (test mode)</div>
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Departments & Doctors</h3>
          <table>
            <thead><tr><th>Department</th><th>Doctor</th><th></th></tr></thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td><input value={d.doctor} onChange={(e) => changeDoctor(d.name, e.target.value)} /></td>
                  <td><button onClick={() => removeDepartment(d.name)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Add Department</h3>
          <label>Department name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label>Doctor name</label>
          <input value={doctor} onChange={(e) => setDoctor(e.target.value)} />
          <label>Keywords (comma separated)</label>
          <input value={words} onChange={(e) => setWords(e.target.value)} placeholder="eye, vision, blurred" />
          <button onClick={addDepartment}>Add</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
