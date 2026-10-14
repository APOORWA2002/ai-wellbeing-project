# AI-Based Intelligent Solution for Healthcare & Well-being
## Wellbeing chat (offline mode)

The Wellbeing Chat tab runs in offline demo mode by default and does not require an API key or network access. It includes built-in stress-relief prompts, optional sharing of the latest assessment for contextual suggestions, a new-chat control, and crisis-language detection with Sri Lanka support contacts. Crisis detection is a keyword-based safety net, not a clinical assessment.

## A Fuzzy Logic Approach to Real-Time Stress Classification and Adaptive Coping Recommendation

**Course:** Essentials of Artificial Intelligence – IT3182  
**Group:** 12  
**Institution:** General Sir John Kotelawala Defence University (KDU), Faculty of Computing  

---

> ⚡ **Quick Start for Users & Evaluators:**  
> Looking for a fast, step-by-step setup guide? Read [`QUICKSTART.md`](QUICKSTART.md) or run:
> ```bash
> pip install -r requirements.txt
> streamlit run app.py
> ```
> To run the automated tests: `python -m pytest -v`

---

## 1. Project Overview & Context

In contemporary academic and vocational settings, individuals face chronic cognitive pressures, prolonged sedentary digital engagement, and irregular sleep routines. Prolonged physiological stress triggers autonomic nervous system dysregulation, marked by parasympathetic (vagal) withdrawal and sympathetic dominance.

This project implements an intelligent well-being decision-support prototype. It accepts three non-invasive physiological and behavioral indicators:
1. **Heart Rate Variability (HRV)**
2. **Daily Screen Time**
3. **Sleep Duration**

It evaluates these inputs using a **Mamdani-Type Fuzzy Inference System (FIS)** with **centroid defuzzification**, categorizes the continuous **Stress Index (0–100)** into **Low / Medium / High**, passes the category into a **separate deterministic Rule-Based Recommendation Engine**, and generates transparent white-box explanations.

> **Important Educational / Non-Clinical Disclaimer:**  
> This system provides an educational well-being estimate based on the information entered by the user. It is not a medical diagnosis or substitute for professional healthcare advice. It is an academic AI prototype for educational demonstration, not a medical or diagnostic device.

---

## 2. Problem Statement

Conventional automated stress assessment models often rely on rigid crisp thresholds or opaque black-box machine-learning predictions:
- Human physiological responses exist on a continuum: an HRV of 49 ms and 51 ms do not represent radically different clinical states, yet rigid binary classifiers create artificial discontinuities.
- Wearable-driven healthcare models often operate without explainability, offering users a stress score without transparent justification of the underlying factors.
- Subjective lifestyle factors like screen fatigue and sleep debt are inherently imprecise and linguistic in nature.

This project addresses these challenges using **Fuzzy Set Theory** and **Mamdani Rule Inference**, modeling linguistic uncertainty through overlapping trapezoidal and triangular membership functions, coupled with a completely transparent explanation engine and an independent coping recommendation engine.

---

## 3. AI Technique & Computational Pipeline

The computational chain strictly follows the genuine Mamdani fuzzy inference process:

```text
Crisp Inputs (HRV, Screen Time, Sleep Duration)
      ↓
Membership Functions
      ↓
Fuzzification (Degrees μ ∈ [0, 1])
      ↓
Mamdani Rule Evaluation (Min / AND Operator across 31 Rules)
      ↓
Rule Activation & Consequent Truncation
      ↓
Output Aggregation (Max / OR Operator)
      ↓
Centroid Defuzzification
      ↓
Continuous Stress Index (0–100)
      ↓
Crisp Stress Category: Low [0, 40) | Medium [40, 70) | High [70, 100]
      ↓
Separate Deterministic Recommendation Engine (Category + Context)
      ↓
Selected Coping Recommendation
      ↓
Structured White-Box Explanation
```

---

## 4. Input & Output Variables

### 4.1 Heart Rate Variability (HRV)
- **Range:** 20.0 – 120.0 ms
- **Linguistic Terms & Membership Functions:**
  - `Low`: Trapezoidal `[20, 20, 35, 50]`
  - `Normal`: Triangular `[35, 55, 75]`
  - `High`: Trapezoidal `[60, 80, 120, 120]`

### 4.2 Daily Screen Time
- **Range:** 0.0 – 16.0 hours
- **Linguistic Terms & Membership Functions:**
  - `Short`: Trapezoidal `[0, 0, 2, 5]`
  - `Moderate`: Triangular `[3, 6, 9]`
  - `Prolonged`: Trapezoidal `[7, 11, 16, 16]`

### 4.3 Sleep Duration
- **Range:** 2.0 – 10.0 hours
- **Linguistic Terms & Membership Functions:**
  - `Inadequate`: Trapezoidal `[2, 2, 4, 5.5]`
  - `Marginal`: Triangular `[4.5, 6, 7.5]`
  - `Optimal`: Trapezoidal `[6.5, 8, 10, 10]`

### 4.4 Output Variable: Stress Index
- **Range:** 0.0 – 100.0 points
- **Defuzzification Method:** Centroid
- **Linguistic Terms & Membership Functions:**
  - `Low`: Triangular `[0, 0, 40]`
  - `Medium`: Triangular `[25, 50, 75]`
  - `High`: Triangular `[60, 100, 100]`

---

## 5. Final Crisp Stress Classification

After centroid defuzzification, the continuous Stress Index is mapped to exactly one user-facing category using clean decision boundaries:

```python
if stress_index < 40.0:
    category = "Low"
elif stress_index < 70.0:
    category = "Medium"
else:
    category = "High"
```

- **Low Stress:** $[0.0, 40.0)$
- **Medium Stress:** $[40.0, 70.0)$
- **High Stress:** $[70.0, 100.0]$

---

## 6. Rule Base Architecture (31 Rules Total)

The rule base contains exactly **31 rule definitions**:
- **Layer A (27 Core Rules: C01–C27):** Covering all combinations of 3 HRV terms $\times$ 3 Screen terms $\times$ 3 Sleep terms.
- **Layer B (4 Supplementary Rules: R4, R5, R6, R7):** Documented broader two-antecedent rules.

### 6.1 Reasoning Heuristic for Additional Core Rules (Section 18)
The 23 additional core rules follow this explicit physiological design logic:
- **Stress-Associated Terms:** Low HRV, Prolonged Screen, Inadequate Sleep
- **Positive Terms:** High HRV, Short Screen, Optimal Sleep
- **Neutral Terms:** Normal HRV, Moderate Screen, Marginal Sleep

**Design Rules:**
- **High Stress:** Assigned when at least **two stress-associated terms** are present.
- **Low Stress:** Assigned when there are **no stress-associated terms** and at least **two positive terms** are present.
- **Medium Stress:** Assigned for the remaining mixed, intermediate, or single-stress-factor profiles.
- **Preserved Rules:** Documented rules $R_1, R_2, R_3, R_8$ are preserved verbatim as specified in the Stage 2 report.

### 6.2 Complete 27 Core Rules Table (Layer A)

| ID | Report Alias | HRV | Screen Time | Sleep Duration | Consequent | Design Rationale |
|---|---|---|---|---|---|---|
| **C01** | - | Low | Short | Inadequate | High | Two stress-associated factors (Low HRV, Inadequate Sleep); single positive factor does not override them. |
| **C02** | - | Low | Short | Marginal | Medium | Mixed profile: one stress factor (Low HRV), one neutral (Marginal Sleep), one positive (Short Screen). |
| **C03** | **R8** | Low | Short | Optimal | Medium | Preserved verbatim from Stage 2 report (R8): Low HRV indicates lingering fatigue requiring calm monitoring. |
| **C04** | - | Low | Moderate | Inadequate | High | Two stress-associated factors (Low HRV, Inadequate Sleep); moderate screen time provides no protective offset. |
| **C05** | - | Low | Moderate | Marginal | Medium | One stress-associated factor (Low HRV) accompanied by neutral screen and sleep demands. |
| **C06** | - | Low | Moderate | Optimal | Medium | One stress-associated factor (Low HRV) buffered by optimal sleep and moderate screen engagement. |
| **C07** | **R1** | Low | Prolonged | Inadequate | High | Preserved verbatim from Stage 2 report (R1): Critical convergence of all three primary stress-associated conditions. |
| **C08** | - | Low | Prolonged | Marginal | High | Two stress-associated factors (Low HRV, Prolonged Screen) drive acute cumulative strain. |
| **C09** | - | Low | Prolonged | Optimal | High | Two stress-associated factors (Low HRV, Prolonged Screen); single positive factor does not override them. |
| **C10** | - | Normal | Short | Inadequate | Medium | Single stress-associated factor (Inadequate Sleep) balanced by normal autonomic baseline and short screen use. |
| **C11** | - | Normal | Short | Marginal | Low | Zero stress-associated conditions; favorable short screen time and normal HRV sustain a low-stress state. |
| **C12** | - | Normal | Short | Optimal | Low | Zero stress-associated conditions and two positive terms (Short Screen, Optimal Sleep) produce a low-stress state. |
| **C13** | - | Normal | Moderate | Inadequate | Medium | Single stress-associated factor (Inadequate Sleep) with neutral HRV and screen habits. |
| **C14** | **R3** | Normal | Moderate | Marginal | Medium | Preserved verbatim from Stage 2 report (R3): All three parameters at neutral/intermediate baseline. |
| **C15** | - | Normal | Moderate | Optimal | Low | Zero stress-associated conditions; optimal sleep easily accommodates moderate study screen time. |
| **C16** | - | Normal | Prolonged | Inadequate | High | Two stress-associated factors (Prolonged Screen, Inadequate Sleep) overwhelm normal baseline HRV. |
| **C17** | - | Normal | Prolonged | Marginal | Medium | One stress-associated factor (Prolonged Screen) on a neutral autonomic and sleep baseline. |
| **C18** | - | Normal | Prolonged | Optimal | Medium | One stress-associated factor (Prolonged Screen) balanced by optimal restorative sleep. |
| **C19** | - | High | Short | Inadequate | Medium | One stress-associated factor (Inadequate Sleep) offset by two positive factors (High HRV, Short Screen). |
| **C20** | - | High | Short | Marginal | Low | Zero stress-associated conditions and two positive terms (High HRV, Short Screen) ensure a low-stress state. |
| **C21** | **R2** | High | Short | Optimal | Low | Preserved verbatim from Stage 2 report (R2): All three terms positive (High HRV, Short Screen, Optimal Sleep). |
| **C22** | - | High | Moderate | Inadequate | Medium | One stress-associated factor (Inadequate Sleep) moderated by high parasympathetic resilience. |
| **C23** | - | High | Moderate | Marginal | Low | Zero stress-associated conditions; robust autonomic flexibility absorbs moderate work and slight sleep deficit. |
| **C24** | - | High | Moderate | Optimal | Low | Zero stress-associated conditions and two positive terms (High HRV, Optimal Sleep) yield a low-stress state. |
| **C25** | - | High | Prolonged | Inadequate | High | Two stress-associated factors (Prolonged Screen, Inadequate Sleep); single positive factor does not override them. |
| **C26** | - | High | Prolonged | Marginal | Medium | One stress-associated factor (Prolonged Screen) moderated by high parasympathetic tone. |
| **C27** | - | High | Prolonged | Optimal | Low | Zero stress-associated conditions; two positive terms (High HRV, Optimal Sleep) effectively neutralize prolonged screen time. |

### 6.3 Complete 4 Supplementary Rules Table (Layer B)

| ID | Antecedent Clause | Consequent | Documented Coping Hint | Design Rationale |
|---|---|---|---|---|
| **R4** | HRV is Low AND Sleep is Inadequate | High | Sleep Hygiene Tip | Preserved verbatim from Stage 2 report (R4): Severe autonomic depression and sleep deficit directly signal high stress regardless of screen time. |
| **R5** | Screen Time is Prolonged AND Sleep is Marginal | Medium | Digital Detox Reminder | Preserved verbatim from Stage 2 report (R5): Screen overload coupled with marginal sleep generates moderate cognitive strain. |
| **R6** | HRV is High AND Sleep is Optimal | Low | Maintain Routine | Preserved verbatim from Stage 2 report (R6): Synergistic autonomic resilience and restorative sleep foster a stable low-stress state. |
| **R7** | HRV is Normal AND Screen Time is Prolonged | Medium | Short Walk Break | Preserved verbatim from Stage 2 report (R7): Prolonged screen engagement on a normal baseline induces physical fatigue. |

---

## 7. Decoupled Rule-Based Recommendation Engine

The recommendation engine is an independent deterministic component:
- It receives the stress category (`Low`, `Medium`, or `High`) and optional context flags:
  - **Available Time:** `5 minutes`, `10 minutes`, `20+ minutes`
  - **Context:** `Home`, `University`, `Work`, `Other`
- **Hard Constraint:** Contextual flags only select *between* coping actions within the given stress category; they **never alter the stress index or category**.
- The library includes all mandatory Stage 2 recommendations: *Active Cardio Break, No Action Needed, Breathing Exercise, Sleep Hygiene Tip, Digital Detox Reminder, Maintain Routine, Short Walk Break, Monitor / Breathing Exercise*.

---

## 8. Installation & Setup

```bash
# 1. Clone or navigate to the project directory
cd nifty-planck

# 2. Install required dependencies
pip install -r requirements.txt
```

---

## 9. Running the Application

Launch the Streamlit UI:

```bash
streamlit run app.py
```

Features included in the application:
1. **Real-Time Assessment:** Sliders for HRV, Screen Time, and Sleep Duration; Stress Gauge, color-coded badges, membership degree breakdown table, tailored coping recommendation card, and transparent rule activation panel.
2. **Fuzzy Membership Functions:** Publication-quality Matplotlib plots showing linguistic term curves and active user value markers.
3. **System Architecture Diagram:** Clear vector illustration of the 8-stage pipeline.
4. **Synthetic Dataset & Batch Inference:** Table preview and interactive batch evaluation tool.

---

## 10. Automated Testing

Run the full test suite after installing the dependencies in `requirements.txt`:

```bash
python -m pytest -v tests/
```

The automated tests cover the fuzzy engine, recommendation logic, input validation, offline chat safety, and account-scoped local storage. Test results depend on the environment and installed dependencies.

### Test Coverage Highlights
- `test_core_rule_cartesian_coverage`: Uses `itertools.product` to mathematically verify all 27 core combinations are present without gaps or duplicates.
- `test_supplementary_rules_isolated`: Confirms exactly 4 supplementary rules exist and do not count toward the 27-rule coverage assertion.
- `test_required_canonical_test_cases`:
  - Low Stress ($HRV=100$, $Screen=2$, $Sleep=9$) $\to$ **Low** ($< 40$)
  - High Stress ($HRV=30$, $Screen=14$, $Sleep=3$) $\to$ **High** ($\ge 70$)
  - Medium Stress ($HRV=65$, $Screen=7$, $Sleep=6$) $\to$ **Medium** ($[40, 70)$)
- `test_classification_thresholds_exact`: Boundary tests at $0.0$, $20.0$, $39.999$, $40.0$, $50.0$, $69.999$, $70.0$, $85.0$, $100.0$.
- `test_all_boundary_corners_no_crash`: Tests all 8 3D extremes: $HRV \in \{20, 120\}$, $Screen \in \{0, 16\}$, $Sleep \in \{2, 10\}$.
- `test_contextual_refinement_matrix`: Tests all permutations of category, available duration, and location context.

---

## 11. Synthetic Dataset

Stored in `data/synthetic_stress_data.csv`:
- Contains **122 samples** covering boundary extremes, representative student scenarios, linguistic grid intersections, and reproducible random samples (seed=42).
- Includes columns: `hrv_ms`, `screen_time_h`, `sleep_h`, `reference_category`.
- Header clearly marked: `# SYNTHETIC / SIMULATED DATA — NOT REAL CLINICAL DATA`.
- `reference_category` is generated by the fuzzy pipeline for validation and testing; it is not presented as independent ground truth.

---

## 12. Membership Function Assumptions & Rationale

Stored in `config/fuzzy_config.py` as initial engineering assumptions:
1. **HRV [20, 120] ms:**
   - *Low [20, 20, 35, 50]:* Below 35 ms indicates parasympathetic withdrawal and autonomic fatigue.
   - *Normal [35, 55, 75]:* Resting baseline for healthy young adults.
   - *High [60, 80, 120, 120]:* Robust vagal recovery and cardiovascular adaptability.
2. **Screen Time [0, 16] h:**
   - *Short [0, 0, 2, 5]:* Minimal digital strain.
   - *Moderate [3, 6, 9]:* Standard daily academic coursework demands.
   - *Prolonged [7, 11, 16, 16]:* Heavy digital fatigue and sensory overload.
3. **Sleep Duration [2, 10] h:**
   - *Inadequate [2, 2, 4, 5.5]:* Acute sleep debt impairing neurocognitive performance.
   - *Marginal [4.5, 6, 7.5]:* Borderline restorative rest.
   - *Optimal [6.5, 8, 10, 10]:* Clinically recommended 7–9 hours sleep window.
4. **Stress Index [0, 100]:**
   - *Low [0, 0, 40], Medium [25, 50, 75], High [60, 100, 100]*: Symmetric triangular sets providing smooth centroid deflection.

---

## 13. Limitations & Future Directions

1. **Prototype Status:** Developed for university AI coursework (*IT3182*). Not certified by FDA/CE as a medical diagnostic device.
2. **Synthetic Data:** The dataset is synthetic and intended for rule verification and system demonstration only.
3. **Manual Parameter Input:** Real-world deployments would integrate background synchronization with photoplethysmography (PPG) wearable sensors and OS screen-time APIs.

---

## Wellbeing Chat (AI stress-relief companion)

The **Wellbeing Chat** tab lets users talk through stress with a calm AI companion. It can guide breathing
exercises, help break down a heavy workload, and use the latest stress assessment (optional) to tailor its advice.

**Current mode**

The current UI uses the built-in offline, rule-based response engine. It does not require an API key, and a live AI provider is not connected in this build. The assistant is not a therapist or medical service.

**Safety design**

- Messages that suggest self-harm or suicide are **not** sent to the model. The app shows a fixed message with
  Sri Lankan helplines (1926, 1333, Sumithrayo, 119). Edit them in `chat/safety.py`.
- Keyword detection cannot catch every phrasing, so the helpline is also always visible under the chat box.
- The assistant is instructed not to diagnose, give medication advice, or claim to be human.
- Sharing the latest assessment with the assistant is **off by default** and must be enabled in *Chat settings*. No name or account ID is shared.

**Code layout:** `chat/safety.py` (crisis handling), `chat/assistant.py` (offline demo responses),
`ui/chat_view.py` (chat view), `tests/test_chat.py` (offline tests).

## Integrated platform features

- **Floating chat popup:** quick prompts and offline wellbeing support.
- **Accounts:** local demo registration/login with salted PBKDF2 password hashes. Use a unique demo password; this is not a production identity service.
- **Privacy settings:** assessment, chat, and game history saving are off by default and can be enabled individually.
- **History:** account-scoped assessments, trend chart, CSV export, saved chat review/deletion, and activity history.
- **Relax & Play:** guided breathing, 5-4-3-2-1 grounding, a calm matching game, and a mindfulness check-in. Activities are optional and are not clinical measures.
- **Counsellor contact:** a local demo request workflow only. It is not connected to a real counsellor, and submitting a request does not contact anyone.
- **Personal data export/deletion:** export available account data as JSON or delete the account and its associated local records.

### Local data and safety limitations

The SQLite database is stored at `data/user_data.sqlite3` by default and is excluded from Git. Protect the machine and its backups. Do not use real clinical or highly sensitive personal information in this academic prototype. Before deployment, independently verify all crisis-resource details, conduct a security/privacy review, and connect a real counselling provider if needed. Crisis keyword detection is imperfect and is not a risk assessment. In immediate danger, contact local emergency services or go to the nearest emergency department.

### Run tests

Install the dependencies first, then run `python -m pytest -v`. The full suite includes tests that require Streamlit and scikit-fuzzy to be installed.
