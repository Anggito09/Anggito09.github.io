import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home";
import "./styles.css";
import "./stepsFix.css";
import "./enhancements.css";
import "./occasionEnhancements.css";
import "./guideEnhancements.css";
import "./cameraImageEnhancements.css";
import "./mobileNav.css";
import { installUiFixes } from "./uiFixes";
import { installMobileNav } from "./mobileNav";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);

// Apply only presentation/text corrections after React has rendered.
installUiFixes();
window.requestAnimationFrame(() => installMobileNav());
