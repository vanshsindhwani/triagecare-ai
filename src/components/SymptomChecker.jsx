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

  const [errorMsg, setErrorMsg] = useState("");

  async function checkSymptoms() {
    if (text.trim() === "") {
      setErrorMsg("Please enter a description of your health concern.");
      return;
    }
    setErrorMsg("");
    const triage = await triageSymptomsApi(text, findDepartment, departments);
    if (triage.error) {
      setErrorMsg(triage.error);
      setResult(null);
    } else {
      setResult(triage);
      setSlot("");
    }
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
        <h3>Clinical Symptom Intake</h3>
        <textarea
          rows="5"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (errorMsg) setErrorMsg("");
          }}
          placeholder="Describe your symptoms or health concern..."
          style={{ borderColor: errorMsg ? "#dc2626" : undefined }}
        />
        {errorMsg && (
          <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px", marginTop: "-4px" }}>
            {errorMsg}
          </div>
        )}
        <button onClick={checkSymptoms}>Triage Symptoms</button>
      </div>

      <div className="card">
        <h3>Triage Assessment & Allocation</h3>
        {!result ? (
          <p className="muted">Enter your symptoms and click "Triage Symptoms".</p>
        ) : (
          <div>
            <div className="result">
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#0b5d56" }}>
                {result.department}
              </div>
              <div style={{ fontSize: "14px", marginTop: "2px", color: "#334155" }}>
                Assigned Specialist: <b>{result.doctor}</b>
              </div>
              <div style={{ marginTop: "6px", fontSize: "13px" }}>
                Triage Urgency: <span className={result.priority}>{result.priority}</span>
              </div>
              {result.matched.length > 0 && (
                <div className="muted" style={{ marginTop: "6px", fontSize: "12px" }}>
                  Clinical Indicators: {result.matched.join(", ")}
                </div>
              )}
            </div>

            <b>Select Consultation Slot</b>
            <div className="slots">
              {slots.map((s) => (
                <button
                  key={s}
                  disabled={taken.includes(s)}
                  className={slot === s ? "selected" : ""}
                  onClick={() => setSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div style={{ marginTop: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "6px", color: "#1e293b" }}>
                Consultation Fee: Rs. {FEE}
              </div>
              <input
                value={card}
                onChange={(e) => setCard(e.target.value)}
                placeholder="UPI ID or Payment Card Number"
              />
              <button
                disabled={slot === "" || card.trim() === ""}
                onClick={payAndBook}
                style={{ width: "100%", marginTop: "6px" }}
              >
                Confirm Booking & Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomChecker;
