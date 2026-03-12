# 🏗️ AI Form Architect

AI Form Architect is a full-stack platform that transforms natural language prompts into production-ready, validated **JSON Schema (Draft 7)** forms. Using openai's **GROQ**, the system supports multi-turn refinements, conditional logic (`x-show-when`), and visual diffing.

---

## 🚀 Key Features

* **Natural Language to Schema:** Convert prompts like "Create a login form" into structured code.
* **Multi-turn Refinement:** Update existing forms by chatting (e.g., "Now add a phone field").
* **Live Preview:** Real-time rendering of the form using `@rjsf/core`.
* **Ambiguity Detection:** The AI asks for clarification if your prompt is too vague.
* **Schema Diffing:** Visual history showing exactly what fields were added, edited, or deleted.
* **Export Center:** Download JSON, copy schema code, or generate cURL requests.

---

## 🛠️ Tech Stack

### **Frontend**
* **React + TypeScript + Vite**
* **Zustand:** State management & version history.
* **Tailwind CSS:** Modern, responsive UI.
* **RJSF:** React JSON Schema Form for rendering.

### **Backend**
* **Node.js + Express**
* **GROQ AI:** Core LLM engine.
* **Ajv:** JSON Schema validation.
* **Deep-Diff:** Calculation of architectural changes.

---

## 📦 Installation & Setup

### **Prerequisites**
* [Node.js](https://nodejs.org/) (v18+)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (For containerized setup)
* [GROQ API Key](https://console.groq.com/keys)

### **Manual Local Setup**

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/sai1432-ss/AI-PoweredConversationalFormBuilder
    cd AI-PoweredConversationalFormBuilder
    ```


## 🐳 Docker Deployment (Recommended)

This project is fully containerized with healthchecks and orchestrated networking.

1.  **Prepare .env:** Ensure `backend/.env` contains your `GROQ_API`.
2.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
3.  **Access the App:**
    * **Frontend:** `http://localhost:3000`
    * **Backend API:** `http://localhost:8080`

---

## 🧪 API Verification (Postman)

### **1. Basic Generation**
* **Endpoint:** `POST /api/form/generate`
* **Body:** `{"prompt": "A contact form"}`

### **2. Ambiguity Detection**
* **Prompt:** `"Make a form for booking a meeting room"`
* **Expects:** `status: "clarification_needed"`

---


---

##Use this for production testing 

https://production-frontend-pi.vercel.app/

It works as the local development.
