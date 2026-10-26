import { useState } from "react";

const units = { "Blood Pressure (systolic)": "mmHg", "Blood Sugar": "mg/dL", "Weight": "kg", "Temperature": "F" };

function HealthTracker({ user, logs, setLogs }) {
  const [type, setType] = useState("Blood Sugar");
  const [value, setValue] = useState("");

  const myLogs = logs.filter((l) => l.owner === user.name);
  const typeLogs = myLogs.filter((l) => l.type === type).slice(-7); // last 7 readings
  const maxValue = Math.max(...typeLogs.map((l) => Number(l.value)), 1);

  function addLog() {
    if (value === "") return;
    const newLog = { id: Date.now(), owner: user.name, type: type, value: value, date: new Date().toLocaleDateString() };
    setLogs([...logs, newLog]);
    setValue("");
  }

  return (
    <div className="grid2">
      <div className="card">
        <h3>Add Reading</h3>
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {Object.keys(units).map((u) => <option key={u}>{u}</option>)}
        </select>
        <label>Value ({units[type]})</label>
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        <button onClick={addLog}>Save</button>

        <h4>Last readings - {type}</h4>
        {typeLogs.length === 0 ? <p className="muted">No readings yet.</p> : (
          <div className="bars">
            {typeLogs.map((l) => (
              <div key={l.id} className="bar" style={{ height: (Number(l.value) / maxValue) * 100 + "%" }}>
                <span>{l.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>History</h3>
        {myLogs.length === 0 ? <p className="muted">Nothing recorded.</p> : (
          <table>
            <thead><tr><th>Date</th><th>Type</th><th>Value</th></tr></thead>
            <tbody>
              {[...myLogs].reverse().map((l) => (
                <tr key={l.id}><td>{l.date}</td><td>{l.type}</td><td>{l.value} {units[l.type]}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default HealthTracker;
