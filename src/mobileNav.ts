export function installMobileNav() {
  const nav = document.querySelector<HTMLElement>(".nav");
  const links = document.querySelector<HTMLElement>(".navlinks");
  if (!nav || !links || nav.querySelector(".mobile-nav-toggle")) return;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "mobile-nav-toggle";
  toggle.setAttribute("aria-label", "Buka menu navigasi");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = '<span></span><span></span><span></span>';

  nav.insertBefore(toggle, links);

  const closeMenu = () => {
    nav.classList.remove("mobile-menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Buka menu navigasi");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("mobile-menu-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
  });

  links.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 850) closeMenu();
  });
}
