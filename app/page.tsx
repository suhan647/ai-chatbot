import Chatbot from "./components/Chatbot";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-black dark:to-gray-800 p-4">
      <Chatbot />
    </div>
  );
}
