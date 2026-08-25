export function installUiFixes() {
  let timer: number | undefined;

  const applyFixes = () => {
    // Replace temporary/plain text markers with polished UI copy.
    document.querySelectorAll<HTMLElement>(".trust span, .spec-grid span").forEach((item) => {
      if (item.textContent?.startsWith("OK ")) {
        item.textContent = item.textContent.replace(/^OK\s+/, "✓ ");
      }
    });

    document.querySelectorAll<HTMLElement>(".choose").forEach((item) => {
      if (item.textContent?.includes("OK Kamera terpilih") || item.textContent?.includes("✓ Kamera terpilih")) {
        item.textContent = "Kamera pilihanmu";
      }
    });

    document.querySelectorAll<HTMLElement>(".btn").forEach((item) => {
      if (item.textContent?.trim().endsWith(" v")) {
        item.textContent = item.textContent.replace(/\s+v\s*$/, " ↓");
      }
    });

    const instagramLink = document.querySelector<HTMLElement>("#cerita .section-head .text-link");
    if (instagramLink?.textContent?.includes("@kamerain09")) instagramLink.textContent = "Lihat @kamerain09 ↗";

    document.querySelectorAll<HTMLElement>(".official-link-grid a strong").forEach((item) => {
      if (item.textContent?.trim() === "^") item.textContent = "↗";
    });

    const filmCatalogLink = document.querySelector<HTMLElement>(".film-foot a");
    if (filmCatalogLink?.textContent?.trim().endsWith("^")) filmCatalogLink.textContent = filmCatalogLink.textContent.replace(/\s*\^\s*$/, " ↗");
  };

  const scheduleFixes = () => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(applyFixes, 50);
  };

  window.requestAnimationFrame(() => window.requestAnimationFrame(applyFixes));
  document.addEventListener("click", scheduleFixes, { passive: true });

  return () => {
    if (timer) window.clearTimeout(timer);
    document.removeEventListener("click", scheduleFixes);
  };
}
