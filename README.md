# Tri-Gate Tactic

An immersive, turn-based strategy card game built with Next.js where anime characters battle for supremacy.

![Banner](/public/assets/showcase.png)
*(Note: Screenshot placeholder)*

## 📖 Documentation
We have detailed documentation available in the `docs/` directory:

-   [**Game Mechanics**](./docs/GAME_MECHANICS.md): Learn the rules, stats, and how to play.
-   [**Architecture**](./docs/ARCHITECTURE.md): Technical overview of the code, state management, and API.
-   [**Roadmap & TODOs**](./docs/TODO.md): Planned features and improvements.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/anime-battle-cards.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Features

-   **Dynamic Card Generation:** Characters are fetched in real-time from the [AniList API](https://anilist.co), with stats generated based on their popularity.
-   **Strategic Combat:** Manage your Field, Hand, and HP. Use Swaps and Wildcards tactically.
-   **3D Battle Arena:** Immersive visual experience with 3D transforms and animations.
-   **Auto-Battle Mode:** Let the AI fight for you.
-   **Responsive Design:** Works on modern browsers.

## 🛠️ Tech Stack

-   **Frontend:** Next.js 16 (App Router), React 19
-   **Styling:** Tailwind CSS, Framer Motion
-   **State Management:** React Hooks (`useReducer`)
-   **Utilities:** `canvas-confetti`, `lucide-react`

## 🤝 Contributing

Contributions are welcome! Please check out the [TODO list](./docs/TODO.md) for ideas on where to start.

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License.