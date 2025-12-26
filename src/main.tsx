import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

async function enableMocking() {
  if (!import.meta.env.DEV) return;
  if (import.meta.env.VITE_MOCK_API === "false") return;

  const { worker } = await import("./lib/api/mocks/browser");
  return worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
