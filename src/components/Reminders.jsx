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
        <h3>Add Reminder</h3>
        <label>What to remember</label>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Example: Take BP medicine" />
        <label>Time</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <button onClick={addReminder}>Add</button>
        <p className="muted">A popup will appear at the set time while this page is open.</p>
      </div>

      <div className="card">
        <h3>My Reminders</h3>
        {mine.length === 0 ? <p className="muted">No reminders.</p> : (
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
