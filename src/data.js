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
