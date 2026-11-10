import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Persistent database path
const DB_FILE = path.join(__dirname, "data_store.json");

// Default initial state
const initialDepartments = [
  { name: "Cardiology", doctor: "Dr. Rohit Mehta", words: ["chest", "heart", "palpitation", "blood pressure", "breathless"] },
  { name: "Pulmonology", doctor: "Dr. Anita Verma", words: ["cough", "breath", "wheez", "asthma", "lung"] },
  { name: "Neurology", doctor: "Dr. Sandeep Kapoor", words: ["headache", "migraine", "dizz", "seizure", "numb"] },
  { name: "Dermatology", doctor: "Dr. Neha Arora", words: ["skin", "rash", "itch", "acne", "allergy"] },
  { name: "Orthopedics", doctor: "Dr. Vikram Singh", words: ["bone", "joint", "knee", "back pain", "fracture"] },
  { name: "Gastroenterology", doctor: "Dr. Pooja Malhotra", words: ["stomach", "vomit", "nausea", "abdominal", "diarrhea"] },
  { name: "ENT", doctor: "Dr. Karan Bedi", words: ["ear", "throat", "nose", "sinus", "hearing"] },
  { name: "General Medicine", doctor: "Dr. Suresh Gupta", words: ["fever", "cold", "weakness", "fatigue", "body ache"] },
];

interface DataStore {
  departments: typeof initialDepartments;
  appointments: any[];
  vitals: any[];
  reminders: any[];
}

function loadDB(): DataStore {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading database file:", err);
  }
  return {
    departments: initialDepartments,
    appointments: [],
    vitals: [],
    reminders: [],
  };
}

function saveDB(data: DataStore) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// In-memory reference initialized from file
let db = loadDB();

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "TriageCare AI Backend Engine",
    version: "1.0.0",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Reset / Clear all records
app.post("/api/reset", (_req: Request, res: Response) => {
  db = {
    departments: initialDepartments,
    appointments: [],
    vitals: [],
    reminders: [],
  };
  saveDB(db);
  res.json({ success: true, message: "All database records have been reset successfully" });
});

// 1. Departments API
app.get("/api/departments", (_req: Request, res: Response) => {
  res.json(db.departments);
});

app.post("/api/departments", (req: Request, res: Response) => {
  const { name, doctor, words } = req.body;
  if (!name || !doctor) {
    return res.status(400).json({ error: "Department name and doctor are required" });
  }
  const exists = db.departments.some((d) => d.name.toLowerCase() === name.trim().toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "Department already exists" });
  }

  const formattedDoc = doctor.trim().match(/^(dr\.?|doctor)\s+/i)
    ? `Dr. ${doctor.trim().replace(/^(dr\.?|doctor)\s+/i, "")}`
    : `Dr. ${doctor.trim()}`;

  const newDept = {
    name: name.trim(),
    doctor: formattedDoc,
    words: Array.isArray(words) ? words.map((w: string) => w.trim().toLowerCase()) : [],
  };
  db.departments.push(newDept);
  saveDB(db);
  res.status(201).json(newDept);
});

app.patch("/api/departments/:name/doctor", (req: Request, res: Response) => {
  const deptName = req.params.name;
  const { doctor } = req.body;
  const dept = db.departments.find((d) => d.name.toLowerCase() === deptName.toLowerCase());
  if (!dept) {
    return res.status(404).json({ error: "Department not found" });
  }
  dept.doctor = doctor;
  saveDB(db);
  res.json(dept);
});

app.delete("/api/departments/:name", (req: Request, res: Response) => {
  const deptName = req.params.name;
  db.departments = db.departments.filter((d) => d.name.toLowerCase() !== deptName.toLowerCase());
  saveDB(db);
  res.json({ success: true, message: `Department ${deptName} removed` });
});

// 2. Semantic Symptom Triage AI Engine
app.post("/api/triage", (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Symptom text is required" });
  }

  const lower = text.toLowerCase();
  const tokens = lower.split(/[^a-z]+/);
  let bestDept: (typeof initialDepartments)[0] | null = null;
  let bestWords: string[] = [];

  db.departments.forEach((d) => {
    const matched = d.words.filter((w) =>
      w.includes(" ") ? lower.includes(w) : tokens.some((t) => t.startsWith(w))
    );
    if (matched.length > bestWords.length) {
      bestDept = d;
      bestWords = matched;
    }
  });

  if (!bestDept) {
    bestDept = db.departments.find((d) => d.name === "General Medicine") || db.departments[0];
  }

  let priority = "Low";
  if (/pain|fever|vomit|infection|swell|rash/.test(lower)) priority = "Medium";
  if (/chest pain|breath|bleed|unconscious|faint|severe|stroke|heart attack/.test(lower)) priority = "High";

  const confidenceScore = Math.min(0.98, Math.max(0.65, 0.65 + bestWords.length * 0.1));

  res.json({
    department: bestDept.name,
    doctor: bestDept.doctor,
    priority,
    matched: bestWords,
    confidence: Number(confidenceScore.toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

// 3. Appointments API
app.get("/api/appointments", (req: Request, res: Response) => {
  const { patient, department, status } = req.query;
  let list = [...db.appointments];

  if (patient && typeof patient === "string") {
    list = list.filter((a) => a.patient.toLowerCase() === patient.toLowerCase());
  }

  // Doctor Specialty Scoping: Neurologist only gets Neurology patients
  if (department && typeof department === "string" && department !== "All") {
    list = list.filter((a) => a.department.toLowerCase() === department.toLowerCase());
  }

  if (status && typeof status === "string" && status !== "All") {
    list = list.filter((a) => a.status === status);
  }

  res.json(list);
});

app.post("/api/appointments", (req: Request, res: Response) => {
  const { patient, problem, department, doctor, priority, slot, fee } = req.body;
  if (!patient || !department || !doctor || !slot) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  const tokenNumber = 1001 + db.appointments.length;
  const newAppointment = {
    id: `TC-${tokenNumber}`,
    patient: patient.trim(),
    problem: problem || "",
    department: department.trim(),
    doctor: doctor.trim(),
    priority: priority || "Low",
    slot: slot.trim(),
    fee: fee || 300,
    paid: true,
    status: "Booked",
    bookedAt: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    createdAt: new Date().toISOString(),
  };

  db.appointments.push(newAppointment);
  saveDB(db);
  res.status(201).json(newAppointment);
});

app.patch("/api/appointments/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const appt = db.appointments.find((a) => a.id === id);
  if (!appt) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  if (status) appt.status = status;
  saveDB(db);
  res.json(appt);
});

// 4. Health Vitals API
app.get("/api/vitals/:owner", (req: Request, res: Response) => {
  const { owner } = req.params;
  const logs = db.vitals.filter((v) => v.owner.toLowerCase() === owner.toLowerCase());
  res.json(logs);
});

app.post("/api/vitals", (req: Request, res: Response) => {
  const { owner, type, value } = req.body;
  if (!owner || !type || value === undefined) {
    return res.status(400).json({ error: "owner, type and value are required" });
  }
  const newVital = {
    id: Date.now(),
    owner: owner.trim(),
    type: type.trim(),
    value: String(value).trim(),
    date: new Date().toLocaleDateString(),
  };
  db.vitals.push(newVital);
  saveDB(db);
  res.status(201).json(newVital);
});

// 5. Reminders API
app.get("/api/reminders/:owner", (req: Request, res: Response) => {
  const { owner } = req.params;
  const list = db.reminders.filter((r) => r.owner.toLowerCase() === owner.toLowerCase());
  res.json(list);
});

app.post("/api/reminders", (req: Request, res: Response) => {
  const { owner, text, time } = req.body;
  if (!owner || !text || !time) {
    return res.status(400).json({ error: "owner, text and time are required" });
  }
  const newReminder = {
    id: Date.now(),
    owner: owner.trim(),
    text: text.trim(),
    time: time.trim(),
    done: false,
  };
  db.reminders.push(newReminder);
  saveDB(db);
  res.status(201).json(newReminder);
});

app.patch("/api/reminders/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const reminder = db.reminders.find((r) => r.id === id);
  if (!reminder) {
    return res.status(404).json({ error: "Reminder not found" });
  }
  if (req.body.done !== undefined) reminder.done = Boolean(req.body.done);
  saveDB(db);
  res.json(reminder);
});

app.delete("/api/reminders/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  db.reminders = db.reminders.filter((r) => r.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// FRONTEND SERVING (VITE MIDDLEWARE IN DEV / STATIC IN PROD)
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  // Serve static assets from public folder
  app.use(express.static(path.join(__dirname, "public")));

  if (!isProduction) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
