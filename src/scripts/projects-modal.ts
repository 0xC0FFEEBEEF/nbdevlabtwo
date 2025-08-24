// src/scripts/projects-modal.ts
export default function initProjectsModal() {
  const modalNode = document.getElementById("project-modal");
  const bodyNode = document.getElementById("project-modal-body");

  if (!(modalNode instanceof HTMLElement) || !(bodyNode instanceof HTMLDivElement)) return;

  const modal: HTMLElement = modalNode;
  const body: HTMLDivElement = bodyNode;

  const openers = document.querySelectorAll<HTMLButtonElement>(".card.card-btn");
  const closeEls = modal.querySelectorAll<HTMLElement>("[data-close]");

  let lastFocus: HTMLElement | null = null;

  function open(slug: string) {
    const tpl = document.getElementById(`tpl-${slug}`);
    if (!(tpl instanceof HTMLTemplateElement)) return;

    body.replaceChildren(tpl.content.cloneNode(true));
    lastFocus = (document.activeElement as HTMLElement) ?? null;

    modal.classList.remove("hidden");
    document.documentElement.style.overflow = "hidden";
    (modal.querySelector(".modal__close") as HTMLElement | null)?.focus();
    window.addEventListener("keydown", onKey);
  }

  function close() {
    modal.classList.add("hidden");
    document.documentElement.style.overflow = "";
    body.replaceChildren();
    window.removeEventListener("keydown", onKey);
    lastFocus?.focus?.();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  openers.forEach((btn) =>
    btn.addEventListener("click", () => {
      const slug = btn.dataset.slug;
      if (slug) open(slug);
    }),
  );

  closeEls.forEach((el) => el.addEventListener("click", close));
}
