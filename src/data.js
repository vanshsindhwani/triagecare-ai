// departments and the keywords we look for in the symptom text
export const defaultDepartments = [
  { name: "Cardiology", doctor: "Dr. Rohit Mehta", words: ["chest", "heart", "palpitation", "blood pressure", "breathless"] },
  { name: "Pulmonology", doctor: "Dr. Anita Verma", words: ["cough", "breath", "wheez", "asthma", "lung"] },
  { name: "Neurology", doctor: "Dr. Sandeep Kapoor", words: ["headache", "migraine", "dizz", "seizure", "numb"] },
  { name: "Dermatology", doctor: "Dr. Neha Arora", words: ["skin", "rash", "itch", "acne", "allergy"] },
  { name: "Orthopedics", doctor: "Dr. Vikram Singh", words: ["bone", "joint", "knee", "back pain", "fracture"] },
  { name: "Gastroenterology", doctor: "Dr. Pooja Malhotra", words: ["stomach", "vomit", "nausea", "abdominal", "diarrhea"] },
  { name: "ENT", doctor: "Dr. Karan Bedi", words: ["ear", "throat", "nose", "sinus", "hearing"] },
  { name: "General Medicine", doctor: "Dr. Suresh Gupta", words: ["fever", "cold", "weakness", "fatigue", "body ache"] },
];

export const defaultAppointments = [
  {
    id: "TC-1001",
    patient: "Aarav Sharma",
    problem: "Severe pulsating headache on left side with dizziness and light sensitivity",
    department: "Neurology",
    doctor: "Dr. Sandeep Kapoor",
    priority: "High",
    slot: "10:20",
    fee: 300,
    paid: true,
    status: "In Progress",
    bookedAt: "Today, 09:30 AM",
  },
  {
    id: "TC-1002",
    patient: "Priya Patel",
    problem: "Numbness and tingling in hands and chronic migraine",
    department: "Neurology",
    doctor: "Dr. Sandeep Kapoor",
    priority: "Medium",
    slot: "11:00",
    fee: 300,
    paid: true,
    status: "Booked",
    bookedAt: "Today, 10:00 AM",
  },
  {
    id: "TC-1003",
    patient: "Rajesh Kumar",
    problem: "Chest tightness, sudden palpitations and mild shortness of breath",
    department: "Cardiology",
    doctor: "Dr. Rohit Mehta",
    priority: "High",
    slot: "10:40",
    fee: 300,
    paid: true,
    status: "Booked",
    bookedAt: "Today, 09:45 AM",
  },
  {
    id: "TC-1004",
    patient: "Simran Kaur",
    problem: "Persistent dry cough, wheezing and nocturnal breathlessness",
    department: "Pulmonology",
    doctor: "Dr. Anita Verma",
    priority: "Medium",
    slot: "11:40",
    fee: 300,
    paid: true,
    status: "Completed",
    bookedAt: "Yesterday, 04:15 PM",
  },
  {
    id: "TC-1005",
    patient: "Amit Verma",
    problem: "Severe lower back pain after lifting weights with knee stiffness",
    department: "Orthopedics",
    doctor: "Dr. Vikram Singh",
    priority: "Medium",
    slot: "12:00",
    fee: 300,
    paid: true,
    status: "Booked",
    bookedAt: "Today, 10:15 AM",
  },
];


// simple version of the triage. Later we can replace this with a call to the
// Python (Sentence-BERT) service, e.g. fetch("http://localhost:8000/triage", ...)
export function findDepartment(text, departments) {
  const lower = text.toLowerCase();
  const tokens = lower.split(/[^a-z]+/);
  let best = null;
  let bestWords = [];

  departments.forEach((d) => {
    const matched = d.words.filter((w) =>
      w.includes(" ") ? lower.includes(w) : tokens.some((t) => t.startsWith(w))
    );
    if (matched.length > bestWords.length) {
      best = d;
      bestWords = matched;
    }
  });

  if (!best) best = departments.find((d) => d.name === "General Medicine") || departments[0];

  let priority = "Low";
  if (/pain|fever|vomit|infection|swell/.test(lower)) priority = "Medium";
  if (/chest pain|breath|bleed|unconscious|faint|severe|stroke/.test(lower)) priority = "High";

  return { department: best.name, doctor: best.doctor, priority, matched: bestWords };
}

// small helpers to save data in the browser
export function load(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}
export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
