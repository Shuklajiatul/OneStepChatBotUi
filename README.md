# Chatbot Flow Builder

A modern, visual chatbot builder application built with Next.js 16, React Flow, and Tailwind CSS. This application allows users to design conversational flows using a drag-and-drop interface and preview them in real-time.

## 🚀 Features

-   **Visual Workflow Editor**: Drag-and-drop interface powered by `@xyflow/react` (React Flow) to design complex conversation logic.
-   **Diverse Node Types**: Support for various interaction types:
    -   **Start/End**: Define entry and exit points.
    -   **Messages**: Send text, images, or video.
    -   **Inputs**: Capture user responses (Text, Number, Email, etc.).
    -   **Interactive**: Buttons and List messages for structured choices.
    -   **Logic**: Condition nodes for branching flows and Delays for pacing.
    -   **Integrations**: Webhook nodes for external API calls.
-   **Real-time Preview**: Integrated chat interface to test workflows instantly.
-   **Modern UI/UX**: Built with Shadcn UI and Tailwind CSS for a polished, responsive, and accessible interface.
-   **Dynamic Navigation**: Breadcrumb navigation and intuitive sidebar layouts.
-   **State Management**: robust flow state handling with validation and persistence.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: JavaScript / React 19
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
-   **Diagramming**: [@xyflow/react](https://reactflow.dev/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
-   **Tooling**: [Biome](https://biomejs.dev/) (Linting/Formatting)

## 🏁 Getting Started

### Prerequisites

-   Node.js 18+ installed
-   npm, yarn, pnpm, or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/chatbot.git
    cd chatbot
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add necessary variables (e.g., API endpoints, Access Tokens).
    ```env
    NEXT_PUBLIC_URL=your_url_here
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
src/
├── app/
│   ├── (main)/          # Main application layout and routes
│   │   ├── chat/        # Chat preview interface
│   │   ├── workflows/   # Workflow listing and editor
│   │   └── dashboard/   # Dashboard overview
│   ├── api/             # Next.js API routes
│   └── layout.js        # Root layout with Toaster
├── components/
│   ├── ui/              # Reusable UI components (Shadcn)
│   └── ...              # Feature-specific components
└── lib/                 # Utilities and helper functions
```

## 📄 License

This project is licensed under the MIT License.
