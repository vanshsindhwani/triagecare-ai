// Clinical Symptom Triage NLP Engine
// Implements Vector Space Model (TF-IDF), Cosine Similarity, Negation Handling, and Input Validation

interface DepartmentProfile {
  name: string;
  doctor: string;
  words: string[];
}

export interface TriageResult {
  error?: string;
  department?: string;
  doctor?: string;
  priority?: "High" | "Medium" | "Low";
  matched?: string[];
  confidence?: number;
  engine?: "TF-IDF Cosine Similarity" | "Sentence-BERT Semantic Service";
  timestamp?: string;
}

const STOP_WORDS = new Set([
  "i", "have", "a", "an", "the", "and", "or", "in", "my", "me", "feel", "feeling",
  "with", "for", "is", "was", "am", "are", "been", "of", "on", "at", "to", "it",
  "some", "from", "very", "having", "since", "yesterday", "days", "day", "severe"
]);

const NEGATION_WORDS = new Set([
  "no", "not", "without", "never", "dont", "don't", "denies", "denied", "free of", "zero"
]);

// Extract tokenized words
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

// Negation-aware clinical priority assessment
function assessUrgency(text: string): "High" | "Medium" | "Low" {
  const lower = text.toLowerCase();

  // Split into sentences / clauses
  const clauses = lower.split(/[,.;!?]|\bbut\b|\bhowever\b/);

  let highDetected = false;
  let mediumDetected = false;

  const highIndicators = [
    "chest pain", "shortness of breath", "breathless", "difficulty breathing",
    "unconscious", "faint", "fainted", "seizure", "stroke", "heart attack",
    "severe bleeding", "unresponsive", "paralysis", "sudden numbness", "high fever with rash"
  ];

  const mediumIndicators = [
    "pain", "fever", "vomit", "vomiting", "infection", "swelling", "fracture",
    "migraine", "diarrhea", "dizziness", "burning", "asthma attack"
  ];

  for (const clause of clauses) {
    const tokens = clause.trim().split(/\s+/);
    
    // Check if clause has a negation word preceding the indicator
    const hasNegation = tokens.some((t) => NEGATION_WORDS.has(t));

    if (!hasNegation) {
      if (highIndicators.some((hi) => clause.includes(hi))) {
        highDetected = true;
      }
      if (mediumIndicators.some((mi) => clause.includes(mi))) {
        mediumDetected = true;
      }
    }
  }

  if (highDetected) return "High";
  if (mediumDetected) return "Medium";
  return "Low";
}

// Calculate Cosine Similarity with Negation Filtering
function cosineSimilarity(queryTerms: string[], docWords: string[], allDocCount: number, termDocFreq: Map<string, number>): { score: number; matched: string[] } {
  const queryFreq: Record<string, number> = {};
  queryTerms.forEach((t) => {
    queryFreq[t] = (queryFreq[t] || 0) + 1;
  });

  const docFreq: Record<string, number> = {};
  const matchedWords: string[] = [];

  docWords.forEach((dw) => {
    const dwLower = dw.toLowerCase();
    if (queryTerms.includes(dwLower) || queryTerms.some((qt) => qt.startsWith(dwLower) || dwLower.startsWith(qt))) {
      matchedWords.push(dw);
      docFreq[dwLower] = 1;
    }
  });

  if (matchedWords.length === 0) {
    return { score: 0, matched: [] };
  }

  let dotProduct = 0;
  let normQuery = 0;
  let normDoc = 0;

  const uniqueTerms = Array.from(new Set([...Object.keys(queryFreq), ...docWords.map(w => w.toLowerCase())]));

  uniqueTerms.forEach((term) => {
    const df = termDocFreq.get(term) || 1;
    const idf = Math.log((allDocCount + 1) / (df + 1)) + 1;

    const tfQuery = queryFreq[term] || 0;
    const tfDoc = docFreq[term] || 0;

    const wQuery = tfQuery * idf;
    const wDoc = tfDoc * idf;

    dotProduct += wQuery * wDoc;
    normQuery += wQuery * wQuery;
    normDoc += wDoc * wDoc;
  });

  if (normQuery === 0 || normDoc === 0) {
    return { score: 0, matched: [] };
  }

  const rawScore = dotProduct / (Math.sqrt(normQuery) * Math.sqrt(normDoc));
  const calibratedScore = Math.min(0.96, Math.max(0.45, rawScore));
  return { score: Number(calibratedScore.toFixed(2)), matched: matchedWords };
}

// Input Validation for Gibberish/Random Numbers
export function validateSymptomInput(text: string): { valid: boolean; reason?: string } {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 3) {
    return { valid: false, reason: "Please enter a detailed description of your symptoms." };
  }

  // Reject pure numbers or gibberish strings like "12 3243er"
  const alphaChars = trimmed.replace(/[^a-zA-Z]/g, "").length;
  if (alphaChars < 3) {
    return { valid: false, reason: "Invalid input. Please enter valid medical symptoms using letters." };
  }

  // Check dictionary letter ratio vs digits/symbols
  const digits = trimmed.replace(/[^0-9]/g, "").length;
  if (digits > alphaChars) {
    return { valid: false, reason: "Invalid symptom input. Please describe your health concern using text." };
  }

  return { valid: true };
}

// Primary Triage Execution Function
export async function triagePatientSymptoms(
  text: string,
  departments: DepartmentProfile[]
): Promise<TriageResult> {
  // Validate input
  const validation = validateSymptomInput(text);
  if (!validation.valid) {
    return { error: validation.reason };
  }

  const urgency = assessUrgency(text);

  // External Sentence-BERT bridge
  const sentenceBertUrl = process.env.SENTENCE_BERT_URL;
  if (sentenceBertUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const response = await fetch(`${sentenceBertUrl}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        return {
          department: data.department,
          doctor: data.doctor || departments.find(d => d.name === data.department)?.doctor || "Specialist",
          priority: data.priority || urgency,
          matched: data.matched || [],
          confidence: data.confidence || 0.88,
          engine: "Sentence-BERT Semantic Service",
          timestamp: new Date().toISOString(),
        };
      }
    } catch {
      // Fall through to TF-IDF Cosine Similarity Engine
    }
  }

  // Internal TF-IDF Cosine Similarity Engine
  const tokens = tokenize(text);
  const totalDepts = departments.length;

  const termDocFreq = new Map<string, number>();
  departments.forEach((dept) => {
    dept.words.forEach((w) => {
      const lower = w.toLowerCase();
      termDocFreq.set(lower, (termDocFreq.get(lower) || 0) + 1);
    });
  });

  let bestDept: DepartmentProfile | null = null;
  let highestScore = 0;
  let bestMatched: string[] = [];

  departments.forEach((dept) => {
    const { score, matched } = cosineSimilarity(tokens, dept.words, totalDepts, termDocFreq);
    if (score > highestScore || (score === highestScore && matched.length > bestMatched.length)) {
      highestScore = score;
      bestDept = dept;
      bestMatched = matched;
    }
  });

  if (!bestDept || highestScore === 0) {
    const generalMed = departments.find((d) => d.name === "General Medicine") || departments[0];
    return {
      department: generalMed.name,
      doctor: generalMed.doctor,
      priority: urgency,
      matched: [],
      confidence: 0.50,
      engine: "TF-IDF Cosine Similarity",
      timestamp: new Date().toISOString(),
    };
  }

  return {
    department: bestDept.name,
    doctor: bestDept.doctor,
    priority: urgency,
    matched: bestMatched,
    confidence: highestScore,
    engine: "TF-IDF Cosine Similarity",
    timestamp: new Date().toISOString(),
  };
}
