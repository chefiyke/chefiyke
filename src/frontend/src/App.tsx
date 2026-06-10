import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree";

// Apply dark mode immediately — no flash of light theme
if (typeof document !== "undefined") {
  document.documentElement.classList.add("dark");
  document.documentElement.style.colorScheme = "dark";
}

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
