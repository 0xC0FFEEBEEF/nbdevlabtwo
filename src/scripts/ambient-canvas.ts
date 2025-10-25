const root = document.documentElement;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setPosition = (clientX: number, clientY: number) => {
  const x = Math.max(0, Math.min(1, clientX / window.innerWidth));
  const y = Math.max(0, Math.min(1, clientY / window.innerHeight));
  root.style.setProperty("--pointer-x", x.toString());
  root.style.setProperty("--pointer-y", y.toString());
};

const initialX = window.innerWidth / 2;
const initialY = window.innerHeight / 3;
setPosition(initialX, initialY);

if (!prefersReducedMotion) {
  let raf = 0;
  const update = (event: PointerEvent | MouseEvent | TouchEvent) => {
    const point = "touches" in event && event.touches.length > 0 ? event.touches[0] : (event as PointerEvent);
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(() => {
      setPosition(point.clientX, point.clientY);
    });
  };

  window.addEventListener("pointermove", update, { passive: true });
  window.addEventListener("mousemove", update, { passive: true });
  window.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length === 0) return;
      update(event);
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    setPosition(initialX, initialY);
  });
}
