# 📖 Hafiz – Modern Quran Memorization & Review Assistant

[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28.svg?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Hafiz** is a comprehensive, feature-packed Quran memorization and review platform engineered to help users effectively memorize, practice, and retain the Quran using Spaced Repetition Systems (SRS), AI-powered voice recitation analysis, adaptive quizzes, and structured daily plans.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| 🔍 **Smart Quran Search** | Instant lookup by Surah name, number, reference (e.g. `2:255`), or full Quranic text search with or without Arabic diacritics (*Tashkeel*). |
| 📖 **Interactive Practice** | Line-by-line hiding, verse repetition loops, word-by-word reveal, and high-quality audio recitation players. |
| 🎙️ **Voice Recitation Feedback** | AI-driven speech-to-text recognition evaluating verse accuracy and pronunciation feedback in real-time. |
| 🧠 **Spaced Repetition (SRS)** | Scientifically timed review schedules based on memory strength and recall difficulty ratings. |
| 🎯 **Memorization Plans** | Pre-configured goals (e.g., Juz 'Amma in 30 Days, Surah Al-Mulk in 1 Week) or customizable daily verse goals. |
| 📊 **Progress Analytics** | Interactive weekly progress charts, memory health distribution, retention rate metrics, and streak tracking. |
| 🏆 **Gamification** | Milestones, streak shields, downloadable achievement badges, and optional community leaderboards. |
| 🌐 **Localization & Theme** | Native English & Arabic (with full RTL support) and eye-friendly Light & Dark modes. |

---

## 📸 Demo & Interface Previews

### 🔍 Smart Quran & Ayah Search
Search for any Surah by name, number, or exact verse reference (`2:255`), or type any Arabic verse phrase (e.g., `أَلَمْ`, `الم`, `الْحَمْدُ لِلَّهِ`) to view all matching Ayahs instantly.

```
+-------------------------------------------------------------------------------+
|  🔍  [ أَلَمْ                                                    ]  [ Search ]  |
|  💡 Search by Surah name, number, reference, or written text with/without diacritics  |
+-------------------------------------------------------------------------------+
|  📖 Matching Ayahs in Quran (4)                                               |
|  +#2:243  Al-Baqarah                  [Practice this Ayah ↙]                     |
|   أَلَمْ تَرَ إِلَى الَّذِينَ خَرَجُوا مِن دِيَارِهِمْ وَهُمْ أُلُوفٌ حَذَرَ الْمَوْتِ ﴿٢٤٣﴾     |
|                                                                               |
|  +#105:1 Al-Fil                      [Practice this Ayah ↙]                     |
|   أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ ﴿١﴾                           |
+-------------------------------------------------------------------------------+
```

---

## 🚀 How-To Guides

### 1️⃣ How to Search & Select an Ayah Range
1. Open the **Surah Selector** tab on the Dashboard.
2. Enter a query into the search bar:
   - **Surah Name**: Type `Baqarah`, `Yasin`, or `الملك`.
   - **Surah Number**: Type `67` for Surah Al-Mulk.
   - **Direct Reference**: Type `2:255` for Ayat Al-Kursi.
   - **Text Phrase**: Type `الْحَمْدُ لِلَّهِ` or `الم`.
3. Click **Search** to view all matching Surahs and exact Ayah occurrences.
4. Select your target **From Ayah** and **To Ayah** range and click **Start Practice**.

### 2️⃣ How to Use Voice Recitation Feedback
1. Start a practice session for any selected verse.
2. Click the 🎙️ **Voice Feedback** button.
3. Grant microphone permissions when prompted by your browser.
4. Recite the verse clearly in Arabic.
5. The system compares your spoken audio against the authentic verse text and highlights matched words in green or missing words in red.

### 3️⃣ How to Set Up a Structured Memorization Plan
1. Navigate to the **Memorization Plans** section on the main Dashboard.
2. Browse through popular preset goals:
   - **Juz 'Amma (30 Days)**: ~19 Ayahs/day
   - **Surah Al-Mulk (7 Days)**: ~4 Ayahs/day
   - **Surah Al-Kahf (14 Days)**: ~8 Ayahs/day
   - **Consistent Daily Page**: ~15 Ayahs/day
3. Click **Activate Plan** to automatically update your daily goal and track your target schedule.

---

## 🛠️ Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Motion / Framer Motion](https://motion.dev/), [Lucide React Icons](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Database & Auth**: [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Firebase Authentication](https://firebase.google.com/docs/auth)
- **External API**: [Al Quran Cloud API](https://alquran.cloud/api) (Surah metadata, audio recitations, text search engine)

---

## 💻 Getting Started (Local Development)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/hafiz-quran-app.git
   cd hafiz-quran-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root (refer to `.env.example`):
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
hafiz-quran-app/
├── src/
│   ├── components/         # React UI Components
│   │   ├── AyahAudioPlayer.tsx
│   │   ├── DailyMemorizationGoal.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MemorizationPlans.tsx
│   │   ├── Quiz.tsx
│   │   ├── SurahSelector.tsx
│   │   ├── VoiceRecitationFeedback.tsx
│   │   └── WeeklyProgressReport.tsx
│   ├── i18n/               # Internationalization & Translations (EN / AR)
│   │   └── translations.ts
│   ├── services/           # Quran API & Firebase Services
│   │   └── quranService.ts
│   ├── AuthContext.tsx     # Firebase Authentication State
│   ├── LanguageContext.tsx # EN/AR Language & RTL Context
│   ├── ThemeContext.tsx    # Light/Dark Theme Context
│   ├── App.tsx             # Main Application Entry & Routing
│   └── types.ts            # TypeScript Interfaces & Enums
├── metadata.json           # App permissions & metadata
├── package.json            # npm package definition & scripts
└── README.md               # Project documentation
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/hafiz-quran-app/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git checkout -b feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
