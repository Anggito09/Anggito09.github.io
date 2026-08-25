export function installUiFixes() {
  const root = document.getElementById("root");
  if (!root) return () => {};

  const applyFixes = () => {
    document.querySelectorAll<HTMLElement>(".trust span").forEach((item) => {
      if (item.textContent?.startsWith("OK ")) {
        item.textContent = item.textContent.replace(/^OK\s+/, "✓ ");
      }
    });

    document.querySelectorAll<HTMLElement>(".choose").forEach((item) => {
      if (item.textContent?.startsWith("OK ")) {
        item.textContent = item.textContent.replace(/^OK\s+/, "✓ ");
      }
    });

    document.querySelectorAll<HTMLElement>(".spec-grid span").forEach((item) => {
      if (item.textContent?.startsWith("OK ")) {
        item.textContent = item.textContent.replace(/^OK\s+/, "✓ ");
      }
    });

    document.querySelectorAll<HTMLElement>(".btn").forEach((item) => {
      if (item.textContent?.trim().endsWith(" v")) {
        item.textContent = item.textContent.replace(/\s+v\s*$/, " ↓");
      }
    });

    const instagramLink = document.querySelector<HTMLElement>("#cerita .section-head .text-link");
    if (instagramLink?.textContent?.includes("@kamerain09")) {
      instagramLink.textContent = "Lihat @kamerain09 ↗";
    }

    document.querySelectorAll<HTMLElement>(".official-link-grid a strong").forEach((item) => {
      if (item.textContent?.trim() === "^") item.textContent = "↗";
    });

    const filmCatalogLink = document.querySelector<HTMLElement>(".film-foot a");
    if (filmCatalogLink?.textContent?.trim().endsWith("^")) {
      filmCatalogLink.textContent = filmCatalogLink.textContent.replace(/\s*\^\s*$/, " ↗");
    }
  };

  applyFixes();

  const observer = new MutationObserver(applyFixes);
  observer.observe(root, { childList: true, subtree: true, characterData: true });

  return () => observer.disconnect();
}
