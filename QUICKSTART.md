# 🚀 Quick Start Guide: AI Well-being Fuzzy System

Welcome! This step-by-step guide is designed to get you up and running with the **AI-Based Intelligent Solution for Healthcare & Well-being** in under 3 minutes, even if you are new to Streamlit or Fuzzy Logic.

---

## 📋 Prerequisites
- **Python 3.10 or higher** installed on your system (Python 3.10, 3.11, 3.12, 3.13, 3.14 are all supported).
- To check your Python version, open a terminal (Command Prompt, PowerShell, or macOS/Linux Terminal) and run:
  ```bash
  python --version
  ```

---

## ⚡ Step 1: Open the Project Folder
1. Unzip `ai_wellbeing_project.zip` to any folder on your computer.
2. Open a terminal / command prompt inside that extracted folder (`ai_wellbeing_project`):
   - **Windows:** Hold `Shift`, right-click inside the folder, and select **Open PowerShell window here** or **Open in Terminal**.
   - **macOS / Linux:** Open Terminal and type `cd path/to/ai_wellbeing_project`.

---

## ⚡ Step 2: (Optional but Recommended) Create a Virtual Environment
A virtual environment keeps the project dependencies isolated and clean.

- **Windows (Command Prompt / PowerShell):**
  ```bash
  python -m venv venv
  venv\Scripts\activate
  ```
- **macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

---

## ⚡ Step 3: Install Required Dependencies
Run this single command to install all needed libraries (`streamlit`, `scikit-fuzzy`, `numpy`, `pandas`, `matplotlib`, `pytest`):

```bash
pip install -r requirements.txt
```

*(This takes about 20–30 seconds to download and install.)*

---

## ⚡ Step 4: Run the Interactive Web Application!
Launch the Streamlit app:

```bash
streamlit run app.py
```

### What will happen:
1. Your terminal will show:
   ```text
   Local URL: http://localhost:8501
   Network URL: http://...
   ```
2. Your default web browser will automatically open with the application dashboard!
3. If it doesn't open automatically, just copy and paste `http://localhost:8501` into Chrome, Edge, Firefox, or Safari.

---

## 🎮 Step 5: How to Use the Application (Demo Walkthrough)

The application includes these main sections:

### 1. 🫀 Tab 1: Real-Time Assessment
- **Sidebar Quick Presets:** Look at the left sidebar. You can click one of the preset buttons:
  - 🔴 **High Stress (Exam / Deadline):** Loads HRV=30 ms, Screen=14 h, Sleep=3.5 h
  - 🟡 **Medium Stress (Average Workday):** Loads HRV=65 ms, Screen=7 h, Sleep=6 h
  - 🟢 **Low Stress (Rest & Recovery):** Loads HRV=100 ms, Screen=2 h, Sleep=9 h
- **Sliders:** Or manually adjust any of the three sliders:
  - **Heart Rate Variability (HRV):** 20 to 120 ms
  - **Daily Screen Time:** 0 to 16 hours
  - **Sleep Duration:** 2 to 10 hours
- **Context Settings:** Select how much time you have (e.g. *5 minutes*) and your location (e.g. *University*).
- **Click "Analyze Stress":** Watch the Mamdani engine instantly calculate:
  - The **Stress Index** (0 to 100)
  - The **Stress Category Badge** (Low: Green, Medium: Amber, High: Red)
  - The **Tailored Coping Card** (e.g., Active Cardio Break, Breathing Exercise, Sleep Tip)
  - The **Fuzzification Table** (exact degree of truth in each linguistic set)
  - The **Active Rules Transparency Panel** (click to expand and see exactly which rules fired and their firing strength $\alpha$).

### 2. 💬 Wellbeing Chat
- Use the offline Wellbeing Companion to request breathing guidance, grounding, sleep suggestions, or study-stress support.
- Use the floating **Wellbeing chat** popover near the lower-right corner for quick support.
- Assessment sharing is off by default and can be enabled in Chat settings.

### 3. 🌿 Relax & Play
- Try guided breathing, the 5-4-3-2-1 grounding exercise, the calm matching game, or a mindfulness check-in.
- Activities are optional, are not clinical measures, and are saved only when you sign in and enable activity saving.

### 4. 📚 My History
- Register/sign in from **Account & Settings** to save assessments, review your history, inspect the score trend, and export saved assessment history.
- Saving assessment, chat, and game history is off by default.

### 5. 🤝 Talk to a Counsellor
- The contact form is a local demonstration only. No real counsellor receives submitted requests.

### 6. 👤 Account & Settings
- Create a demo account, sign in/out, change your display name, set data-saving preferences, export available personal data, or delete the account.
- Use a unique demo password; this local authentication is not a production identity service.

### 7. 📈 Membership Functions
- View the mathematical curves for all variables (trapezoidal and triangular).
- Notice the **red vertical dashed lines** that dynamically mark your exact slider values on the graphs.
- View the shaded area showing the aggregated output fuzzy set and the exact **centroid center of gravity**.

### 8. 🏗️ System Architecture
- View the flow diagram showing the 8-stage pipeline from input collection to continuous re-evaluation, designed for academic presentations and reports.

### 9. 📁 Synthetic Dataset & Batch Evaluation
- View the built-in 122-row synthetic dataset (`data/synthetic_stress_data.csv`).
- Click **Run Full Batch Inference on Dataset** to see the system process all 122 rows and display the category distribution chart!

---

## 🧪 Step 6: Verify the Automated Tests
Want to prove that the fuzzy logic math, rules, boundaries, and recommendations are 100% bug-free? Run:

```bash
pytest -v
```

The test results will be printed in the terminal. Ensure dependencies from `requirements.txt` are installed first.

---

## 📁 Step 7: Codebase Quick Tour
Here is what each folder does if you want to inspect or modify the code:

| Folder / File | What it does |
|---|---|
| `app.py` | The main Streamlit web application. |
| `config/fuzzy_config.py` | Single source of truth for all numbers: ranges, breakpoints, and thresholds. |
| `fuzzy_engine/membership.py` | Defines the fuzzy Antecedents/Consequents using `scikit-fuzzy`. |
| `fuzzy_engine/rules.py` | Contains all 27 Core Rules (`C01`–`C27`) + 4 Supplementary Rules (`R4`–`R7`). |
| `fuzzy_engine/inference.py` | Mamdani inference engine (AND min, OR max, centroid defuzzification). |
| `fuzzy_engine/classifier.py` | Maps the crisp score to Low, Medium, or High. |
| `recommendation/` | Recommendation library and deterministic rule-based selection logic. |
| `explanation/` | Builds the transparent audit trail explaining why the AI reached its result. |
| `ui/dashboard.py` & `visualizations.py` | UI layout components and Matplotlib plotting routines. |
| `data/synthetic_stress_data.csv` | 122 simulated rows for demonstration and testing. |
| `tests/` | Pytest test suite with 71 automated tests. |

---

## ❓ Troubleshooting & FAQs

- **Command `python` not found?** Try running `python3` instead.
- **Command `pip` not found?** Run `python -m pip install -r requirements.txt`.
- **Port 8501 already in use?** Run on another port:
  ```bash
  streamlit run app.py --server.port 8502
  ```
- **How to stop the app?** Press `Ctrl + C` in your terminal.

Enjoy exploring the Fuzzy Logic Stress Classification and Coping System!
