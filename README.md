# Medi Bud AI — Your Intelligent Indian Health Companion

> **For informational purposes only. Not a substitute for professional medical advice.**

Medi Bud AI is a personalised health companion built for the average Indian consumer. Powered by **Google Gemini 2.5 Flash**, it delivers context-aware, culturally grounded health guidance — adapting every response to your unique medical profile, dietary preferences, and lifestyle.

---

## Core Features

### AI Chat
- Powered by **Google Gemini 2.5 Flash** — fast, accurate, nuanced responses
- Fluid mobile layout (chat list defaults to full screen, switching seamlessly to chat room view)
- Understands your **conditions, medications, BMI, and allergies** — every response is built around your profile, not a template
- Responses include:
  - Rich **prose explanations** with bold terms, bullet points, and Indian household remedies
  - **Visual health cards** (colour-coded by type: tips, warnings, home remedies, metrics, diet, medication)
  - **Nutritional values** (calories, carbs, protein, fat) where food is discussed
- Full support for **multilingual input**: English, Hindi, Marathi, Tamil, Bengali, and more
- **Global Dark/Light toggle** using an intelligent inversion engine saving data assets from distortion 

### Food Image Analysis
- Upload a photo of any meal directly in the chat
- Gemini **vision AI** identifies the dish, ingredients, and approximate nutritional breakdown
- Contextual health impact: "Does this suit my Diabetes and PCOS?"
- **EAT / AVOID / MODIFY** recommendation based on your profile
- Allergen risk flagging based on your registered allergies

### Voice Navigation & Voice Typing
- Global **hands-free voice navigation** — say "Open Chat", "Show my plan", "Check symptoms" to navigate the entire app
- **Voice typing** in chat — microphone button transcribes speech directly into the input field before sending
- Tuned for **Indian English** (`en-IN` speech model)
- Privacy-first: all speech recognition is browser-native, nothing is sent to external servers

### Weekly Health Plans
- Generates a comprehensive **7-day weekly schedule** formatted beautifully in a premium two-column dashboard
- Tailor made dynamically to your:
  - BMI and weight goals
  - Active conditions (Diabetes, PCOS, Hypertension, Obesity)
  - Dietary preference: Strictly **Veg** or **Non-Veg** Indian cuisine
- Diet and Workout toggles dynamically update your active focus
- **Export as PDF** instantly

### Symptom Checker
- Describe your symptoms in natural language
- AI triages to: **Emergency / See Doctor Soon / Monitor / Self-Care**
- Returns: Possible causes, what to watch for, do now, avoid

### Geolocation — Free 10km Nearby Care Mapping
- Click Find Nearby Care navigating you to a fully built-in Leaflet Map canvas
- Driven by a 10km radius geolocation fetch against the strictly open source **OpenStreetMap Overpass API** (Free, no keys needed)
- Visual numbered map plotting to track **Medical Centers, Doctors, Pharmacies, and Clinics**.
- Contains interactive Call buttons mapped to available node phone numbers.

### Indian Multilingual Support
- Language picker in the navbar (persisted across the session via localStorage)
- Supported: English, Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Punjabi, Odia
- AI responds natively in the selected language's regional script

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| AI Engine | Google Gemini 2.5 Flash |
| Auth & Database | Firebase (Auth + Firestore) |
| Voice | Browser Web Speech API (`webkitSpeechRecognition`) |
| Icons | Lucide React |
| Fonts | Sora + DM Serif Display (Google Fonts) |
| Styling | Vanilla CSS-in-JS (inline `<style>` blocks) |

---

## Project Structure

```
Medi-Bud/
├── app/
│   ├── page.tsx          # Landing page (features, how-it-works)
│   ├── layout.tsx        # Root layout + VoiceNavigator
│   ├── chat/page.tsx     # AI chat companion with image analysis
│   ├── plan/page.tsx     # 7-day AI meal & workout planner
│   ├── symptoms/page.tsx # Symptom checker with geolocation
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   └── survey/page.tsx
├── components/
│   ├── Navbar.tsx
│   └── VoiceNavigator.tsx  # Global floating voice nav
├── lib/
│   └── gemini.js           # Gemini API wrapper (text + image)
└── public/
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Keys

> **Note:** API keys are currently hardcoded for development. Before deploying to production, move them to `.env.local`:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## Health Disclaimer

Medi Bud AI is designed to **supplement**, not replace, professional medical care. All responses are for informational purposes only. Always consult a qualified healthcare provider for diagnosis and treatment.