import {
  useCallback,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  faces,
  nav,
  person,
  skills,
  education,
  experience,
  projects,
  contact,
  languages,
} from "./content";
import { FaceCanvas, type Mood } from "./face/FaceCanvas";
import { useFitHeadline, useTheme } from "./hooks";

const DISC = "#2f4bf0";
const EDITORIAL_FONT = '"Trebuchet MS", "Segoe UI", sans-serif';

function useActiveSection() {
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeSection;
}

/** Pull the glowing pendant down or click it to change the site theme.
 *  Keeps the site's existing useTheme() state and persistence untouched. */
function LightPullThemeSwitcher({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  const startY = useRef<number | null>(null);
  const suppressPointerClick = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [pull, setPull] = useState(0);

  const endPull = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (startY.current === null) return;
    const distance = Math.max(0, event.clientY - startY.current);
    if (distance > 24) {
      suppressPointerClick.current = true;
      onToggle();
    }
    startY.current = null;
    setDragging(false);
    setPull(0);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <button
      type="button"
      aria-label={dark ? "Pull or click to switch to light mode" : "Pull or click to switch to dark mode"}
      aria-pressed={dark}
      title="Pull down or click to change theme"
      className="group relative flex h-[60px] w-[60px] shrink-0 touch-none select-none items-start justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-disc"
      onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        suppressPointerClick.current = false;
        startY.current = event.clientY;
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event: ReactPointerEvent<HTMLButtonElement>) => {
        if (startY.current === null) return;
        setPull(Math.min(60, Math.max(0, event.clientY - startY.current)));
      }}
      onPointerUp={endPull}
      onPointerCancel={() => {
        startY.current = null;
        setDragging(false);
        setPull(0);
      }}
      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
        // Pointer drag already triggered the toggle on release.
        if (suppressPointerClick.current && event.detail > 0) {
          suppressPointerClick.current = false;
          return;
        }
        suppressPointerClick.current = false;
        onToggle();
      }}
    >
      {/* Cord hangs from above the glowing handle and extends during a pull. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-3 w-[1.5px] -translate-x-1/2 rounded-full bg-ink/50"
        style={{ height: 26 + pull }}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border border-white/30 shadow-md ${dragging ? "" : "transition-[top,box-shadow] duration-300 ease-out"}`}
        style={{
          top: 14 + pull,
          background: dark
            ? "radial-gradient(circle at 34% 28%, #ebe6ff 0%, #9285ff 35%, #5048b6 72%, #262455 100%)"
            : "radial-gradient(circle at 34% 28%, #fffdf0 0%, #ffe59b 35%, #f8b848 70%, #df861d 100%)",
          boxShadow: dark
            ? "0 0 18px 4px rgba(126,113,255,0.35), 0 3px 8px rgba(0,0,0,0.2)"
            : "0 0 18px 4px rgba(250,193,91,0.3), 0 3px 8px rgba(0,0,0,0.12)",
        }}
      >
        {dark ? (
          <svg viewBox="0 0 24 24" className="size-[17px] text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M20.5 13.2A8.5 8.5 0 0 1 10.8 3.5a8.5 8.5 0 1 0 9.7 9.7Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-[17px] text-amber-800" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3.5" />
            <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        )}
      </span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 size-4 -translate-x-1/2 text-mute transition-transform duration-300 group-hover:translate-y-1 motion-reduce:transition-none"
        style={{ top: 47 + pull }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}


/** One consistent desktop cursor across the entire portfolio, including the face and navbar. */
function CustomCursor({ dark }: { dark: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: -100, y: -100 });
  const trailing = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches);
    update();
    finePointer.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      finePointer.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    document.documentElement.classList.add("portfolio-custom-cursor");
    let frame = 0;
    let initialized = false;

    const animate = () => {
      trailing.current.x += (target.current.x - trailing.current.x) * 0.2;
      trailing.current.y += (target.current.y - trailing.current.y) * 0.2;
      ring.style.transform = `translate3d(${trailing.current.x}px, ${trailing.current.y}px, 0)`;
      frame = window.requestAnimationFrame(animate);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        ring.style.opacity = "0";
        dot.style.opacity = "0";
        return;
      }
      target.current = { x: event.clientX, y: event.clientY };
      if (!initialized) {
        trailing.current = { ...target.current };
        initialized = true;
      }
      dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;

      // Show the same cursor over EVERY element, including FaceCanvas and the sticky navbar.
      ring.style.opacity = "1";
      dot.style.opacity = "1";

      const el = event.target;
      const interactive = el instanceof Element &&
        !!el.closest('a, button, input, textarea, select, summary, [role="button"]');
      ring.dataset.hover = interactive ? "1" : "0";
    };
    const onDown = () => { ring.dataset.pressed = "1"; };
    const onUp = () => { ring.dataset.pressed = "0"; };
    const hide = () => { ring.style.opacity = "0"; dot.style.opacity = "0"; };
    const showAfterWindowFocus = () => { initialized = false; hide(); };
    const onWindowOut = (event: MouseEvent) => {
      // Do not hide when moving between navbar links, face, and other child elements.
      if (event.relatedTarget === null) hide();
    };

    frame = window.requestAnimationFrame(animate);
    // Capture events at the window so the cursor tracks over the face, links and navbar.
    window.addEventListener("pointermove", onMove, { passive: true, capture: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("mouseout", onWindowOut);
    window.addEventListener("blur", showAfterWindowFocus);
    return () => {
      document.documentElement.classList.remove("portfolio-custom-cursor");
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("mouseout", onWindowOut);
      window.removeEventListener("blur", showAfterWindowFocus);
    };
  }, [enabled]);

  if (!enabled || typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        ref={ringRef}
        aria-hidden="true"
        className="portfolio-cursor-ring pointer-events-none fixed left-0 top-0 z-[9998] opacity-0"
        style={{ color: dark ? "#f8fafc" : "#151823", willChange: "transform" }}
      >
        <svg className="size-11" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path
            d="M24 4.8C34 3 43.5 11.3 44.3 22.7C45.4 34.5 36 44.6 24.8 44.1C13.5 45.8 4.6 36.7 4.4 24.6C3.3 13.8 12.8 4.5 24 4.8Z"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
          />
          <path d="M12 6.5 15 4.6M36.5 42 39 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] size-[7px] rounded-full opacity-0"
        style={{ backgroundColor: dark ? "#f8fafc" : DISC, willChange: "transform" }}
      />
    </>,
    document.body,
  );
}

function Header({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const activeSection = useActiveSection();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Close the small profile card when clicking elsewhere or pressing Escape.
  useEffect(() => {
    if (!profileOpen) return;
    const onOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        profileButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onOutsidePointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onOutsidePointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-40 w-full min-w-0 max-w-full border-b border-line bg-page/95 px-3 py-3 backdrop-blur md:px-6">
      <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:gap-3">
        {/* Tap/click the avatar or name to open the mini profile. */}
        <div ref={profileRef} className="relative min-w-0 flex-1 lg:flex-none">
          <button
            ref={profileButtonRef}
            type="button"
            aria-label="Open profile and social links"
            aria-haspopup="dialog"
            aria-expanded={profileOpen}
            aria-controls="header-profile-card"
            onClick={() => setProfileOpen((open) => !open)}
            className="group flex max-w-full items-center gap-2 rounded-full pr-2 text-left font-display font-bold outline-none transition-colors hover:text-disc focus-visible:ring-2 focus-visible:ring-disc focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-disc/10 p-[2px] shadow-sm transition-transform duration-200 group-hover:scale-105 sm:size-10">
              <img
                src={faces.base.src}
                alt=""
                aria-hidden="true"
                className="block h-full w-full rounded-full object-contain object-center"
              />
            </span>
            <span className="min-w-0 truncate text-xs sm:text-sm">{person.name}</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`size-3.5 shrink-0 text-mute transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
            >
              <path d="m5 7.5 5 5 5-5" />
            </svg>
          </button>

          {profileOpen && (
            <div
              id="header-profile-card"
              role="dialog"
              aria-label="Profile and social links"
              className="absolute left-0 top-full z-[60] mt-3 w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-[24px] border border-line bg-page p-4 text-left text-ink shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-5"
            >
              <div className="absolute right-[-36px] top-[-40px] size-32 rounded-full bg-disc/10 blur-2xl" aria-hidden="true" />
              <div className="relative flex items-start gap-3">
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-field p-1">
                  <img src={faces.base.src} alt="" className="h-full w-full object-contain" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate font-display text-base font-extrabold tracking-tight text-ink">{person.name}</p>
                  <p className="mt-1 text-xs font-semibold text-disc">Full-stack Developer</p>
                  <p className="mt-1 text-[11px] text-mute">B.Tech CSE · MRSPTU</p>
                </div>
                <button
                  type="button"
                  aria-label="Close profile popup"
                  onClick={() => { setProfileOpen(false); profileButtonRef.current?.focus(); }}
                  className="relative flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-field text-mute transition-colors hover:text-ink"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M5 5l10 10M15 5 5 15" />
                  </svg>
                </button>
              </div>
              <p className="relative mt-4 text-sm leading-relaxed text-mute">
                I build thoughtful web experiences with React, Next.js, and TypeScript. Always learning, experimenting, and turning ideas into projects.
              </p>
              <div className="relative my-4 h-px bg-line" />
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-mute">Find me online</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://github.com/UmmmmArmaaan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-line bg-field px-3 py-3 text-xs font-semibold text-ink transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-disc/50 hover:bg-disc/5 focus-visible:outline-2 focus-visible:outline-disc motion-reduce:transform-none"
                >
                  <GitHubIcon className="size-4 shrink-0" /> GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/armandeep-singh-57a350368/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-line bg-field px-3 py-3 text-xs font-semibold text-ink transition-[transform,border-color,background-color] hover:-translate-y-0.5 hover:border-disc/50 hover:bg-disc/5 focus-visible:outline-2 focus-visible:outline-disc motion-reduce:transform-none"
                >
                  <LinkedInIcon className="size-4 shrink-0" /> LinkedIn
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Desktop navigation */}
        <nav aria-label="Desktop navigation" className="hidden items-center gap-1 lg:flex">
          {nav.map((l) => {
            const isActive = activeSection === l.href.replace("#", "");
            return (
              <a
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase transition-all ${
                  isActive ? "border border-disc bg-ink text-page" : "hover:bg-line"
                }`}
              >
                {l.label}
              </a>
            );
          })}
        </nav>

        {/* Existing pull-cord theme switch is unchanged. */}
        <LightPullThemeSwitcher dark={dark} onToggle={onToggle} />
      </div>

      {/* Mobile / tablet navigation */}
      <nav
        aria-label="Mobile navigation"
        className="mt-3 grid w-full min-w-0 grid-cols-3 gap-1.5 sm:grid-cols-5 lg:hidden"
      >
        {nav.map((l) => {
          const isActive = activeSection === l.href.replace("#", "");
          return (
            <a
              key={l.href}
              href={l.href}
              className={`min-w-0 rounded-full px-1.5 py-2 text-center text-[10px] font-semibold uppercase transition-colors sm:text-xs ${
                isActive ? "border border-disc bg-ink text-page" : "border border-line hover:bg-line"
              }`}
            >
              {l.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}

function Subscribe() {
  const [done, setDone] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };
  return (
    <form onSubmit={submit} className="w-full min-w-0 max-w-[380px]">
      <label
        htmlFor="email"
        className="mb-2.5 block text-micro font-medium uppercase text-mute"
      >
        Subscribe · one email
      </label>
      {done ? (
        <p className="flex h-11 items-center rounded-full bg-ink px-5 text-[14px] font-medium text-page">
          You're in.
        </p>
      ) : (
        <div className="flex min-w-0 flex-wrap gap-2 sm:flex-nowrap">
          <input
            id="email"
            type="email"
            required
            placeholder="you@email.com"
            className="h-11 min-w-0 flex-[1_1_155px] rounded-full border border-line bg-field px-4 text-sm outline-none placeholder:text-mute focus:border-ink"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-full bg-disc px-4 text-xs font-semibold uppercase text-white transition-transform active:scale-95 sm:px-5"
          >
            Subscribe →
          </button>
        </div>
      )}
    </form>
  );
}

function MoodMeter({ mood }: { mood: Mood }) {
  const p = mood.patience;
  return (
    <div className="w-full min-w-0 max-w-[380px] space-y-3" aria-live="polite">
      <div className="flex min-w-0 items-baseline justify-between gap-3 text-micro uppercase">
        <span className="text-mute">Current mood</span>
        <span className="min-w-0 truncate font-display text-[15px] font-bold tracking-[-0.01em] normal-case">
          {faces[mood.face].mood}
        </span>
      </div>
      <div>
        <div className="mb-1.5 flex justify-between text-micro uppercase text-mute">
          <span>Patience</span>
          <span className="tabular-nums">{p}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full transition-[width] duration-150"
            style={{
              width: `${p}%`,
              background: `color-mix(in oklab, var(--disc) ${p}%, #e8412c)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function useScrollAnimation() {
  const elements = useRef<HTMLElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elems = document.querySelectorAll(".animate-on-scroll");
    elements.current = Array.from(elems) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 },
    );

    elements.current.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        elements.current.forEach((el) => {
          observerRef.current?.unobserve(el);
        });
      }
    };
  }, []);

  return observerRef;
}

function Section({
  id,
  title,
  children,
  delay = 0,
}: {
  id: string;
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <section
      id={id}
      className="w-full min-w-0 max-w-full scroll-mt-40 py-8 sm:scroll-mt-24 sm:py-12 lg:py-16 animate-on-scroll"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mx-auto w-full min-w-0 max-w-5xl px-4 sm:px-6 lg:px-9">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <Section id="about" title="About Me" delay={100}>
      <div className="mx-auto grid w-full max-w-5xl min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-5">
        <article className="relative min-w-0 overflow-hidden rounded-[28px] border border-line bg-field p-6 shadow-sm sm:p-9 animate-on-scroll">
          <span className="mb-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-disc sm:text-xs">
            <span className="size-2 rounded-full bg-disc" aria-hidden="true" />
            The person behind the code
          </span>
          <h3 className="max-w-[21ch] font-display text-[clamp(1.8rem,4.5vw,3.25rem)] font-extrabold leading-[1.12] tracking-[-0.045em] text-ink">
            Building for the web, <span
              className="relative inline-block font-black not-italic tracking-[-0.055em] text-disc"
              style={{ fontFamily: EDITORIAL_FONT }}
            >
              one idea at a time.
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-1 left-[2%] h-2 w-[96%] text-disc"
                viewBox="0 0 240 12"
                preserveAspectRatio="none"
                fill="none"
              >
                <path d="M3 9 Q61 3 120 7 T237 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h3>
          <p className="mt-7 text-sm leading-[1.85] text-mute sm:text-base">
            Hey! I'm <strong className="font-display font-bold text-ink">Armandeep Singh</strong>, a Computer Science student at MRSPTU with a passion for building web applications.
          </p>
          <p
            className="mt-5 rounded-2xl border border-line border-l-[3px] border-l-disc bg-page/70 px-4 py-4 text-base font-semibold leading-[1.7] tracking-[-0.015em] text-ink sm:px-5 sm:text-lg"
            style={{ fontFamily: EDITORIAL_FONT }}
          >
            I believe in solving problems with clean, efficient code and continuous learning.
          </p>
        </article>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
          <article className="group min-w-0 rounded-[24px] border border-line bg-field p-6 shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-disc/50 hover:shadow-lg motion-reduce:transform-none sm:p-7 animate-on-scroll">
            <span className="font-display text-xs font-black tracking-[0.2em] text-disc">01 / DEVELOPMENT</span>
            <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl">What I build</h3>
            <p className="mt-3 text-sm leading-[1.8] text-mute sm:text-base">
              I specialize in full-stack development using modern technologies like React, Next.js, Node.js, and TypeScript.
            </p>
          </article>
          <article className="group min-w-0 rounded-[24px] border border-line bg-field p-6 shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-disc/50 hover:shadow-lg motion-reduce:transform-none sm:p-7 animate-on-scroll">
            <span className="font-display text-xs font-black tracking-[0.2em] text-disc">02 / CURIOSITY</span>
            <h3 className="mt-4 font-display text-xl font-bold tracking-[-0.03em] text-ink sm:text-2xl">Beyond the code</h3>
            <p className="mt-3 text-sm leading-[1.8] text-mute sm:text-base">
              When I'm not coding, you'll find me exploring new tech, participating in hackathons, or working on personal projects.
            </p>
          </article>
        </div>
      </div>
    </Section>
  );
}

// Technology logos from Devicon; unknown skills retain a text fallback.
// No package installation is required.
const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";
const SKILL_LOGOS: Record<string, string> = {
  javascript: "javascript/javascript-original.svg",
  js: "javascript/javascript-original.svg",
  typescript: "typescript/typescript-original.svg",
  ts: "typescript/typescript-original.svg",
  react: "react/react-original.svg",
  "react.js": "react/react-original.svg",
  reactjs: "react/react-original.svg",
  "next.js": "nextjs/nextjs-original.svg",
  nextjs: "nextjs/nextjs-original.svg",
  "node.js": "nodejs/nodejs-original.svg",
  nodejs: "nodejs/nodejs-original.svg",
  html: "html5/html5-original.svg",
  html5: "html5/html5-original.svg",
  "html/css": "html5/html5-original.svg",
  css: "css3/css3-original.svg",
  css3: "css3/css3-original.svg",
  "tailwind": "tailwindcss/tailwindcss-original.svg",
  "tailwind css": "tailwindcss/tailwindcss-original.svg",
  tailwindcss: "tailwindcss/tailwindcss-original.svg",
  python: "python/python-original.svg",
  c: "c/c-original.svg",
  "c++": "cplusplus/cplusplus-original.svg",
  cpp: "cplusplus/cplusplus-original.svg",
  java: "java/java-original.svg",
  "c#": "csharp/csharp-original.svg",
  git: "git/git-original.svg",
  github: "github/github-original.svg",
  mongodb: "mongodb/mongodb-original.svg",
  "mongo db": "mongodb/mongodb-original.svg",
  express: "express/express-original.svg",
  "express.js": "express/express-original.svg",
  expressjs: "express/express-original.svg",
  sql: "postgresql/postgresql-original.svg",
  postgresql: "postgresql/postgresql-original.svg",
  figma: "figma/figma-original.svg",
  firebase: "firebase/firebase-original.svg",
  bootstrap: "bootstrap/bootstrap-original.svg",
  vite: "vitejs/vitejs-original.svg",
  redux: "redux/redux-original.svg",
  "vue": "vuejs/vuejs-original.svg",
  "vue.js": "vuejs/vuejs-original.svg",
  docker: "docker/docker-original.svg",
  supabase: "supabase/supabase-original.svg",
  vercel: "vercel/vercel-original.svg",
  "vs code": "vscode/vscode-original.svg",
  "git & github": "git/git-original.svg",
  "visual studio code": "vscode/vscode-original.svg",
  vscode: "vscode/vscode-original.svg",
};

function skillMark(name: string): string {
  const parts = name.split(/[^a-zA-Z0-9+#]+/).filter(Boolean);
  return parts.length > 1
    ? parts.slice(0, 2).map((word) => word[0]).join("").toUpperCase()
    : name.slice(0, 3).toUpperCase();
}

function TechnologyIcon({ name }: { name: string }) {
  const iconPath = SKILL_LOGOS[name.trim().toLowerCase()];
  return (
    <span className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl border border-line bg-white/95 text-base font-black text-slate-600 shadow-sm transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none sm:size-16">
      <span aria-hidden="true">{skillMark(name)}</span>
      {iconPath && (
        <img
          src={`${DEVICON_BASE}${iconPath}`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 m-auto size-9 object-contain sm:size-11"
          onLoad={(event: { currentTarget: HTMLImageElement }) => {
            event.currentTarget.previousElementSibling?.classList.add("hidden");
          }}
          onError={(event: { currentTarget: HTMLImageElement }) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}

function GitHubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .75A11.25 11.25 0 0 0 8.44 22.67c.56.1.77-.24.77-.54v-2.08c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.29.94.1-.73.4-1.23.72-1.52-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.09 1.15a10.7 10.7 0 0 1 5.62 0c2.14-1.45 3.08-1.15 3.08-1.15.62 1.55.23 2.7.12 2.98.72.79 1.15 1.79 1.15 3.02 0 4.32-2.64 5.27-5.15 5.55.41.35.77 1.04.77 2.1v3.12c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" />
    </svg>
  );
}

function LinkedInIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM7.94 18.69H4.98V9.17h2.96v9.52ZM6.46 7.87a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12.23 10.82h-2.96v-4.63c0-1.1-.02-2.51-1.53-2.51-1.53 0-1.77 1.2-1.77 2.43v4.71H9.47V9.17h2.84v1.3h.04c.4-.75 1.36-1.53 2.8-1.53 2.99 0 3.54 1.97 3.54 4.53v5.22Z" />
    </svg>
  );
}

// Resume skills plus tools used for projects. The original content.ts list is preserved.
// Combined labels are split into individual cards so each technology gets its logo.
const ADDITIONAL_SKILLS = [
  "JavaScript", "React", "Next.js", "TypeScript", "HTML", "CSS",
  "Node.js", "Express.js", "Git", "GitHub", "Supabase", "Vercel",
  "Tailwind CSS", "C", "PostgreSQL", "VS Code",
];

const DISPLAY_SKILLS = Array.from(
  new Map(
    [...skills, ...ADDITIONAL_SKILLS]
      .map((name) => name.trim())
      .map((name) => name.toLowerCase() === "mysql" ? "PostgreSQL" : name)
      .filter((name) => ![
        "python", "c++", "cpp", "git & github", "html & css", "html/css",
      ].includes(name.toLowerCase()))
      .map((name) => [name.toLowerCase(), name] as const),
  ).values(),
);

function SkillsSection() {
  return (
    <Section id="skills" title="My Skills" delay={200}>
      <div className="mx-auto max-w-4xl">
        <p className="mb-7 text-center text-sm text-mute sm:text-base">
          Technologies and tools I use to turn ideas into working products.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {DISPLAY_SKILLS.map((skill, i) => (
            <div
              key={skill}
              className="group flex min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-field px-3 py-6 text-center shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-disc/50 hover:shadow-lg motion-reduce:transform-none animate-on-scroll sm:py-8"
              style={{ transitionDelay: `${Math.min(i * 55, 400)}ms` }}
            >
              <TechnologyIcon name={skill} />
              <span className="max-w-full wrap-break-word text-xs font-semibold leading-snug text-ink sm:text-sm">
                {skill}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function EducationSection() {
  return (
    <Section id="education" title="Education" delay={300}>
      <div className="mx-auto w-full min-w-0 max-w-4xl">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-disc sm:text-xs">
            The foundation
          </p>
          <p
            className="mt-2 font-bold leading-tight tracking-[-0.04em] text-ink text-[clamp(1.35rem,3vw,2rem)]"
            style={{ fontFamily: EDITORIAL_FONT }}
          >
            Learning today. <span className="text-disc">Building tomorrow.</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mute sm:text-base">
            The academic journey behind my work.
          </p>
        </div>
        <div className="relative space-y-5 sm:pl-10 sm:before:absolute sm:before:bottom-6 sm:before:left-[15px] sm:before:top-6 sm:before:w-px sm:before:bg-line">
          {education.map((edu, i) => (
            <article
              key={i}
              className="group relative min-w-0 overflow-visible rounded-[26px] border border-line bg-field p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-disc/50 hover:shadow-lg motion-reduce:transform-none animate-on-scroll sm:p-7"
              style={{ transitionDelay: `${i * 100 + 300}ms` }}
            >
              <span className="absolute -left-[30px] top-9 hidden size-3 rounded-full border-[3px] border-page bg-disc ring-2 ring-disc/25 sm:block" aria-hidden="true" />
              <span className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-disc/5 blur-2xl" aria-hidden="true" />
              <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-disc/15 bg-disc/10 text-disc sm:size-14" aria-hidden="true">
                  <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m2 10 10-5 10 5-10 5-10-5Z" />
                    <path d="M6 12v5c3.4 2.5 8.6 2.5 12 0v-5M22 10v6" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.23em] text-disc sm:text-xs">
                      Academic milestone / {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="rounded-full border border-line bg-page px-3 py-1 text-xs font-bold tabular-nums text-ink">
                      {edu.duration}
                    </span>
                  </div>
                  <h3
                    className="mt-3 text-xl font-extrabold leading-snug tracking-[-0.045em] text-ink sm:text-[1.7rem]"
                    style={{ fontFamily: EDITORIAL_FONT }}
                  >
                    {edu.degree}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-mute sm:text-base">
                    {edu.institution}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

function ExperienceSection() {
  return (
    <Section id="experience" title="Experience" delay={400}>
      <div className="mx-auto w-full min-w-0 max-w-4xl">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-disc sm:text-xs">
            Work in progress
          </p>
          <p
            className="mt-2 text-[clamp(1.35rem,3vw,2rem)] font-bold leading-tight tracking-[-0.04em] text-ink"
            style={{ fontFamily: EDITORIAL_FONT }}
          >
            Building beyond <span className="text-disc">the classroom.</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-mute sm:text-base">
            Real teamwork, practical challenges, and lessons from building.
          </p>
        </div>
        <div className="grid gap-5">
          {experience.map((exp, i) => (
            <article
              key={i}
              className="group relative min-w-0 overflow-hidden rounded-[26px] border border-line bg-field shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-disc/50 hover:shadow-lg motion-reduce:transform-none animate-on-scroll"
              style={{ transitionDelay: `${i * 150 + 400}ms` }}
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-disc" aria-hidden="true" />
              <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-disc/5 blur-2xl" aria-hidden="true" />
              <div className="relative flex min-w-0 flex-col gap-4 p-5 pl-6 sm:flex-row sm:gap-6 sm:p-8 sm:pl-9">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-disc/15 bg-disc/10 font-display text-sm font-black text-disc sm:size-14 sm:text-base" aria-label={`Experience ${i + 1}`}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.23em] text-disc sm:text-xs">
                      Hands-on experience
                    </span>
                    <span className="rounded-full border border-line bg-page px-3 py-1 font-display text-xs font-bold tabular-nums text-ink">
                      {exp.year}
                    </span>
                  </div>
                  <h3
                    className="mt-3 text-xl font-extrabold leading-snug tracking-[-0.045em] text-ink sm:text-[1.7rem]"
                    style={{ fontFamily: EDITORIAL_FONT }}
                  >
                    {exp.title}
                  </h3>
                  <p
                    className="mt-3 inline-flex max-w-full rounded-full border border-disc/20 bg-disc/10 px-3 py-1.5 text-xs font-bold tracking-[-0.01em] text-disc sm:text-sm"
                    style={{ fontFamily: EDITORIAL_FONT }}
                  >
                    {exp.role}
                  </p>
                  <p className="mt-5 border-t border-line pt-4 text-sm leading-[1.85] text-mute sm:text-base">
                    {exp.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}


/** Original hand-drawn art, not mock screenshots. Variations follow project topics. */
function ProjectDoodle({
  name,
  index,
  accent,
}: {
  name: string;
  index: number;
  accent: string;
}) {
  const text = name.toLowerCase();
  const theme = /health|med|care|doctor|hospital|clinic/.test(text)
    ? "health"
    : /portfolio|personal|profile/.test(text)
      ? "portfolio"
      : /chat|ai|bot|assistant|recommend/.test(text)
        ? "ai"
        : /shop|store|ecom|commerce/.test(text)
          ? "shop"
          : ["code", "portfolio", "ai"][index % 3];

  return (
    <svg
      viewBox="0 0 460 230"
      className="relative z-10 h-full w-full max-w-[520px] transition-transform duration-500 group-hover:rotate-1 group-hover:scale-[1.035] motion-reduce:transform-none"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Imperfect notebook lines, taped browser frame and playful side sketches. */}
      <g stroke="currentColor" strokeWidth="2.5" opacity="0.85">
        <path d="M63 172c-23-1-30 17-23 28M381 42c17-11 31-6 38 8" strokeDasharray="5 7" />
        <path d="M60 57l15 8m-7-16-4 22M402 166l19 0m-10-11v21" />
      </g>
      <g transform="rotate(-3 230 115)">
        <rect x="94" y="28" width="278" height="180" rx="15" fill={accent} fillOpacity="0.06" stroke="currentColor" strokeWidth="3.5" />
        <path d="M95 65c90-2 182 2 276-1" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="116" cy="47" r="4" fill={accent}/>
        <circle cx="130" cy="47" r="4" fill={accent} fillOpacity="0.55" />
        <circle cx="144" cy="47" r="4" fill={accent} fillOpacity="0.27" />
        <path d="M328 47h24" stroke="currentColor" strokeWidth="2" opacity="0.45" />

        {theme === "health" && (
          <g>
            <path d="M194 107c-15-22-44-5-30 21 8 14 26 27 41 39 17-11 38-26 44-42 12-30-28-40-44-15l-5 6" stroke={accent} strokeWidth="5" />
            <path d="M161 130h23l8-13 15 27 9-14h26" stroke="currentColor" strokeWidth="3.2" />
            <g stroke="currentColor" strokeWidth="3"><path d="M270 99v51m-26-25h52" /></g>
            <path d="M279 166c9 5 18 6 29 1M120 166c7 4 15 4 24 0" stroke="currentColor" strokeWidth="2" opacity="0.55" />
          </g>
        )}
        {theme === "portfolio" && (
          <g strokeWidth="3">
            <circle cx="178" cy="118" r="23" stroke={accent}/>
            <path d="M139 179c0-26 15-40 39-40s39 14 39 40" stroke={accent} />
            <path d="M252 95h77M252 112h62M252 134h72M252 152h45" stroke="currentColor" opacity="0.85" />
            <path d="m320 165 14 7-9 3-3 10-6-20" stroke={accent} strokeWidth="3.5" />
          </g>
        )}
        {theme === "ai" && (
          <g strokeWidth="3">
            <path d="M154 99q0-18 20-18h119q20 0 20 19v43q0 18-20 18h-64l-24 20v-20h-31q-20 0-20-18Z" stroke={accent} strokeWidth="3.5" />
            <path d="m200 108-13 12 13 12m62-24 13 12-13 12m-41 7 21-39" stroke="currentColor" />
            <path d="m334 87 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill={accent} fillOpacity="0.25" stroke={accent} />
          </g>
        )}
        {theme === "shop" && (
          <g strokeWidth="3">
            <path d="M158 102h24l15 58h87l15-45H189" stroke={accent} strokeWidth="3.5" />
            <circle cx="213" cy="177" r="7" stroke="currentColor" />
            <circle cx="270" cy="177" r="7" stroke="currentColor" />
            <path d="m251 91 17-18 18 18M269 75v45" stroke="currentColor" />
          </g>
        )}
        {theme === "code" && (
          <g strokeWidth="3">
            <path d="m186 112-21 18 21 19m99-37 21 18-21 19m-69 11 24-60" stroke={accent} strokeWidth="4" />
            <path d="M140 90h60M270 90h47M133 174h70M260 174h41" stroke="currentColor" opacity="0.55" />
          </g>
        )}
      </g>
      <g fill={accent} opacity="0.75">
        <circle cx="52" cy="115" r="4" />
        <circle cx="404" cy="111" r="5" />
        <circle cx="87" cy="205" r="3" />
      </g>
      <path d="m387 184 9-12 7 13 14 2-10 9 2 14-13-7-13 6 4-15-10-10Z" stroke={accent} strokeWidth="2.5" />
      <path d="M44 144q20 6 29-6m-11 24 12-14" stroke={accent} strokeWidth="2.5" />
    </svg>
  );
}

function ProjectsSection() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const returnFocusRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const selected = selectedIndex === null ? null : projects[selectedIndex];

  const closeProject = () => {
    setSelectedIndex(null);
    returnFocusRef.current?.focus();
  };

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
        returnFocusRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  const accents = ["#4361ee", "#8b5cf6", "#0d9488", "#dc6a47", "#db2777", "#2563eb"];

  return (
    <Section id="projects" title="My Projects" delay={500}>
      <div className="mx-auto max-w-5xl">
        <p className="mb-7 text-center text-sm text-mute sm:text-base">
          A selection of things I have built and worked on.
        </p>
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
          {projects.map((project, index) => {
            const accent = accents[index % accents.length];
            return (
              <article
                key={`${project.name}-${index}`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-line bg-field shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-disc/50 hover:shadow-xl motion-reduce:transform-none animate-on-scroll"
                style={{ transitionDelay: `${Math.min(index * 80, 400)}ms` }}
              >
                {/* Hand-drawn SVG thumbnail; a visual motif, not a fabricated screenshot. */}
                <div
                  className="relative flex h-44 items-center justify-center overflow-hidden border-b border-line text-ink sm:h-52"
                  style={{
                    background: `radial-gradient(circle at 22% 30%, ${accent}22, transparent 56%), linear-gradient(145deg, ${accent}10, var(--page, transparent))`,
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-[0.18]"
                    style={{
                      backgroundImage: `radial-gradient(${accent} 1px, transparent 1px)`,
                      backgroundSize: "18px 18px",
                    }}
                  />
                  <span className="absolute left-4 top-3 z-20 -rotate-3 rounded-lg border border-line bg-page/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.17em] text-ink shadow-sm sm:left-5 sm:top-4">
                    Sketch {String(index + 1).padStart(2, "0")}
                  </span>
                  <ProjectDoodle name={project.name} index={index} accent={accent} />
                  <span className="absolute bottom-3 right-4 z-20 rotate-[-5deg] text-[10px] font-bold tracking-[0.12em] opacity-65 sm:bottom-4 sm:right-6">
                    MADE WITH CURIOSITY
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                  <h3 className="wrap-break-word text-lg font-bold tracking-tight text-ink sm:text-xl">{project.name}</h3>
                  <p className="line-clamp-3 min-h-[3.9em] text-sm leading-relaxed text-mute">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((tech) => (
                      <span key={tech} className="rounded-full border border-line bg-page px-2.5 py-1 text-[11px] font-medium text-ink">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                    <button
                      type="button"
                      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
                        returnFocusRef.current = event.currentTarget;
                        setSelectedIndex(index);
                      }}
                      className="inline-flex min-h-10 items-center justify-center rounded-full bg-disc px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-disc"
                    >
                      View details <span aria-hidden="true" className="ml-2">↗</span>
                    </button>
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center justify-center rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-disc"
                      >
                        GitHub <span aria-hidden="true" className="ml-2">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {selected && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event: ReactMouseEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) closeProject(); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            className="relative my-auto w-full max-w-xl overflow-hidden rounded-[24px] border border-line bg-page p-5 text-ink shadow-2xl sm:p-8"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={closeProject}
              aria-label="Close project details"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-line bg-field text-xl transition-colors hover:bg-disc hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-disc"
            >
              ×
            </button>
            <div className="pr-10">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-disc">Project details</p>
              <h3 id="project-dialog-title" className="wrap-break-word text-2xl font-black leading-tight sm:text-3xl">{selected.name}</h3>
            </div>
            <p className="mt-5 text-sm leading-7 text-mute sm:text-base">{selected.description}</p>
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-mute">Built with</p>
              <div className="flex flex-wrap gap-2">
                {selected.tech.map((tech) => (
                  <span key={tech} className="rounded-full border border-line bg-field px-3 py-1.5 text-xs font-semibold">{tech}</span>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {selected.github && (
                <a href={selected.github} target="_blank" rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full bg-disc px-5 py-2 text-sm font-bold text-white hover:opacity-90">
                  View source on GitHub ↗
                </a>
              )}
              <button type="button" onClick={closeProject}
                className="inline-flex min-h-11 items-center rounded-full border border-line px-5 py-2 text-sm font-semibold hover:bg-field">
                Close
              </button>
            </div>
          </div>
        </div>, document.body
      )}
    </Section>
  );
}

type GitHubDay = {
  date: string;
  count: number;
  level: number;
};

type ContributionApiResponse = {
  total?: Record<string, number>;
  contributions?: GitHubDay[];
};

type GitHubProfileResponse = {
  public_repos?: number;
  followers?: number;
};

const GITHUB_USER = "UmmmmArmaaan";
const CONTRIBUTION_COLORS = [
  "#e5e7eb", "#b9c9ff", "#819cff", "#5076ff", "#2f4bf0",
];

// GitHub's contribution calendar begins on Sunday. Empty entries at the
// beginning/end are spacers, not invented activity data.
function contributionWeeks(days: GitHubDay[]): (GitHubDay | null)[][] {
  if (days.length === 0) return [];
  const ordered = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const sundayOffset = new Date(`${ordered[0].date}T00:00:00Z`).getUTCDay();
  const padded: (GitHubDay | null)[] = [
    ...Array.from({ length: sundayOffset }, () => null),
    ...ordered,
  ];
  const weeks: (GitHubDay | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(Array.from({ length: 7 }, (_, day) => padded[i + day] ?? null));
  }
  return weeks;
}

function GitHubContributions() {
  const [days, setDays] = useState<GitHubDay[] | null>(null);
  const [yearTotal, setYearTotal] = useState<number | null>(null);
  const [publicRepos, setPublicRepos] = useState<number | null>(null);
  const [followers, setFollowers] = useState<number | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingGraph(true);
    setLoadingProfile(true);
    setDays(null);
    setYearTotal(null);
    setPublicRepos(null);
    setFollowers(null);

    // Public profile contributions require an external API; GitHub REST does
    // not offer a token-free endpoint for the full contribution calendar.
    const calendarRequest = fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
      { signal: controller.signal },
    ).then(async (response): Promise<ContributionApiResponse> => {
      if (!response.ok) throw new Error(`Contributions HTTP ${response.status}`);
      return response.json();
    });

    const profileRequest = fetch(
      `https://api.github.com/users/${GITHUB_USER}`,
      {
        signal: controller.signal,
        headers: { Accept: "application/vnd.github+json" },
      },
    ).then(async (response): Promise<GitHubProfileResponse> => {
      if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
      return response.json();
    });

    void Promise.allSettled([calendarRequest, profileRequest]).then(
      ([calendarResult, profileResult]) => {
        if (controller.signal.aborted) return;

        if (
          calendarResult.status === "fulfilled" &&
          Array.isArray(calendarResult.value.contributions)
        ) {
          const validDays = calendarResult.value.contributions.filter(
            (day) =>
              typeof day.date === "string" &&
              /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
              Number.isFinite(day.count) && day.count >= 0 &&
              Number.isFinite(day.level),
          );
          if (validDays.length > 0) {
            setDays(validDays);
            const reported = calendarResult.value.total?.lastYear;
            setYearTotal(
              typeof reported === "number" && Number.isFinite(reported)
                ? reported
                : validDays.reduce((sum, day) => sum + day.count, 0),
            );
          }
        }
        setLoadingGraph(false);

        if (profileResult.status === "fulfilled") {
          const profile = profileResult.value;
          if (typeof profile.public_repos === "number") {
            setPublicRepos(profile.public_repos);
          }
          if (typeof profile.followers === "number") {
            setFollowers(profile.followers);
          }
        }
        setLoadingProfile(false);
      },
    );

    return () => controller.abort();
  }, [refreshKey]);

  const weeks = contributionWeeks(days ?? []);
  const graphLabel = days
    ? `${yearTotal ?? 0} GitHub contributions during the last twelve months`
    : "GitHub contribution calendar";

  return (
    <Section id="contributions" title="GitHub Contributions" delay={600}>
      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <p className="mb-5 text-center text-sm leading-relaxed text-mute sm:text-base">
          Real public activity from my GitHub profile, not a sample graph.
        </p>

        <div className="min-w-0 rounded-2xl border border-line bg-field p-3 shadow-sm sm:p-6 animate-on-scroll">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <a
              href={`https://github.com/${GITHUB_USER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-disc sm:text-base"
            >
              <GitHubIcon className="size-5" /> @{GITHUB_USER}
            </a>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              disabled={loadingGraph || loadingProfile}
              className="rounded-full border border-line bg-page px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-disc disabled:cursor-wait disabled:opacity-50"
            >
              {loadingGraph || loadingProfile ? "Loading…" : "Refresh stats"}
            </button>
          </div>

          <div className="min-w-0 rounded-xl border border-line bg-page p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-ink">Contribution activity</span>
              <span className="text-mute">Last 12 months</span>
            </div>

            {loadingGraph ? (
              <div className="flex min-h-28 items-center justify-center text-sm text-mute" role="status">
                Loading actual GitHub activity…
              </div>
            ) : days ? (
              <>
                <div className="w-full max-w-full overflow-x-auto pb-2" tabIndex={0}
                  aria-label="Scroll to view the contribution graph">
                  <div
                    className="flex w-max gap-[3px]"
                    role="img"
                    aria-label={graphLabel}
                  >
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                        {week.map((day, dayIndex) => (
                          <span
                            key={`${weekIndex}-${dayIndex}`}
                            aria-hidden="true"
                            title={day ? `${day.date}: ${day.count} contributions` : undefined}
                            className={`size-[11px] rounded-[3px] sm:size-[12px] ${day?.level === 0 ? "bg-line" : ""}`}
                            style={{
                              backgroundColor: day && day.level > 0
                                ? CONTRIBUTION_COLORS[Math.max(1, Math.min(4, day.level))]
                                : day ? undefined : "transparent",
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-mute">
                  <span>{days[0]?.date} – {days[days.length - 1]?.date}</span>
                  <span className="flex items-center gap-1.5" aria-hidden="true">
                    Less
                    {CONTRIBUTION_COLORS.map((color, i) => (
                      <span key={i} className={`size-2.5 rounded-[2px] ${i === 0 ? "bg-line" : ""}`}
                        style={{ backgroundColor: i === 0 ? undefined : color }}/>
                    ))}
                    More
                  </span>
                </div>
              </>
            ) : (
              <div className="flex min-h-28 flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-mute">Live contribution data is unavailable right now.</p>
                <a className="text-sm font-semibold text-disc hover:underline"
                  href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noopener noreferrer">
                  View activity on GitHub ↗
                </a>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center sm:gap-3">
            {[
              { label: "Contributions", value: yearTotal, loading: loadingGraph },
              { label: "Public repos", value: publicRepos, loading: loadingProfile },
              { label: "Followers", value: followers, loading: loadingProfile },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0 rounded-xl border border-line bg-page px-1 py-4 sm:p-4">
                <div className="text-xl font-bold tabular-nums text-disc sm:text-2xl">
                  {stat.loading ? "…" : stat.value === null ? "—" : stat.value.toLocaleString()}
                </div>
                <div className="mt-1 break-words text-[10px] font-medium text-mute sm:text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-mute">
            Public GitHub data refreshes on page load or when you click Refresh.
            The contributions provider caches results for up to one hour.
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-line bg-field p-4 animate-on-scroll">
          <h3 className="mb-1 text-sm font-semibold text-ink">Featured project: MEDIINDIA CARE</h3>
          <a href={`https://github.com/${GITHUB_USER}`} target="_blank"
            rel="noopener noreferrer" className="break-all text-sm text-disc hover:underline">
            View projects on GitHub ↗
          </a>
        </div>
      </div>
    </Section>
  );
}

function ContactSection() {
  const [emailCopied, setEmailCopied] = useState(false);
  const gmailComposeUrl =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(contact.email)}` +
    `&su=${encodeURIComponent("Portfolio enquiry")}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setEmailCopied(true);
    } catch {
      // Clipboard access can be blocked on some browsers; let visitors copy manually.
      window.prompt("Copy my email address:", contact.email);
    }
  };

  return (
    <Section id="contact" title="Contact" delay={700}>
      <div className="mx-auto w-full min-w-0 max-w-2xl rounded-3xl border border-line bg-field px-4 py-8 text-center shadow-sm sm:px-8 sm:py-10">
        <h3 className="text-xl font-bold text-ink sm:text-2xl">Let's connect</h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-mute sm:text-base">
          Have a project, internship opportunity, or just want to talk tech? I'd love to hear from you.
        </p>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-ink">
          <p className="break-words">{contact.location}</p>
          <a className="max-w-full break-all text-disc hover:underline" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <p className="text-mute">Languages: {languages.join(", ")}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/UmmmmArmaaan"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-page px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-disc hover:text-disc"
          >
            <GitHubIcon className="size-5" /> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/armandeep-singh-57a350368/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-page px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-disc hover:text-disc"
          >
            <LinkedInIcon className="size-5" /> LinkedIn
          </a>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={gmailComposeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-disc px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Send me an email ↗
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-page px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-disc hover:text-disc"
            aria-label="Copy email address"
          >
            {emailCopied ? "Email copied" : "Copy email"}
          </button>
        </div>
        <a
          href={`mailto:${contact.email}?subject=${encodeURIComponent("Portfolio enquiry")}`}
          className="mt-3 inline-block text-xs text-mute underline underline-offset-4 transition-colors hover:text-ink"
        >
          Prefer your default email app?
        </a>
      </div>
    </Section>
  );
}


/** Decorative, non-interactive page background. Skills labels reflect this portfolio. */
function DesignerBackground({ dark }: { dark: boolean }) {
  const details = [
    { label: "</>", left: "7%", top: "8%", angle: -12 },
    { label: "JS", left: "83%", top: "14%", angle: 8 },
    { label: "React", left: "80%", top: "34%", angle: -9 },
    { label: "TypeScript", left: "10%", top: "42%", angle: 7 },
    { label: "Next.js", left: "78%", top: "54%", angle: -6 },
    { label: "Node.js", left: "6%", top: "68%", angle: -8 },
    { label: "GitHub", left: "79%", top: "75%", angle: 7 },
    { label: "Git", left: "16%", top: "88%", angle: -8 },
    { label: "API", left: "50%", top: "24%", angle: 6 },
    { label: "PostgreSQL", left: "60%", top: "93%", angle: -7 },
    { label: "Vercel", left: "15%", top: "24%", angle: 9 },
    { label: "Supabase", left: "75%", top: "6%", angle: -9 },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? "linear-gradient(160deg, #0d1016 0%, #111622 46%, #0b0e14 100%)"
            : "linear-gradient(160deg, #f3f4f6 0%, #e9edf3 46%, #f8fafc 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: dark ? 0.26 : 0.35,
          backgroundImage: dark
            ? "linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)"
            : "linear-gradient(rgba(30,40,60,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(30,40,60,.07) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />
      <div
        className="absolute -left-32 top-12 h-[380px] w-[380px] rounded-full blur-3xl"
        style={{ backgroundColor: dark ? "rgba(47,75,240,.13)" : "rgba(47,75,240,.09)" }}
      />
      <div
        className="absolute -right-28 top-[45%] h-[350px] w-[350px] rounded-full blur-3xl"
        style={{ backgroundColor: dark ? "rgba(16,185,129,.08)" : "rgba(16,185,129,.06)" }}
      />
      <div
        className="absolute bottom-[8%] left-[28%] h-[340px] w-[340px] rounded-full blur-3xl"
        style={{ backgroundColor: dark ? "rgba(124,58,237,.09)" : "rgba(124,58,237,.06)" }}
      />
      {details.map((item) => (
        <span
          key={item.label}
          className="absolute hidden select-none rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide md:block"
          style={{
            left: item.left,
            top: item.top,
            transform: `rotate(${item.angle}deg)`,
            color: dark ? "rgba(255,255,255,.18)" : "rgba(20,30,45,.2)",
            borderColor: dark ? "rgba(255,255,255,.065)" : "rgba(20,30,45,.08)",
            backgroundColor: dark ? "rgba(255,255,255,.025)" : "rgba(255,255,255,.35)",
          }}
        >
          {item.label}
        </span>
      ))}
      <svg
        className="absolute left-[6%] top-[27%] hidden h-20 w-20 lg:block"
        viewBox="0 0 100 100"
        fill="none"
        stroke={dark ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.11)"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 69C32 43 46 34 78 22M62 20l17 2-8 15" />
      </svg>
      <svg
        className="absolute right-[7%] top-[83%] hidden h-20 w-20 lg:block"
        viewBox="0 0 100 100"
        fill="none"
        stroke={dark ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.11)"}
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M13 28q25-23 50 0t-5 40M34 72l25-4-9-24" />
      </svg>
    </div>
  );
}

export default function App() {
  const [dark, toggle] = useTheme();
  const title = useFitHeadline<HTMLHeadingElement>();
  const stageRef = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<Mood>({
    face: "base",
    patience: 100,
    pulls: 0,
  });
  const onMood = useCallback((m: Mood) => setMood(m), []);

  // Setup scroll animations
  useScrollAnimation();

  return (
    <div className="relative isolate flex min-h-[100svh] w-full min-w-0 max-w-full flex-col overflow-x-clip bg-page text-ink">
      {/* Keep the React root at viewport width even if global body styles use flex/grid. */}
      <style>{`
        html, body, #root {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          margin: 0;
        }
        *, *::before, *::after { box-sizing: border-box; }
        body { overflow-x: clip; }
        @media (hover: hover) and (pointer: fine) {
          html.portfolio-custom-cursor,
          html.portfolio-custom-cursor * {
            cursor: none !important;
          }
          /* FaceCanvas grab ring is visual-only; keep its drag behaviour, not its second cursor. */
          html.portfolio-custom-cursor .grab-ring {
            display: none !important;
          }
        }
        .portfolio-cursor-ring svg {
          transform: translate(-50%, -50%) scale(1);
          transition: transform 180ms ease;
        }
        .portfolio-cursor-ring[data-hover="1"] svg {
          transform: translate(-50%, -50%) scale(1.38) rotate(-10deg);
        }
        .portfolio-cursor-ring[data-pressed="1"] svg {
          transform: translate(-50%, -50%) scale(.75);
        }
        @media (prefers-reduced-motion: reduce) {
          .portfolio-cursor-ring svg { transition: none; }
        }
      `}</style>
      <DesignerBackground dark={dark} />
      <CustomCursor dark={dark} />
      <Header dark={dark} onToggle={toggle} />

      {/* Hero Section with WebGL Face */}
      <main className="relative isolate z-10 flex w-full min-w-0 max-w-full flex-1 flex-col px-3 pt-6 text-center sm:px-6 sm:pt-10 lg:px-9 lg:pt-14">
        <h1
          ref={title}
          className="headline relative z-0 mb-6 block w-full min-w-0 text-[clamp(2.25rem,10vw,5rem)] leading-[1.08] tracking-tight md:mb-0 md:inline-block md:w-max md:max-w-none md:whitespace-nowrap"
        >
          {" "}
          <span className="block md:inline">Hey, I'm </span>
          <span className="marker inline-block max-w-full text-[0.82em] sm:text-[1em]">
            {person.name}
          </span>{" "}
        </h1>

        <div className="relative grid w-full min-w-0 flex-1 grid-cols-1 items-end gap-x-4 gap-y-5 text-center sm:gap-x-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-8 md:text-left">
          <div className="relative z-10 mx-auto w-full min-w-0 max-w-[380px] space-y-2 text-lede md:order-1 md:mx-0 md:space-y-3 md:pb-[clamp(12px,4vh,36px)] animate-on-scroll">
            <p className="hidden font-display text-[clamp(1em,1.1em,1.25em)] font-bold tracking-[-0.015em] md:block">
              {" "}
              B.Tech Computer Science & Engineering
            </p>
            <p className="text-mute text-xs sm:text-sm sm:block">
              Student at MRSPTU
            </p>
            <p className="text-mute text-xs sm:text-sm">
              <span className="sm:inline hidden">Bathinda, Punjab • </span>
              Full-stack developer
            </p>
            <p className="text-mute text-[11px] sm:text-sm sm:block leading-relaxed">
              <span className="sm:inline hidden">
                Building web applications that solve real problems.
              </span>
              <span className="sm:hidden">
                Building apps that solve real problems.
              </span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 md:justify-start">
              <a
                href="https://github.com/UmmmmArmaaan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-field"
              >
                <GitHubIcon className="size-4" /> GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/armandeep-singh-57a350368/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-field"
              >
                <LinkedInIcon className="size-4" /> LinkedIn
              </a>
            </div>
          </div>

          <div
            ref={stageRef}
            className="stage relative mx-auto aspect-square w-[min(85vw,580px)] max-w-full sm:w-[min(80vw,580px)] md:order-2 md:w-[min(46vw,78svh)]"
          >
            <div
              className={`hint pointer-events-none absolute right-[1%] top-[10%] z-10
                flex max-w-[40%] flex-col items-center text-center
                rotate-3 text-[clamp(10px,2.4vw,13px)]
                sm:right-[2%] sm:top-[12%] sm:text-sm
                md:-right-[7%] md:top-[14%] md:text-[clamp(12px,1.4vw,18px)]
                ${mood.pulls ? "translate-y-2 opacity-0" : ""}`}
            >
              <span
                className="whitespace-nowrap text-[11px] font-bold tracking-[-0.01em] text-ink sm:text-xs md:text-sm"
                style={{ fontFamily: EDITORIAL_FONT }}
              >
                grab my face
              </span>
              <svg
                viewBox="0 0 104 92"
                className="-ml-4 mt-1 h-[58px] w-[76px] sm:h-[70px] sm:w-[88px] md:h-[84px] md:w-[104px]"
                style={{ color: dark ? "#ffffff" : "#090909" }}
                fill="none"
                aria-hidden="true"
              >
                {/* A soft S-curve ending at the face, with a sketched arrow tip. */}
                <path
                  d="M91 10 C72 3 57 15 62 29 C69 46 48 50 35 61 C26 68 23 74 20 81"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 69 Q14 77 20 81 Q27 79 36 74"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-[380px] flex-col gap-3 pb-6 text-left sm:gap-4 md:order-3 md:mx-0 md:items-end md:pb-[clamp(12px,4vh,36px)]">
            <MoodMeter mood={mood} />
            <Subscribe />
          </div>
        </div>

        <FaceCanvas stageRef={stageRef} discColor={DISC} onMood={onMood} />
      </main>

      {/* Sections with scroll animations */}
      <section className="relative z-10 flex w-full min-w-0 flex-col items-stretch gap-3 sm:gap-8 lg:gap-12">
        <AboutSection />
        <SkillsSection />
        <EducationSection />
        <ExperienceSection />
        <ProjectsSection />
        <GitHubContributions />
        <ContactSection />
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-line px-[clamp(12px,3vw,36px)] py-4 sm:py-5">
        <ul className="flex flex-wrap items-center justify-between gap-x-6 sm:gap-x-8 gap-y-2 sm:gap-y-3 text-xs sm:text-micro">
          <li className="font-medium uppercase">
            Contact &copy; {new Date().getFullYear()} Armandeep Singh
          </li>
        </ul>
      </footer>
    </div>
  );
}
