import { useState } from "react";
import { findDepartment } from "../data";
import { triageSymptomsApi, createAppointmentApi } from "../api";

const slots = ["10:00", "10:20", "10:40", "11:00", "11:20", "11:40", "12:00"];
const FEE = 300;

function SymptomChecker({ user, departments, appointments, setAppointments }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [slot, setSlot] = useState("");
  const [card, setCard] = useState("");

  async function checkSymptoms() {
    if (text.trim() === "") return;
    const triage = await triageSymptomsApi(text, findDepartment, departments);
    setResult(triage);
    setSlot("");
  }

  // slots already booked for this department
  const taken = result
    ? appointments.filter((a) => a.department === result.department && a.status !== "Completed").map((a) => a.slot)
    : [];

  async function payAndBook() {
    const newAppointment = {
      id: "TC-" + (1001 + appointments.length),
      patient: user.name,
      phone: user.phone || "",
      problem: text,
      department: result.department,
      doctor: result.doctor,
      priority: result.priority,
      slot: slot,
      fee: FEE,
      paid: true,
      status: "Booked",
      bookedAt: "Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const saved = await createAppointmentApi(newAppointment);
    const finalAppointment = saved || newAppointment;
    setAppointments([...appointments, finalAppointment]);
    alert("Payment successful! Your appointment has been booked. Token: " + finalAppointment.id);
    setText("");
    setResult(null);
    setSlot("");
  }

  return (
    <div className="grid2">
      <div className="card">
        <h3>Describe your problem</h3>
        <textarea rows="5" value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Describe your symptoms or health concern..." />
        <button onClick={checkSymptoms}>Find Department</button>
      </div>

      <div className="card">
        <h3>Suggested Department</h3>
        {!result ? (
          <p className="muted">Enter your symptoms and click "Find Department".</p>
        ) : (
          <div>
            <div className="result">
              <b>{result.department}</b> - {result.doctor}
              <br />Priority: <span className={result.priority}>{result.priority}</span>
              {result.matched.length > 0 && <div className="muted">Matched words: {result.matched.join(", ")}</div>}
            </div>

            <b>Choose a time slot</b>
            <div className="slots">
              {slots.map((s) => (
                <button key={s} disabled={taken.includes(s)} className={slot === s ? "selected" : ""}
                  onClick={() => setSlot(s)}>{s}</button>
              ))}
            </div>

            <b>Consultation Fee: Rs. {FEE}</b>
            <input value={card} onChange={(e) => setCard(e.target.value)} placeholder="Card number or UPI ID" />
            <button disabled={slot === "" || card.trim() === ""} onClick={payAndBook}>Pay & Book Appointment</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomChecker;
