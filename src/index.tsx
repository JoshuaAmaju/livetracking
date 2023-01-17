import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "react-query";

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

const client = new QueryClient();

root.render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
