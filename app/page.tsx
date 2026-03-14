export default function Home() {
  return (
    <main className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden px-6">

      {/* Ambient background glow — amber, very subtle */}
      <div
        className="ambient pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(245,158,11,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Fine grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg w-full">

        {/* Eyebrow */}
        <p className="fade-1 text-[11px] tracking-[0.4em] text-amber-500/70 uppercase mb-8 font-mono">
          2026
        </p>

        {/* The name */}
        <h1 className="fade-2 font-serif text-[clamp(72px,16vw,140px)] leading-none text-white tracking-tight select-none">
          Lewis
        </h1>

        {/* Divider */}
        <div className="fade-3 mx-auto mt-8 mb-8 w-12 h-px bg-amber-500/30" />

        {/* Follow for updates */}
        <div className="fade-4 flex flex-col items-center gap-3">
          <a
            href="https://x.com/swarmgram"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-amber-500/40 hover:bg-zinc-900 transition-all text-sm text-zinc-300 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-zinc-400">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow @swarmgram for updates
          </a>
          <p className="text-[11px] text-zinc-700 tracking-wide">
            No details. Just a notification when it&apos;s ready.
          </p>
        </div>
      </div>

      {/* Bottom attribution — tiny */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <a
          href="https://swarmgram.com"
          className="text-[10px] tracking-[0.25em] text-zinc-800 hover:text-zinc-600 uppercase transition-colors"
        >
          A Swarmgram project
        </a>
      </div>
    </main>
  );
}
