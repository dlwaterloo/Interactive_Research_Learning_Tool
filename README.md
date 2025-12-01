# QUIREY - Research Learning Tool

An interactive research and learning tool for academic inquiry, built with React and Vite.

## Features

- **Ideate Mode**: Generate research topics and structure your initial inquiry
- **Research Mode**: Search and read academic papers with integrated learning modules
- **Interactive Mode**: Visualize and connect ideas on an infinite canvas
- **Reflection Mode**: Synthesize findings with AI-powered persona chats and citation management

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Lucide React (Icons)
- Google Gemini API (for AI features)
- SerpAPI (for real academic paper searches via Google Scholar)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Keys:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your API keys:
     - `VITE_GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
     - `VITE_SERPAPI_KEY`: Get from [SerpAPI](https://serpapi.com/)
   - The `.env` file is already in `.gitignore` and won't be committed

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── GlassCard.jsx
│   │   └── ProfileImage.jsx
│   ├── modes/           # Main application modes
│   │   ├── IdeateMode.jsx
│   │   ├── ResearchMode.jsx
│   │   ├── InteractiveMode.jsx
│   │   └── ReflectionMode.jsx
│   ├── Header.jsx
│   ├── ChatModal.jsx
│   ├── LearningModulesSidebar.jsx
│   └── IntroductionScreen.jsx
├── constants/           # Configuration and constants
│   ├── colors.js
│   ├── nodeThemes.js
│   ├── personas.js
│   ├── reflectionPapers.js
│   └── learningModules.js
├── utils/               # Utility functions
│   └── api.js
├── App.jsx              # Main application component
├── main.jsx             # Application entry point
└── index.css           # Global styles
```

## Environment Variables

For production, create a `.env` file:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SERPAPI_KEY=your_serpapi_key_here
```

The API keys are currently hardcoded in `src/utils/api.js` for development. For production, use environment variables for security.

## Features Overview

### Ideate Mode
- Generate research questions from broad topics
- AI-powered topic brainstorming

### Research Mode
- **Real paper searches** via SerpAPI/Google Scholar (no generated content)
- View actual paper websites in embedded iframe
- Interactive reading interface with highlighting
- Integrated learning modules sidebar
- Note-taking for patterns, thesis impact, and research gaps
- Citation counts and source links

### Interactive Mode
- Infinite canvas for concept mapping
- Drag-and-drop nodes
- Connect ideas with visual links
- AI-generated insights
- Multiple node types (notes, headings, charts, images)

### Reflection Mode
- Literature matrix view
- Citation management
- AI persona chats (Skeptic, Visionary, Professor)
- Synthesized insights from research

## License

MIT

