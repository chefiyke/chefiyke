/**
 * Shared scroll utility — scrolls to a section by id, offsetting
 * below the 64px fixed navbar with an extra 8px breathing gap.
 *
 * If href starts with "#" it is treated as a section scroll target.
 * Anything else is opened in a new tab.
 */
export function scrollToSection(idOrHref: string): void {
  const id = idOrHref.startsWith("#") ? idOrHref.slice(1) : idOrHref;
  const el = document.getElementById(id);
  if (!el) return;
  const navHeight = 64;
  const gap = 8;
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight - gap;
  window.scrollTo({ top, behavior: "smooth" });
}
