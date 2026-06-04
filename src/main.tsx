import { createRoot } from "react-dom/client";
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import App from "./app/App.tsx";
import "./styles/index.css";

// ─── Initialize Monitoring (no-op if env vars are not set) ──────────────────
import { initSentry } from "./app/services/sentry";
import { initPostHog } from "./app/services/posthog";

initSentry();
initPostHog();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </QueryClientProvider>
);