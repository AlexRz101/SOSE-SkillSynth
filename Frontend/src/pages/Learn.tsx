// src/pages/Learn.tsx
import { useEffect, useMemo, useRef, useState } from "react";

/* ----------------------- skill catalog (fallback) ----------------------- */
type Catalog = Record<string, { label: string; items: string[] }>;

const SKILL_CATALOG: Catalog = {
  Programming: { label: "Programming", items: ["JavaScript", "TypeScript", "Python", "Java", "C#", "Go", "Rust", "C++"] },
  "Web Frontend": { label: "Web Frontend", items: ["HTML", "CSS", "React", "Next.js", "Tailwind", "Svelte", "Vue"] },
  "Web Backend": { label: "Web Backend", items: ["Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET Core"] },
  Databases: { label: "Databases", items: ["PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Prisma", "ORM Basics"] },
  "Operating Systems": { label: "Operating Systems", items: ["Linux Basics", "Windows Admin", "Shell Scripting", "Process & Memory", "Filesystems"] },
  Networking: { label: "Networking", items: ["TCP/IP", "HTTP/HTTPS", "DNS", "Routing", "VPNs", "Firewalls"] },
  "Cloud & DevOps": { label: "Cloud & DevOps", items: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Terraform"] },
  Cybersecurity: { label: "Cybersecurity", items: ["OWASP Top 10", "Threat Modeling", "AuthN/AuthZ", "Network Sec", "App Sec", "SOC Basics"] },
  "Data & ML": { label: "Data & ML", items: ["NumPy", "Pandas", "Matplotlib", "scikit-learn", "Prompt Engineering", "LLM Basics"] },
  Mobile: { label: "Mobile", items: ["React Native", "SwiftUI", "Kotlin Android", "Flutter", "UI/UX Basics"] },
};

/* pull user skills from localStorage written by Profile (for grouping) */
function getUserSkills(): string[] {
  const keys = ["profile.skills", "skills", "userSkills"];
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        const names = data.map((s: any) => (typeof s === "string" ? s : s?.name)).filter(Boolean);
        if (names.length) return Array.from(new Set(names));
      }
    } catch {}
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
        steps: ["Measure a baseline (time/memory).", "Make one optimization.", "Capture before/after numbers in README."],
      },
    ],
    Advanced: [
      {
        title: t("{skill} Architecture Kata"),
        steps: ["Sketch a 2–3 module architecture.", t("Implement a minimal vertical slice using {skill}."), "Add observability: logs/metrics at key points."],
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

/* ----------------------- Dashboard write helpers ----------------------- */
type DashStatus = "todo" | "inprogress";
const LS_KEY = "dashboard.projects";
const SAVED_MICROS_KEY = "learn.savedMicros";

function difficultyToLevel(d: Difficulty) {
  if (d === "Beginner") return 3;
  if (d === "Intermediate") return 5;
  return 7;
}

function appendToDashboard(opts: {
  title: string;
  status: DashStatus;
  priority?: "Low" | "Medium" | "High";
  due?: string;
  isMicro?: boolean;
  hoursPerWeek?: number;
  description?: string;
  requiredSkills?: Array<{ name: string; level: number }>;
}) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const item = {
      id: crypto.randomUUID(),
      title: opts.title,
      status: opts.status,
      priority: opts.priority ?? "Medium",
      due: opts.due ?? "",
      isMicro: !!opts.isMicro,
      hoursPerWeek: opts.hoursPerWeek ?? null,
      description: opts.description ?? "",
      requiredSkills: opts.requiredSkills ?? [],
    };
    const next = [item, ...arr];
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("projects-updated"));
  } catch {}
}

/* ----------------------- Component ----------------------- */
type RequiredSkill = { name: string; level: number };
type SavedMicro = {
  id: string;
  title: string;
  steps: string[];
  requiredSkills: RequiredSkill[];
  createdAt: number;
};

export default function Learn() {
  const userSkills = useMemo(getUserSkills, []);
  const [skill, setSkill] = useState<string>("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Beginner");
  const [projects, setProjects] = useState<MicroProject[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Expand modal state
  const [openExpand, setOpenExpand] = useState<null | { src: MicroProject }>(null);
  const [expTitle, setExpTitle] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [expHours, setExpHours] = useState<number>(4);
  const [expDue, setExpDue] = useState<string>(""); // NEW: due date

  // Expand skills editor
  const [skillCategory, setSkillCategory] = useState<string>("");
  const [skillName, setSkillName] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<number>(difficultyToLevel(difficulty));
  const [expReqSkills, setExpReqSkills] = useState<RequiredSkill[]>([]);

  // Saved micros section
  const [savedMicros, setSavedMicros] = useState<SavedMicro[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_MICROS_KEY);
      return raw ? (JSON.parse(raw) as SavedMicro[]) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_MICROS_KEY, JSON.stringify(savedMicros));
    } catch {}
  }, [savedMicros]);

  useEffect(() => {
    if (userSkills[0]) setSkill(userSkills[0]);
  }, [userSkills]);

  useEffect(() => {
    setSkillLevel(difficultyToLevel(difficulty));
  }, [difficulty]);

  const onGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill) return;
    setProjects(generateProjects(skill, difficulty));
    setTimeout(() => {
      trackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const groupedOptions = useMemo(() => {
    const groups: { label: string; items: string[] }[] = [];
    if (userSkills.length) groups.push({ label: "Your Skills", items: userSkills });
    Object.values(SKILL_CATALOG).forEach((g) => groups.push({ label: g.label, items: g.items }));
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

  /* -------- Expand modal helpers -------- */
  function buildExpandedDescription(mp: MicroProject) {
    const bullets = mp.steps.map((s) => `• ${s}`).join("\n");
    return `${mp.title}\n\nOverview:\nTurn this micro into a scoped project with clear deliverables.\n\nPlan:\n${bullets}\n\nDeliverables:\n- Working demo or repo\n- README with setup, decisions, and next steps`;
  }

  function openExpandFor(mp: MicroProject) {
    setOpenExpand({ src: mp });
    setExpTitle(mp.title);
    setExpDesc(buildExpandedDescription(mp));
    setExpHours(difficultyToLevel(difficulty) + 1); // rough default
    setExpDue(""); // reset due
    // seed skills with selected "skill"
    const seedLevel = difficultyToLevel(difficulty);
    setExpReqSkills([{ name: skill || "General", level: seedLevel }]);
    setSkillCategory("");
    setSkillName("");
  }

  // Open expand from a saved micro card
  function openExpandFromSaved(m: SavedMicro) {
    openExpandFor({ title: m.title, steps: m.steps });
    setExpReqSkills(m.requiredSkills.length ? m.requiredSkills : [{ name: skill || "General", level: difficultyToLevel(difficulty) }]);
  }

  function addExpandSkill() {
    if (!skillName) return;
    setExpReqSkills((prev) => {
      const exists = prev.some((s) => s.name.toLowerCase() === skillName.toLowerCase());
      const next = exists
        ? prev.map((s) => (s.name.toLowerCase() === skillName.toLowerCase() ? { ...s, level: skillLevel } : s))
        : [...prev, { name: skillName, level: skillLevel }];
      return next;
    });
    setSkillName("");
    setSkillLevel(difficultyToLevel(difficulty));
  }

  function removeExpandSkill(name: string) {
    setExpReqSkills((prev) => prev.filter((s) => s.name.toLowerCase() !== name.toLowerCase()));
  }

  function closeExpand() {
    setOpenExpand(null);
  }

  function handleExpandConfirm() {
    if (!expTitle.trim() || !expDesc.trim()) return;
    appendToDashboard({
      title: expTitle.trim(),
      status: "inprogress", // default now
      priority: "Medium",
      due: expDue || "",
      isMicro: false,
      hoursPerWeek: expHours,
      description: expDesc.trim(),
      requiredSkills: expReqSkills,
    });
    setToast(`Added to Dashboard (In Progress).`);
    setTimeout(() => setToast(null), 3200);
    closeExpand();
  }

  function handleDontExpand(mp: MicroProject) {
    // Write to Dashboard as micro, To-Do
    appendToDashboard({
      title: mp.title,
      status: "todo",
      priority: "Low",
      isMicro: true,
      description: mp.steps.join(" | "),
      requiredSkills: [{ name: skill || "General", level: difficultyToLevel(difficulty) }],
    });

    // Also capture for on-page "My Generated Projects"
    const entry: SavedMicro = {
      id: crypto.randomUUID(),
      title: mp.title,
      steps: mp.steps,
      requiredSkills: [{ name: skill || "General", level: difficultyToLevel(difficulty) }],
      createdAt: Date.now(),
    };
    setSavedMicros((prev) => [entry, ...prev]);

    setToast("Saved to Dashboard as micro-project (To Do) and added below.");
    setTimeout(() => setToast(null), 3000);
  }

  function removeSavedMicro(id: string) {
    setSavedMicros((prev) => prev.filter((m) => m.id !== id));
  }

  const categoryOptions = useMemo(() => Object.keys(SKILL_CATALOG), []);
  const skillOptions = useMemo(() => (skillCategory ? SKILL_CATALOG[skillCategory]?.items ?? [] : []), [skillCategory]);

  return (
    <div className="w-[min(1100px,95%)] mx-auto py-10 md:py-14 space-y-8 overflow-visible">
      {/* Title / intro */}
      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
          Generate Micro-Projects
        </h1>
        <p className="text-white/75 font-['Rajdhani'] text-lg max-w-3xl">
          Select a skill and a difficulty level to generate three personalized micro-projects. Practice intentionally, ship small, and solidify your knowledge.
        </p>
      </header>

      {/* Control card */}
      <section className="relative rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-5 md:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-45"
          style={{ background: "linear-gradient(120deg, rgba(157,45,252,0.18), rgba(2,150,255,0.18))", filter: "blur(18px)", zIndex: -1 }}
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
              <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]" />
              <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
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
              <li key={i} className="relative rounded-2xl border border-white/10 bg-gradient-to-r from-[#041f3b]/80 to-[#07355a]/80 backdrop-blur-md p-5">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-35"
                  style={{ background: "linear-gradient(120deg, rgba(2,150,255,0.18), rgba(157,45,252,0.18))", filter: "blur(18px)", zIndex: -1 }}
                />
                <h3 className="text-xl font-['Rajdhani'] text-white/95 mb-2">{p.title}</h3>
                <ol className="list-decimal pl-5 space-y-1 text-white/85 font-['Rajdhani']">
                  {p.steps.map((s, j) => (
                    <li key={j}>{s}</li>
                  ))}
                </ol>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => openExpandFor(p)}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-4 py-2.5 text-white font-['Rajdhani']"
                  >
                    <span className="relative z-[1]">Expand</span>
                    <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]" />
                    <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
                  </button>

                  <button
                    onClick={() => handleDontExpand(p)}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-4 py-2.5 text-white font-['Rajdhani']"
                  >
                    <span className="relative z-[1]">Don’t Expand (Save as Micro)</span>
                    <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(2,150,255,0.28),rgba(157,45,252,0.28))]" />
                    <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* My Generated Projects */}
      {savedMicros.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95">My Generated Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedMicros.map((m) => (
              <article
                key={m.id}
                className="relative rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-5 shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-40"
                  style={{
                    background: "linear-gradient(120deg, rgba(157,45,252,0.16), rgba(2,150,255,0.16))",
                    filter: "blur(16px)",
                    zIndex: -1,
                  }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-['Rajdhani'] text-white/95">{m.title}</h3>
                    <p className="text-white/60 font-['Rajdhani'] text-sm mt-0.5">
                      Saved {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Delete mini project */}
                  <button
                    onClick={() => removeSavedMicro(m.id)}
                    title="Delete"
                    className="text-white/65 hover:text-white px-2 py-1 rounded-lg border border-white/10 bg-white/5"
                  >
                    Delete
                  </button>
                </div>

                {/* Steps preview */}
                <div className="mt-3">
                  <div className="text-white/80 font-['Rajdhani'] mb-1">Steps</div>
                  <ul className="list-disc pl-5 text-white/85 space-y-1">
                    {m.steps.slice(0, 3).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                    {m.steps.length > 3 && <li className="opacity-70">…and more</li>}
                  </ul>
                </div>

                {/* Required skills */}
                {m.requiredSkills.length > 0 && (
                  <div className="mt-3">
                    <div className="text-white/80 font-['Rajdhani'] mb-1">Required Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {m.requiredSkills.map((rs, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-white/90 text-[0.85rem]"
                        >
                          {rs.name} <span className="opacity-80">Lv{rs.level}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-end">
                  <button
                    onClick={() => openExpandFromSaved(m)}
                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-4 py-2.5 text-white font-['Rajdhani']"
                  >
                    <span className="relative z-[1]">Expand</span>
                    <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]" />
                    <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Resources carousel */}
      <section className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95">Learning Resources</h2>
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2" style={{ scrollbarWidth: "thin" }}>
            {RESOURCES.map((r, i) => (
              <article key={i} className="snap-start shrink-0 w-[280px] rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-4 relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-45"
                  style={{ background: "linear-gradient(120deg, rgba(157,45,252,0.16), rgba(2,150,255,0.16))", filter: "blur(16px)", zIndex: -1 }}
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
                  <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]" />
                  <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
                </a>
              </article>
            ))}
          </div>
          <p className="mt-2 text-white/60 font-['Rajdhani'] text-sm">Tip: drag horizontally or use shift + scroll to browse.</p>
        </div>
      </section>

      {/* Expand Modal (status picker removed, due date added) */}
      {openExpand && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-6 md:p-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeExpand} />
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0e0e12]/95 p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95 leading-relaxed">Expand Project</h3>
              <button onClick={closeExpand} className="text-white/60 hover:text-white font-['Rajdhani'] text-2xl leading-none px-2" aria-label="Close">
                ×
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleExpandConfirm(); }} className="grid gap-6 md:gap-7 leading-relaxed">
              {/* Name */}
              <label className="grid gap-2">
                <span className="text-white/85 font-['Rajdhani'] tracking-wide">Project Name</span>
                <input
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  required
                  className="rounded-2xl bg-black/25 text-white placeholder-white/45 border border-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 px-5 py-3.5 font-['Rajdhani'] tracking-wide"
                />
              </label>

              {/* Description */}
              <label className="grid gap-2">
                <span className="text-white/85 font-['Rajdhani'] tracking-wide">Project Description</span>
                <textarea
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  required
                  rows={6}
                  className="rounded-2xl bg-black/25 text-white placeholder-white/45 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-300/70 px-5 py-4 font-['Rajdhani'] tracking-wide leading-relaxed resize-vertical"
                />
              </label>

              {/* Hours + Due date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="grid gap-2">
                  <span className="text-white/80 font-['Rajdhani']">Min Hours / week: {expHours}h</span>
                  <input type="range" min={1} max={20} step={1} value={expHours} onChange={(e) => setExpHours(parseInt(e.target.value))} />
                </label>

                <label className="grid gap-2">
                  <span className="text-white/80 font-['Rajdhani']">Due Date (optional)</span>
                  <input
                    type="date"
                    value={expDue}
                    onChange={(e) => setExpDue(e.target.value)}
                    className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-2.5"
                  />
                </label>
              </div>

              {/* Required Skills editor */}
              <div className="space-y-4">
                <div className="text-white/85 font-['Rajdhani'] tracking-wide">Required Skills</div>

                {expReqSkills.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {expReqSkills.map((s) => (
                      <span key={s.name} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-white/90">
                        <span className="font-['Rajdhani']">{s.name}</span>
                        <span className="text-white/70 text-sm font-['Rajdhani']">Lv{s.level}</span>
                        <button type="button" onClick={() => removeExpandSkill(s.name)} className="text-white/60 hover:text-white" aria-label="Remove">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_220px_auto] gap-4 md:gap-5 items-end">
                    <label className="grid gap-1.5">
                      <span className="text-white/70 text-sm">Category</span>
                      <select
                        value={skillCategory}
                        onChange={(e) => {
                          setSkillCategory(e.target.value);
                          setSkillName("");
                        }}
                        className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-2.5 appearance-none"
                      >
                        <option value="">Select a category</option>
                        {Object.keys(SKILL_CATALOG).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-white/70 text-sm">Skill</span>
                      <select
                        value={skillName}
                        onChange={(e) => setSkillName(e.target.value)}
                        className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-2.5 appearance-none"
                        disabled={!skillCategory}
                      >
                        <option value="">{skillCategory ? "Select a skill" : "Choose category first"}</option>
                        {(skillCategory ? SKILL_CATALOG[skillCategory]?.items ?? [] : []).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1.5">
                      <span className="text-white/70 text-sm">Level: Lv{skillLevel}</span>
                      <input type="range" min={1} max={10} step={1} value={skillLevel} onChange={(e) => setSkillLevel(parseInt(e.target.value))} disabled={!skillName} />
                    </label>

                    <button
                      type="button"
                      onClick={addExpandSkill}
                      disabled={!skillName}
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-3 text-white font-['Rajdhani'] disabled:opacity-50"
                    >
                      <span className="relative z-[1]">Add Skill</span>
                      <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]" />
                      <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-2 flex flex-col sm:flex-row justify-end gap-3">
                <button type="button" onClick={closeExpand} className="rounded-xl border border-white/10 bg-white/5 text-white px-5 py-2.5 hover:bg-white/10">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-3 text-white font-['Orbitron'] uppercase tracking-wide"
                >
                  <span className="relative z-[1]">Expand Project</span>
                  <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]" />
                  <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
                </button>
              </div>

              {/* Quick save as micro (secondary link-style) */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (openExpand) {
                      handleDontExpand(openExpand.src);
                      closeExpand();
                    }
                  }}
                  className="text-white/70 hover:text-white font-['Rajdhani'] underline underline-offset-4"
                >
                  Don’t Expand — save as “micro-project” (To-Do)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[220]">
          <div className="rounded-xl border border-white/10 bg-black/70 backdrop-blur-md px-4 py-2 text-white font-['Rajdhani'] shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
