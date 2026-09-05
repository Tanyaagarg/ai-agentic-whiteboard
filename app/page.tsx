import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowRight,
  Archive,
  Download,
  Infinity as InfinityIcon,
  Save,
  Search,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Describe it, don't draw it",
    text: "Ask for a login screen or an onboarding flow. It comes back as real shapes you can move, edit and build on — not a picture.",
  },
  {
    icon: InfinityIcon,
    title: "A canvas that doesn't end",
    text: "Rectangles, diamonds, arrows, freehand, text and images, with a toolbar that stays out of the way until you need it.",
  },
  {
    icon: Save,
    title: "Saves while you think",
    text: "Every change is written as you work. Close the tab mid-sentence and the board is exactly where you left it.",
  },
  {
    icon: Archive,
    title: "Nothing gets lost",
    text: "Archive a board instead of deleting it, then restore it whenever it turns out you did need that diagram.",
  },
  {
    icon: Download,
    title: "Export anywhere",
    text: "Take any board out as a PNG and drop it straight into a doc, a deck or a pull request.",
  },
  {
    icon: Search,
    title: "Find it again",
    text: "Search across your boards by name, from anywhere in the dashboard.",
  },
];

const steps = [
  {
    number: "01",
    title: "Open a board",
    text: "Name it and you are on the canvas. No template to pick, no setup.",
  },
  {
    number: "02",
    title: "Ask for what you need",
    text: "Type a description into the AI panel and watch the diagram lay itself out.",
  },
  {
    number: "03",
    title: "Make it yours",
    text: "Drag, restyle and add to it like anything else you drew by hand.",
  },
];

/** Decorative mock of the canvas — a flowchart, in the app's own palette. */
function CanvasPreview() {
  return (
    <svg
      viewBox="0 0 520 340"
      className="h-auto w-full"
      role="img"
      aria-label="A flowchart on the WhizBoard canvas"
    >
      <rect x="0" y="0" width="520" height="340" rx="16" fill="#ffffff" />
      <rect
        x="0.5"
        y="0.5"
        width="519"
        height="339"
        rx="16"
        fill="none"
        stroke="#e2e8f0"
      />

      {/* window chrome */}
      <circle cx="24" cy="24" r="5" fill="#e2e8f0" />
      <circle cx="42" cy="24" r="5" fill="#e2e8f0" />
      <circle cx="60" cy="24" r="5" fill="#e2e8f0" />
      <line x1="0" y1="48" x2="520" y2="48" stroke="#f1f5f9" />

      {/* toolbar */}
      <rect x="16" y="76" width="34" height="150" rx="12" fill="#f8fafc" />
      <rect x="27" y="90" width="12" height="12" rx="3" fill="#5233DD" />
      <rect x="27" y="116" width="12" height="12" rx="3" fill="#cbd5e1" />
      <rect x="27" y="142" width="12" height="12" rx="3" fill="#cbd5e1" />
      <rect x="27" y="168" width="12" height="12" rx="3" fill="#cbd5e1" />
      <rect x="27" y="194" width="12" height="12" rx="3" fill="#cbd5e1" />

      {/* flowchart */}
      <g strokeWidth="2" fill="none">
        <rect
          x="200"
          y="76"
          width="130"
          height="42"
          rx="10"
          fill="#eef2ff"
          stroke="#5233DD"
        />
        <path d="M265 118 L265 146" stroke="#334155" />
        <path d="M265 152 l-5 -8 h10 z" fill="#334155" stroke="none" />

        <path
          d="M265 152 L322 194 L265 236 L208 194 Z"
          fill="#fef3c7"
          stroke="#d97706"
        />
        <path d="M322 194 L392 194" stroke="#334155" />
        <path d="M398 194 l-8 -5 v10 z" fill="#334155" stroke="none" />
        <rect
          x="398"
          y="172"
          width="100"
          height="44"
          rx="10"
          fill="#ffffff"
          stroke="#94a3b8"
        />

        <path d="M265 236 L265 268" stroke="#334155" />
        <path d="M265 274 l-5 -8 h10 z" fill="#334155" stroke="none" />
        <ellipse
          cx="265"
          cy="296"
          rx="66"
          ry="22"
          fill="#dcfce7"
          stroke="#16a34a"
        />
      </g>

      {/* text stand-ins */}
      <g fill="#334155" opacity="0.55">
        <rect x="222" y="92" width="86" height="5" rx="2.5" />
        <rect x="238" y="188" width="54" height="5" rx="2.5" />
        <rect x="418" y="191" width="60" height="5" rx="2.5" />
        <rect x="232" y="293" width="66" height="5" rx="2.5" />
      </g>
    </svg>
  );
}

export default async function Home() {
  // <SignedIn>/<SignedOut> were removed in Clerk Core 3. This is a server
  // component, so ask for the session directly and render one branch.
  const { userId } = await auth();
  const signedIn = !!userId;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ---------- nav ---------- */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="" width={42} height={28} />
            <span className="text-lg font-semibold">WhizBoard</span>
          </Link>

          <div className="flex items-center gap-2">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg bg-[#5233DD] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4526c4]"
              >
                Go to your boards
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-[#5233DD] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4526c4]"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-40 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-0 h-96 w-96 rounded-full bg-purple-200/50 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-sm font-medium text-[#5233DD]">
              <Sparkles className="h-3.5 w-3.5" />
              Diagrams, drawn for you
            </span>

            <h1 className="mt-6 text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Bring your ideas to life on an infinite canvas.
            </h1>

            <p className="mt-6 max-w-lg text-lg text-slate-600">
              WhizBoard is a whiteboard that can draw. Sketch it yourself, or
              describe the flowchart or screen you have in mind and watch it
              appear — as real shapes, ready to edit.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {signedIn ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl bg-[#5233DD] px-6 py-3 font-medium text-white transition hover:bg-[#4526c4]"
                >
                  Go to your boards
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="flex items-center gap-2 rounded-xl bg-[#5233DD] px-6 py-3 font-medium text-white transition hover:bg-[#4526c4]"
                  >
                    Start drawing — it&apos;s free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="rounded-xl border border-slate-200 px-6 py-3 font-medium transition hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 p-3 shadow-xl shadow-indigo-200/50">
            <CanvasPreview />
          </div>
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to think out loud.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-[#5233DD]/30 hover:shadow-sm"
              >
                <div className="w-fit rounded-xl bg-indigo-50 p-2.5">
                  <feature.icon className="h-5 w-5 text-[#5233DD]" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          From blank page to diagram in a minute.
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number}>
              <span className="text-sm font-semibold text-[#5233DD]">
                {step.number}
              </span>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-slate-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- closing cta ---------- */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 px-8 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What are you working out today?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-slate-700">
            Open a board and start drawing. Bring the AI in whenever you want a
            head start.
          </p>

          <Link
            href={signedIn ? "/dashboard" : "/sign-up"}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#5233DD] px-6 py-3 font-medium text-white transition hover:bg-[#4526c4]"
          >
            {signedIn ? "Go to your boards" : "Create your first board"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="" width={36} height={24} />
            <span className="font-medium">WhizBoard</span>
          </div>
          <p className="text-sm text-slate-500">
            An AI whiteboard for ideas that move.
          </p>
        </div>
      </footer>
    </main>
  );
}
