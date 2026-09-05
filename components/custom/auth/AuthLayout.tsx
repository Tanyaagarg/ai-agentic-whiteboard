import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Download, History, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: Sparkles,
    title: "Describe it, don't draw it",
    text: "Ask for a flowchart or a screen layout and it lands on the canvas, laid out and labelled.",
  },
  {
    icon: History,
    title: "Never lose a board",
    text: "Every change saves as you work, and archived boards can be restored any time.",
  },
  {
    icon: Download,
    title: "Take it with you",
    text: "Export any board as a PNG to drop into a doc, a deck or a pull request.",
  },
];

/**
 * Shared shell for /sign-in and /sign-up: a brand panel on the left, the Clerk
 * form on the right. The panel is hidden below lg so small screens get the
 * form and nothing else in the way of it.
 */
function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen">
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 p-12 lg:flex">
        {/* soft blobs, purely decorative */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-purple-300/40 blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2">
          <Image src="/logo.svg" alt="" width={45} height={30} />
          <span className="text-xl font-semibold">WhizBoard</span>
        </Link>

        <div className="relative max-w-md">
          <h1 className="text-4xl leading-tight font-bold tracking-tight text-slate-900">
            Bring your ideas to life on an infinite canvas.
          </h1>

          <ul className="mt-10 space-y-6">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-4">
                <div className="mt-0.5 h-fit rounded-xl bg-white/70 p-2.5">
                  <item.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-medium text-slate-900">{item.title}</h2>
                  <p className="mt-1 text-sm text-slate-700">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-slate-600">
          Sketch, diagram, plan — then let the AI fill in the rest.
        </p>
      </section>

      <section className="flex w-full flex-col items-center justify-center gap-8 p-6 lg:w-1/2">
        {/* the brand panel is hidden on small screens, so repeat the mark here */}
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <Image src="/logo.svg" alt="" width={42} height={28} />
          <span className="text-lg font-semibold">WhizBoard</span>
        </Link>

        {children}
      </section>
    </main>
  );
}

export default AuthLayout;
