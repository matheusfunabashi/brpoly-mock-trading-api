import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

async function enableMocking() {
  // Only enable MSW in development when VITE_MOCK_API is true or not set
  if (import.meta.env.VITE_MOCK_API === 'false') {
    return;
  }

  const { worker } = await import("./lib/api/mocks/browser");

  return worker.start({
    onUnhandledRequest: "bypass",
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
