import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home";
import "./styles.css";
import "./stepsFix.css";
import { installUiFixes } from "./uiFixes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);

// Apply only presentation/text corrections after React has rendered.
installUiFixes();
