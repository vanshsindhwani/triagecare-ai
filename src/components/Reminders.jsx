import { useState } from "react";
import { addReminderApi, toggleReminderApi, deleteReminderApi } from "../api";

function Reminders({ user, reminders, setReminders }) {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");

  const mine = reminders.filter((r) => r.owner === user.name);

  function addReminder() {
    if (text.trim() === "" || time === "") return;
    const newReminder = { id: Date.now(), owner: user.name, text: text, time: time, done: false };
    addReminderApi(newReminder);
    setReminders([...reminders, newReminder]);
    setText("");
    setTime("");
  }

  function toggleDone(id) {
    const target = reminders.find((r) => r.id === id);
    if (target) {
      toggleReminderApi(id, !target.done);
    }
    setReminders(reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  }

  function deleteReminder(id) {
    deleteReminderApi(id);
    setReminders(reminders.filter((r) => r.id !== id));
  }

  return (
    <div className="grid2">
      <div className="card">
        <h3>Schedule Medication Reminder</h3>
        <label>Medication / Clinical Task</label>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Medication or health task" />
        <label>Scheduled Time</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <button onClick={addReminder}>Save Reminder</button>
        <p className="muted">Active patient alert notifications trigger automatically at the scheduled time.</p>
      </div>

      <div className="card">
        <h3>Active Medication Schedule</h3>
        {mine.length === 0 ? <p className="muted">No active medication reminders scheduled.</p> : (
          <table>
            <tbody>
              {mine.map((r) => (
                <tr key={r.id}>
                  <td><input type="checkbox" checked={r.done} onChange={() => toggleDone(r.id)} /></td>
                  <td style={{ textDecoration: r.done ? "line-through" : "none" }}>{r.text}</td>
                  <td>{r.time}</td>
                  <td><button onClick={() => deleteReminder(r.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Reminders;
