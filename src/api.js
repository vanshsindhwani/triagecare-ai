// Centralized API Client for TriageCare AI Backend
const BASE_URL = "/api";

export async function fetchHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    console.warn("Backend API offline, using fallback:", err);
    return null;
  }
}

export async function resetDatabaseApi() {
  try {
    const res = await fetch(`${BASE_URL}/reset`, { method: "POST" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Error calling reset API:", err);
  }
  return null;
}

// 1. Departments API
export async function getDepartmentsApi(fallback) {
  try {
    const res = await fetch(`${BASE_URL}/departments`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error fetching departments API:", e);
  }
  return fallback;
}

export async function addDepartmentApi(dept) {
  try {
    const res = await fetch(`${BASE_URL}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dept),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error adding department API:", e);
  }
  return null;
}

export async function updateDoctorApi(deptName, doctor) {
  try {
    const res = await fetch(`${BASE_URL}/departments/${encodeURIComponent(deptName)}/doctor`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctor }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error updating doctor API:", e);
  }
  return null;
}

export async function deleteDepartmentApi(deptName) {
  try {
    const res = await fetch(`${BASE_URL}/departments/${encodeURIComponent(deptName)}`, {
      method: "DELETE",
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error deleting department API:", e);
  }
  return null;
}

// 2. Semantic Triage AI Engine
export async function triageSymptomsApi(text, fallbackFn, fallbackDepts) {
  try {
    const res = await fetch(`${BASE_URL}/triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error calling triage API, falling back to local analysis:", e);
  }
  return fallbackFn(text, fallbackDepts);
}

// 3. Appointments API
export async function getAppointmentsApi(params = {}, fallback = []) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/appointments?${query}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error fetching appointments API:", e);
  }
  return fallback;
}

export async function createAppointmentApi(appointment) {
  try {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error creating appointment API:", e);
  }
  return null;
}

export async function updateAppointmentStatusApi(id, status) {
  try {
    const res = await fetch(`${BASE_URL}/appointments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error updating appointment status API:", e);
  }
  return null;
}

// 4. Vitals API
export async function getVitalsApi(owner, fallback = []) {
  try {
    const res = await fetch(`${BASE_URL}/vitals/${encodeURIComponent(owner)}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error fetching vitals API:", e);
  }
  return fallback;
}

export async function addVitalApi(vital) {
  try {
    const res = await fetch(`${BASE_URL}/vitals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vital),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error adding vital API:", e);
  }
  return null;
}

// 5. Reminders API
export async function getRemindersApi(owner, fallback = []) {
  try {
    const res = await fetch(`${BASE_URL}/reminders/${encodeURIComponent(owner)}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error fetching reminders API:", e);
  }
  return fallback;
}

export async function addReminderApi(reminder) {
  try {
    const res = await fetch(`${BASE_URL}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error adding reminder API:", e);
  }
  return null;
}

export async function toggleReminderApi(id, done) {
  try {
    const res = await fetch(`${BASE_URL}/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error updating reminder API:", e);
  }
  return null;
}

export async function deleteReminderApi(id) {
  try {
    const res = await fetch(`${BASE_URL}/reminders/${id}`, {
      method: "DELETE",
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Error deleting reminder API:", e);
  }
  return null;
}
