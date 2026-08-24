# PulseMind AI — Health Assistant & Medical Record Explainer

PulseMind is a human-centered health assistant designed to help people assess symptoms, understand complex medical records and lab test results in everyday language, and track daily health vitals.

Built with a focus on clean clinical clarity, accessible typography, and safety-first design, PulseMind avoids confusing medical jargon and artificial visual clutter to provide calm, practical health guidance.

---

## Key Features

### 1. Symptom & Health Risk Assessment
- **Step-by-Step Check**: Guided intake covering patient age group, symptom duration, severity rating (1–10), anatomical systems, and optional photo attachments (e.g., for rashes or swelling).
- **Risk Stratification**: Categorizes acuity into clear, color-coded levels (**Low**, **Moderate**, **High**, **Critical**) with an estimated timeframe to seek care.
- **Differential Possibilities**: Suggests potential conditions to discuss with a licensed physician, ranked by symptom match.
- **Red Flag Warnings**: Clear alerts for emergency symptoms that require urgent medical attention.
- **Questions for Your Doctor**: Generates focused, printable/copyable questions to ask your doctor during your next visit.

### 2. Medical Records & Lab Results Explainer
- **Plain-Language Explanations**: Converts complex laboratory values (e.g., lipid panels, CBC, metabolic panels, radiology MRI notes) into straightforward terms with everyday analogies.
- **Biomarker Breakdown**: Displays patient values against standard reference ranges, explaining what each test measures and why it matters.
- **Audio Pronunciation & Definitions**: Built-in speech synthesis to listen to tricky medical terms and their plain-English definitions aloud.
- **Instant Sample Cases**: One-click sample reports (Lipid Cholesterol Panel, Complete Blood Count, Comprehensive Metabolic Panel, Lumbar Spine MRI) to test immediately.

### 3. Daily Vitals & Symptom Log
- **Personalized Baseline Onboarding**: When users first enter the app, a dedicated setup flow allows them to enter their actual baseline values (resting heart rate, blood pressure, oxygen saturation, sleep hours, and pain level). Any unentered metrics display a clean "N/A" state with zero confusing dummy data.
- **Vitals Monitoring**: Track resting heart rate, blood pressure, sleep hours, oxygen levels, and pain index over time with clean interactive trend charts.
- **Symptom Journal**: Log symptom flare-ups with severity ratings, suspected triggers, tags, and personal notes.
- **Daily Recovery Checklist**: Interactive habits checklist covering hydration, mobility, medications, and wellness routines with progress tracking.
- **Private Local Storage**: All vitals and symptom logs persist locally in your browser session without storing personal health data on external servers.

### 4. Guided Breathing & Stress Relief
- **Clinically Validated Techniques**: Interactive visual and audio pacing for **4-7-8 Relaxing Breath** (to stimulate vagus nerve activation and lower heart rate) and **Box Breathing (4-4-4-4)** (for focus and stress relief).
- **Custom Sound Cues**: Optional gentle audio chimes to guide breath transitions with eyes closed.

### 5. Emergency Care Navigator
- **Quick-Dial Helplines**: Direct access buttons for emergency dispatch (911), Suicide & Crisis Lifeline (988), and Poison Control (1-800-222-1222).
- **Triage Guide Matrix**: Clear decision matrix outlining when to visit an Emergency Department (ER), Urgent Care Clinic, or Primary Care Provider.
- **Emergency Facility Locator**: One-click link to find open emergency care facilities nearby.

---

## Design Standards & Philosophy

PulseMind follows modern, human-centric design principles:
- **Clean Geometric Structure**: Uses refined border radii (`rounded-lg`, `rounded-md`) and balanced negative space rather than exaggerated bubbly cards or neon gradients.
- **High-Contrast Clinical Palette**: Neutral slates paired with purposeful healthcare accents (deep navy, medical blue, calm emerald, warm amber, and clear rose for emergencies).
- **Everyday Language**: Replaces robotic or overly academic phrasing with clear, compassionate, and straightforward communication.
- **Accessibility & Contrast**: Conforms to WCAG AA color contrast standards with clear visual hierarchy, accessible touch targets (≥44px), and legible typography.

---

## Technical Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Intelligence**: Google Gemini API (`@google/genai` TypeScript SDK) with server-side proxy routes and rule-based safety fallbacks
- **State & Storage**: React Context / Hooks with browser `localStorage` persistence

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── analyze-symptoms/route.ts   # Server-side symptom triage endpoint
│   │   └── decode-lab/route.ts          # Server-side lab report decoding endpoint
│   ├── globals.css                     # Tailwind CSS global styles
│   ├── layout.tsx                      # Root HTML layout and metadata
│   └── page.tsx                        # Main dashboard hub & state manager
├── components/
│   ├── DisclaimerBanner.tsx            # Permanent medical disclaimer bar
│   ├── EmergencyGuideModal.tsx         # Emergency symptoms & helplines modal
│   ├── Footer.tsx                      # Educational notice & footer links
│   ├── InitialSetupModal.tsx           # First-entry baseline health values onboarding
│   ├── InteractiveBreathing.tsx        # 4-7-8 & Box breathing visualizer
│   ├── LabDecoder.tsx                  # Lab result & medical jargon explainer
│   ├── Navbar.tsx                      # Clean header navigation & emergency trigger
│   ├── SymptomAnalyzer.tsx             # Multi-step symptom assessment tool
│   └── VitalsTracker.tsx               # Vitals charts, symptom log, daily habits
├── lib/
│   ├── fallbackData.ts                 # Sample presets & clinical fallback rules
│   ├── gemini.ts                       # Gemini AI client configuration
│   ├── types.ts                        # TypeScript data models and interfaces
│   └── utils.ts                        # Utility helpers
├── metadata.json                       # AI Studio applet metadata
├── package.json                        # Dependencies & build scripts
└── README.md                           # Project documentation
```

---

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
1. Clone or download the repository:
   ```bash
   git clone <repo-url>
   cd pulsemind-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and add your Gemini API key (optional — the app includes built-in clinical fallback rules if an API key is not present):
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. Build for production:
   ```bash
   npm run build
   npm run start
   ```

---

## Medical Disclaimer

> **Important Notice**: PulseMind AI is an educational health tool and does **not** provide formal medical diagnosis, clinical prognosis, or treatment prescriptions. It is designed to help patients organize their thoughts and prepare for informed conversations with licensed healthcare professionals. 
> 
> If you or someone you are with is experiencing life-threatening symptoms (such as severe chest pain, sudden numbness/paralysis, difficulty breathing, or severe bleeding), call **911** or go to the nearest emergency room immediately.
