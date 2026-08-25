import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home";
import "./styles.css";
import { installUiFixes } from "./uiFixes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);

installUiFixes();
