// src/pages/Learn.tsx
import { useEffect, useMemo, useRef, useState } from "react";

/* ----------------------- skill catalog (fallback) ----------------------- */
type Catalog = Record<
  string,
  { label: string; items: string[] }
>;

const SKILL_CATALOG: Catalog = {
  "Programming": {
    label: "Programming",
    items: ["JavaScript", "TypeScript", "Python", "Java", "C#", "Go", "Rust", "C++"],
  },
  "Web Frontend": {
    label: "Web Frontend",
    items: ["HTML", "CSS", "React", "Next.js", "Tailwind", "Svelte", "Vue"],
  },
  "Web Backend": {
    label: "Web Backend",
    items: ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET Core"],
  },
  "Databases": {
    label: "Databases",
    items: ["PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Prisma", "ORM Basics"],
  },
  "Operating Systems": {
    label: "Operating Systems",
    items: ["Linux Basics", "Windows Admin", "Shell Scripting", "Process & Memory", "Filesystems"],
  },
  "Networking": {
    label: "Networking",
    items: ["TCP/IP", "HTTP/HTTPS", "DNS", "Routing", "VPNs", "Firewalls"],
  },
  "Cloud & DevOps": {
    label: "Cloud & DevOps",
    items: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Terraform"],
  },
  "Cybersecurity": {
    label: "Cybersecurity",
    items: ["OWASP Top 10", "Threat Modeling", "AuthN/AuthZ", "Network Sec", "App Sec", "SOC Basics"],
  },
  "Data & ML": {
    label: "Data & ML",
    items: ["NumPy", "Pandas", "Matplotlib", "scikit-learn", "Prompt Engineering", "LLM Basics"],
  },
  "Mobile": {
    label: "Mobile",
    items: ["React Native", "SwiftUI", "Kotlin Android", "Flutter", "UI/UX Basics"],
  },
};

/* try to pull user skills from localStorage written by Profile:
   Accepts multiple likely keys to be forgiving. */
function getUserSkills(): string[] {
  const keys = [
    "profile.skills",     // [{ name, category, level }]
    "skills",
    "userSkills",
  ];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        // support array of strings or array of objects with "name"
        const names = data
          .map((s: any) => (typeof s === "string" ? s : s?.name))
          .filter(Boolean);
        if (names.length) return Array.from(new Set(names));
      }
    } catch {
      // ignore
    }
  }
  return [];
}

/* ----------------------- micro-project generator ----------------------- */
type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type MicroProject = { title: string; steps: string[] };

function generateProjects(skill: string, difficulty: Difficulty): MicroProject[] {
  const base = skill || "Your Skill";
  const t = (s: string) => s.replaceAll("{skill}", base);

  const pool: Record<Difficulty, MicroProject[]> = {
    Beginner: [
      {
        title: t("{skill} Starter: Mini Build"),
        steps: [
          t("Set up a simple {skill} environment and run a 'Hello World'."),
          t("Create a single feature: render a list or return a basic API response."),
          t("Write a short README explaining how to run it."),
        ],
      },
      {
        title: t("{skill} Fundamentals: 2-Hour Challenge"),
        steps: [
          t("Use only core {skill} features to build a tiny app (no heavy libs)."),
          t("Add one user input and validate it."),
          t("Document one thing you learned."),
        ],
      },
      {
        title: t("{skill} Debug Drill"),
        steps: [
          t("Introduce one small bug intentionally, then fix it (commit both)."),
          "Explain the root cause in a short markdown note.",
          "Share what diagnostic command/tool you used.",
        ],
      },
    ],
    Intermediate: [
      {
        title: t("{skill} Feature Slice"),
        steps: [
          "Design a small feature with a quick diagram or checklist.",
          t("Implement it with clean structure following {skill} conventions."),
          "Add basic tests or validation.",
        ],
      },
      {
        title: t("{skill} Integration Mini-Project"),
        steps: [
          t("Integrate a second tool with {skill} (DB, API, or UI lib)."),
          "Expose one configuration via .env (safe values).",
          "Add a CLI or script to run it end-to-end.",
        ],
      },
      {
        title: t("{skill} Performance Pass"),
        steps: [
          "Measure a baseline (time/memory).",
          "Make one optimization.",
          "Capture before/after numbers in README.",
        ],
      },
    ],
    Advanced: [
      {
        title: t("{skill} Architecture Kata"),
        steps: [
          "Sketch a 2–3 module architecture.",
          t("Implement a minimal vertical slice using {skill}."),
          "Add observability: logs/metrics at key points.",
        ],
      },
      {
        title: t("{skill} Security Hardening"),
        steps: [
          "Threat model one risk; write a short mitigation plan.",
          t("Implement guardrails (rate limit, sanitize, input schema) for {skill}."),
          "Add a security checklist to README.",
        ],
      },
      {
        title: t("{skill} Production-Ready Polish"),
        steps: [
          "Add error boundaries / retries / graceful shutdown as relevant.",
          "Containerize or deploy locally with a Makefile/npm script.",
          "Write a 'What I’d ship next' section.",
        ],
      },
    ],
  };

  // deterministic pick of 3 items
  const list = pool[difficulty];
  const seed = (base.length + (difficulty.length % 7)) % list.length;
  const out: MicroProject[] = [];
  for (let i = 0; i < 3; i++) out.push(list[(seed + i) % list.length]);
  return out;
}

/* ----------------------- Resource carousel ----------------------- */
type Resource = { title: string; url: string; blurb: string };

const RESOURCES: Resource[] = [
  { title: "freeCodeCamp", url: "https://www.freecodecamp.org/", blurb: "Full free curriculum for web + JS." },
  { title: "MDN Web Docs", url: "https://developer.mozilla.org/", blurb: "Authoritative reference for web APIs." },
  { title: "The Odin Project", url: "https://www.theodinproject.com/", blurb: "Project-based web dev learning." },
  { title: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", blurb: "University-grade CS courses, free." },
  { title: "CS50", url: "https://cs50.harvard.edu/", blurb: "Harvard’s flagship intro to CS." },
  { title: "Exercism", url: "https://exercism.org/", blurb: "Hands-on coding practice & mentoring." },
  { title: "Roadmap.sh", url: "https://roadmap.sh/", blurb: "Visual roadmaps for tech roles/skills." },
  { title: "Khan Academy", url: "https://www.khanacademy.org/", blurb: "Math/CS fundamentals, interactive." },
  { title: "Coursera (Free Audits)", url: "https://www.coursera.org/", blurb: "Audit top university courses." },
  { title: "W3Schools", url: "https://www.w3schools.com/", blurb: "Beginner-friendly web tutorials." },
];

/* ----------------------- Component ----------------------- */
export default function Learn() {
  const userSkills = useMemo(getUserSkills, []);
  const [skill, setSkill] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Beginner");
  const [projects, setProjects] = useState<MicroProject[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prefer user skill if available
    if (userSkills[0]) setSkill(userSkills[0]);
  }, [userSkills]);

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill) return;
    setProjects(generateProjects(skill, difficulty));
    // scroll a bit to show results
    setTimeout(() => {
      trackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const groupedOptions = useMemo(() => {
    // Build options with "Your Skills" group when available
    const groups: { label: string; items: string[] }[] = [];
    if (userSkills.length) groups.push({ label: "Your Skills", items: userSkills });

    Object.values(SKILL_CATALOG).forEach((g) => groups.push({ label: g.label, items: g.items }));

    // dedupe while preserving group buckets
    const seen = new Set<string>();
    return groups.map((g) => ({
      label: g.label,
      items: g.items.filter((n) => {
        const k = n.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      }),
    }));
  }, [userSkills]);

  return (
    <div className="w-[min(1100px,95%)] mx-auto py-10 md:py-14 space-y-8 overflow-visible">
      {/* Title / intro */}
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
          Generate Micro-Projects
        </h1>
        <p className="text-white/75 font-['Rajdhani'] text-lg max-w-3xl">
          Select a skill and a difficulty level to generate three personalized micro-projects.
          Practice intentionally, ship small, and solidify your knowledge.
        </p>
      </header>

      {/* Control card */}
      <section className="relative rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-45"
          style={{
            background: "linear-gradient(120deg, rgba(157,45,252,0.18), rgba(2,150,255,0.18))",
            filter: "blur(18px)",
            zIndex: -1,
          }}
        />
        <form onSubmit={onGenerate} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          {/* Skill */}
          <label className="grid gap-2">
            <span className="text-white/80 font-['Rajdhani']">Skill</span>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-3 appearance-none"
            >
              {!skill && <option value="">Select a skill</option>}
              {groupedOptions.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.items.map((name) => (
                    <option key={`${g.label}-${name}`} value={name}>
                      {name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {/* Difficulty */}
          <label className="grid gap-2">
            <span className="text-white/80 font-['Rajdhani']">Difficulty Level</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-3 appearance-none"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>

          {/* CTA */}
          <div className="pt-6 md:pt-0">
            <button
              type="submit"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-3 text-white font-['Orbitron'] uppercase tracking-wide"
            >
              <span className="relative z-[1]">Generate Projects</span>
              <span
                aria-hidden
                className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]"
              />
              <span
                aria-hidden
                className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10"
              />
            </button>
          </div>
        </form>
      </section>

      {/* Results */}
      {projects.length > 0 && (
        <section ref={trackRef} className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95">Your Micro-Projects</h2>
          <ul className="grid gap-4">
            {projects.map((p, i) => (
              <li
                key={i}
                className="relative rounded-2xl border border-white/10 bg-gradient-to-r from-[#041f3b]/80 to-[#07355a]/80 backdrop-blur-md p-5"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-35"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(2,150,255,0.18), rgba(157,45,252,0.18))",
                    filter: "blur(18px)",
                    zIndex: -1,
                  }}
                />
                <h3 className="text-xl font-['Rajdhani'] text-white/95 mb-2">{p.title}</h3>
                <ol className="list-decimal pl-5 space-y-1 text-white/85 font-['Rajdhani']">
                  {p.steps.map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Resources carousel */}
      <section className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95">Learning Resources</h2>
        <div className="relative">
          {/* scroll track */}
          <div
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {RESOURCES.map((r, i) => (
              <article
                key={i}
                className="snap-start shrink-0 w-[280px] rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-4 relative"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-45"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(157,45,252,0.16), rgba(2,150,255,0.16))",
                    filter: "blur(16px)",
                    zIndex: -1,
                  }}
                />
                <div className="h-28 w-full rounded-xl bg-gradient-to-br from-[#0b1730] to-[#1a0f2e] border border-white/10 grid place-items-center text-white/80 text-lg font-['Orbitron'] tracking-wide">
                  {r.title}
                </div>
                <p className="mt-3 text-white/80 font-['Rajdhani']">{r.blurb}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center justify-center relative overflow-hidden rounded-xl px-4 py-2 text-white font-['Rajdhani']"
                >
                  <span className="relative z-[1]">Visit</span>
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10"
                  />
                </a>
              </article>
            ))}
          </div>
          {/* hint line */}
          <p className="mt-2 text-white/60 font-['Rajdhani'] text-sm">
            Tip: drag horizontally or use shift + scroll to browse.
          </p>
        </div>
      </section>
    </div>
  );
}
