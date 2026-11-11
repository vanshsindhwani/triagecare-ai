# PROJECT SYNOPSIS

## 1. PROJECT TITLE
**TriageCare AI: Intelligent Clinical Intake & Semantic Symptom Triage Portal**

---

## 2. TEAM MEMBERS & INSTITUTION
* **Project Developers**: Vansh Sindhwani, Aina Sachdeva, Anshpreet
* **Department**: Department of Computer Science & Engineering
* **Institution**: Maharishi Markandeshwar University (MMU)

---

## 3. INTRODUCTION & PROJECT OVERVIEW
In traditional hospital environments, manual patient registration and preliminary triage often lead to extended waiting room times, delayed emergency responses, and misallocation of clinical resources. 

**TriageCare AI** is a web-based clinical portal designed to automate patient intake and symptom classification. The system allows patients to input symptoms in free-text natural language. Using a **Vector Space Model (TF-IDF & Cosine Similarity)** alongside an optional **Sentence-BERT** microservice bridge, the portal automatically routes patients to the appropriate medical specialist department (e.g., Cardiology, Neurology, Pulmonology) and assigns a clinical urgency priority (**High, Medium, Low**). 

The platform incorporates real-time WebSockets (**Socket.IO**) for instant queue updates, strict department-level access control for doctor privacy, health vitals monitoring, and a centralized hospital administration dashboard backed by **MongoDB**.

---

## 4. OBJECTIVES OF THE PROJECT
1. **Automated Patient Triage**: Eliminate manual intake bottlenecks by processing free-text patient symptoms and computing semantic similarity scores.
2. **Clinical Urgency Assessment**: Automatically identify high-priority emergency indicators (e.g., chest pain, shortness of breath, stroke signs) to prioritize urgent consultations.
3. **Role-Based Access Control (RBAC) & Data Privacy**: Ensure strict medical data scoping so specialist doctors only view patient records assigned to their specific clinical department.
4. **Real-Time Queue Synchronization**: Utilize WebSockets (**Socket.IO**) so doctors receive live updates as new patient appointments are booked without manual browser refreshes.
5. **Centralized Hospital Management**: Provide administrators with comprehensive oversight of patient registries, department management, revenue tracking, and system maintenance.

---

## 5. SYSTEM ARCHITECTURE & MODULES

```
+-------------------------------------------------------------------------+
|                              REACT SPA FRONTEND                         |
|    +-------------------+   +--------------------+   +--------------+    |
|    | Patient Portal    |   | Specialist Portal  |   | Admin Portal |    |
|    | (Triage & Slot)   |   | (Queue & Status)   |   | (Registry)   |    |
|    +-------------------+   +--------------------+   +--------------+    |
+------------------------------------+------------------------------------+
                                     |
                          HTTP REST / Socket.IO
                                     |
+------------------------------------v------------------------------------+
|                         NODE.JS / EXPRESS BACKEND SERVER                |
|  +------------------------+  +-------------------+  +----------------+  |
|  | TF-IDF & Cosine        |  | Socket.IO         |  | Mongoose ORM   |  |
|  | Similarity NLP Engine  |  | Real-time Server  |  | Data Layer     |  |
|  +------------------------+  +-------------------+  +----------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                             MONGODB DATABASE                            |
|     (Departments | Appointments | Vitals | Medication Reminders)        |
+-------------------------------------------------------------------------+
```

### Module Descriptions:
1. **Patient Intake & Authentication Module**: Implements two-step mobile number entry and 6-digit OTP verification with strict name regex validation.
2. **NLP Symptom Triage Module**: Tokenizes user text, eliminates stop-words, and calculates TF-IDF Cosine Similarity against department keyword vectors.
3. **Specialist Dashboard Module**: Provides department-scoped queues for doctors to view assigned patients and update consultation statuses (*Booked, In Progress, Completed*).
4. **Hospital Administration Module**: System-wide dashboard for monitoring total revenue, managing medical departments/specialists, searching records, and clearing database entries.
5. **Health Vitals & Medication Reminder Module**: Enables patients to log blood pressure, blood sugar, weight, and set scheduled medication alert reminders.

---

## 6. HARDWARE & SOFTWARE REQUIREMENTS

### Software Requirements:
* **Operating System**: Windows 10/11, Linux (Ubuntu), or macOS
* **Frontend Framework**: React 18, Tailwind CSS, Vite
* **Backend Runtime**: Node.js v18+, Express.js
* **Database**: MongoDB v6.0+ (Mongoose ORM)
* **Real-Time Engine**: Socket.IO v4.7+
* **Development Tools**: Visual Studio Code, Git, npm, Postman

### Hardware Requirements:
* **Processor**: Dual-Core Intel Core i5 or AMD Ryzen 5 (2.0 GHz+)
* **RAM**: 8 GB minimum (16 GB recommended)
* **Storage**: 500 MB free hard disk space
* **Network**: Broadband Internet connection for API and database cluster connectivity

---

## 7. METHODOLOGY & ALGORITHM

### Triage Algorithm: Vector Space Model (TF-IDF & Cosine Similarity)
1. **Text Preprocessing**: Lowercasing, punctuation stripping, and stop-word removal.
2. **Term Frequency (TF)**: Calculates word occurrences within patient input.
3. **Inverse Document Frequency (IDF)**: Down-weights generic terms across medical document profiles:
   $$\text{IDF}(t) = \ln\left(\frac{N + 1}{\text{DF}(t) + 1}\right) + 1$$
4. **Cosine Similarity Computation**: Determines the angle between the query vector $\vec{Q}$ and department profile vector $\vec{D}$:
   $$\text{Similarity}(\vec{Q}, \vec{D}) = \frac{\vec{Q} \cdot \vec{D}}{\|\vec{Q}\| \|\vec{D}\|} = \frac{\sum Q_i D_i}{\sqrt{\sum Q_i^2} \sqrt{\sum D_i^2}}$$
5. **Urgency Classification**: Evaluates emergency clinical red flags to categorize priority into **High**, **Medium**, or **Low**.

---

## 8. FUTURE SCOPE & ENHANCEMENTS
1. **Voice-Based Intake**: Integration of Speech-to-Text API for hands-free intake in emergency rooms.
2. **Multilingual Support**: Expanding NLP triage models to support regional languages (e.g., Hindi, Punjabi).
3. **EHR / HL7 FHIR Integration**: Connecting with Electronic Health Record systems for seamless medical history sync.
4. **Automated SMS Gateway**: Production integration with Twilio/Fast2SMS for live SMS OTP verification.

---

## 9. CONCLUSION
**TriageCare AI** demonstrates a modernized approach to clinical intake and hospital queue management. By combining mathematical NLP text vectors, real-time WebSockets, and strict role-based privacy scoping, the platform reduces administrative overhead, minimizes patient waiting times, and ensures urgent clinical cases receive immediate specialist attention.
