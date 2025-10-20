import { useEffect, useMemo, useState } from "react";

/* --------------------------- Skill Catalog (same categories) --------------------------- */
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

/* ------------------------------------ Types ------------------------------------ */
type RequiredSkill = { name: string; level: number }; // 1..10
type ProjectCard = {
  id: string;
  title: string;
  author: string;
  createdAgo: string;
  description: string;
  skills: RequiredSkill[];
  due?: string;
  minHours?: number;
};

type Candidate = {
  id: string;
  name: string;
  avatar?: string;
  match: number;
  skills: RequiredSkill[];
  reason: string;
};

/* --------------------------------- Demo Data ---------------------------------- */
const DEMO: ProjectCard[] = [
  {
    id: "proj-1",
    title: "E-commerce Frontend",
    author: "Jane Smith",
    createdAgo: "2 days ago",
    description: "Build a responsive frontend for an e-commerce site using React and TypeScript.",
    skills: [
      { name: "React", level: 4 },
      { name: "TypeScript", level: 3 },
      { name: "State Management", level: 3 },
    ],
    due: "2025-12-01",
    minHours: 5,
  },
  {
    id: "proj-2",
    title: "Data Analysis API",
    author: "Sam Wilson",
    createdAgo: "5 days ago",
    description: "Create a Python-based API for analyzing user data with Pandas and exposing it via REST endpoints.",
    skills: [
      { name: "Python", level: 4 },
      { name: "Pandas", level: 3 },
      { name: "REST APIs", level: 2 },
    ],
    due: "2025-12-10",
    minHours: 4,
  },
];

/* ------------------------------ LocalStorage sync ------------------------------ */
const LS_KEY = "dashboard.projects";
function appendProjectToDashboard(opts: {
  title: string;
  due?: string;
  hoursPerWeek?: number;
}) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const item = {
      id: crypto.randomUUID(),
      title: opts.title,
      status: "inprogress",
      priority: "Medium",
      due: opts.due ?? "",
      hoursPerWeek: typeof opts.hoursPerWeek === "number" ? opts.hoursPerWeek : null,
    };
    const next = [item, ...arr];
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("projects-updated"));
  } catch {
    // ignore
  }
}

/* --------------------------------- Component ---------------------------------- */
export default function Projects() {
  const [projects, setProjects] = useState<ProjectCard[]>(DEMO);
  const [showCreate, setShowCreate] = useState(false);
  const [matchesFor, setMatchesFor] = useState<ProjectCard | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {}, [projects.length]);

  /* ---------------------- Create Project Modal state ---------------------- */
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState<string>("");           // NEW
  const [minHours, setMinHours] = useState<number>(4);  // NEW

  const [skillCategory, setSkillCategory] = useState<string>("");
  const [skillName, setSkillName] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<number>(3);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);

  const categoryOptions = useMemo(() => Object.keys(SKILL_CATALOG), []);
  const skillOptions = useMemo(
    () => (skillCategory ? SKILL_CATALOG[skillCategory]?.items ?? [] : []),
    [skillCategory]
  );

  const addSkill = () => {
    if (!skillName) return;
    setRequiredSkills((prev) => {
      const exists = prev.some((s) => s.name.toLowerCase() === skillName.toLowerCase());
      const next = exists
        ? prev.map((s) => (s.name.toLowerCase() === skillName.toLowerCase() ? { ...s, level: skillLevel } : s))
        : [...prev, { name: skillName, level: skillLevel }];
      return next;
    });
    setSkillName("");
    setSkillLevel(3);
  };

  const removeSkill = (name: string) =>
    setRequiredSkills((prev) => prev.filter((s) => s.name.toLowerCase() !== name.toLowerCase()));

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setDue("");
    setMinHours(4);
    setSkillCategory("");
    setSkillName("");
    setSkillLevel(3);
    setRequiredSkills([]);
  };

  const submitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const card: ProjectCard = {
      id: crypto.randomUUID(),
      title: title.trim(),
      author: "Unknown User",
      createdAgo: "just now",
      description: desc.trim(),
      skills: requiredSkills.length ? requiredSkills : [],
      due: due || undefined,
      minHours,
    };

    setProjects((prev) => [card, ...prev]);
    setShowCreate(false);
    appendProjectToDashboard({ title: card.title, due, hoursPerWeek: minHours });
    resetForm();
    setToast("Project created and added to Dashboard (In Progress).");
    setTimeout(() => setToast(null), 3500);
  };

  /* -------------------------- Mocked teammate matches -------------------------- */
  const candidates: Candidate[] = useMemo(() => {
    if (!matchesFor) return [];
    const req = matchesFor.skills.map((s) => s.name.toLowerCase());
    const has = (arr: string[]) => arr.filter((n) => req.includes(n.toLowerCase())).length;

    const pool: Candidate[] = [
      {
        id: "c1",
        name: "Alex Doe",
        match: 1.77,
        skills: [
          { name: "TypeScript", level: 3 },
          { name: "Penetration Testing", level: 2 },
        ],
        reason:
          "Needs React(4), TypeScript(3), State Management(3). You have TypeScript(3), Penetration Testing(2). Time fit: 5–8h/wk.",
      },
      {
        id: "c2",
        name: "Sam Wilson",
        match: 0.3,
        skills: [
          { name: "Node.js", level: 5 },
          { name: "SQL", level: 4 },
          { name: "Python", level: 2 },
        ],
        reason:
          "Needs React(4), TypeScript(3), State Management(3). You have Node.js(5), SQL(4), Python(2). Time fit: 8h+/wk.",
      },
      {
        id: "c3",
        name: "Chen Wei",
        match: 0.27,
        skills: [
          { name: "Java", level: 4 },
          { name: "SQL", level: 3 },
        ],
        reason:
          "Needs React(4), TypeScript(3), State Management(3). You have Java(4), SQL(3). Time fit: 5–8h/wk.",
      },
      {
        id: "c4",
        name: "Maria Garcia",
        match: 0.06,
        skills: [
          { name: "SQL", level: 4 },
          { name: "Python", level: 5 },
        ],
        reason:
          "Needs React(4), TypeScript(3), State Management(3). Skills overlap limited. Time fit: unknown.",
      },
    ];

    return pool.sort((a, b) => has(b.skills.map((s) => s.name)) - has(a.skills.map((s) => s.name)));
  }, [matchesFor]);

  const [invited, setInvited] = useState<Record<string, boolean>>({});
  const toggleInvite = (id: string) => setInvited((p) => ({ ...p, [id]: !p[id] }));

  /* --------------------------------- Render --------------------------------- */
  return (
    <div className="w-[min(1100px,95%)] mx-auto py-10 md:py-14 space-y-8 overflow-visible leading-relaxed">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-['Orbitron'] tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
            Project Board
          </h1>
          <p className="text-white/75 font-['Rajdhani'] text-lg">Find a project to join or post your own.</p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-4 py-2.5 text-white font-['Orbitron'] uppercase tracking-wide"
        >
          <span className="relative z-[1]">Create Project</span>
          <span
            aria-hidden
            className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]"
          />
          <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
        </button>
      </header>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <article
            key={p.id}
            className="relative rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-5 shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-45"
              style={{
                background: "linear-gradient(120deg, rgba(157,45,252,0.18), rgba(2,150,255,0.18))",
                filter: "blur(18px)",
                zIndex: -1,
              }}
            />
            <h3 className="text-2xl font-['Rajdhani'] text-white/95">{p.title}</h3>
            <p className="text-white/60 font-['Rajdhani']">by {p.author} · {p.createdAgo}</p>
            <p className="mt-4 text-white/85 font-['Rajdhani']">{p.description}</p>

            {/* Meta badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              {typeof p.minHours === "number" && (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-white/90 text-[0.85rem]">
                  Min {p.minHours}h / wk
                </span>
              )}
              {p.due && (
                <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-white/90 text-[0.85rem]">
                  Due {new Date(p.due + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>

            <div className="mt-5">
              <div className="text-white/80 font-['Rajdhani'] mb-2">Required Skills</div>
              <div className="flex flex-wrap gap-2">
                {p.skills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-white/90 text-[0.85rem]"
                  >
                    {s.name} <span className="opacity-80">(Lv{String(s.level)})</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setMatchesFor(p)}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-4 py-2.5 text-white font-['Orbitron'] uppercase tracking-wide"
              >
                <span className="relative z-[1]">Find Teammates</span>
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]"
                />
                <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Matches section */}
      {matchesFor && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMatchesFor(null)}
              className="text-white/70 hover:text-white font-['Rajdhani']"
            >
              ← Back to Projects
            </button>
          </div>

          <h2 className="text-2xl md:text-3xl font-['Orbitron'] tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
            Top Matches for: {matchesFor.title}
          </h2>
          <p className="text-white/70 font-['Rajdhani']">
            These are the top candidates based on skills and availability.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ...candidate cards unchanged... */}
            {/* (left as-is from your current file) */}
            {/** your existing candidates.map(...) block goes here **/}
          </div>
        </section>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-6 md:p-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0e0e12]/95 p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95 leading-relaxed">
                Create a New Project
              </h3>
              <button
                onClick={() => setShowCreate(false)}
                className="text-white/60 hover:text-white font-['Rajdhani'] text-2xl leading-none px-2"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="text-white/75 font-['Rajdhani'] mb-8 leading-relaxed">
              Describe your project to find the perfect collaborators.
            </p>

            <form onSubmit={submitProject} className="grid gap-6 md:gap-7 leading-relaxed">
              {/* Title */}
              <label className="grid gap-2">
                <span className="text-white/85 font-['Rajdhani'] tracking-wide">Project Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g., 'Habit Tracker App'"
                  className="rounded-2xl bg-black/25 text-white placeholder-white/45 border border-white/15
                             focus:outline-none focus:ring-2 focus:ring-cyan-300/70
                             px-5 py-3.5 font-['Rajdhani'] tracking-wide"
                />
              </label>

              {/* Description */}
              <label className="grid gap-2">
                <span className="text-white/85 font-['Rajdhani'] tracking-wide">Project Description</span>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                  rows={6}
                  placeholder="Describe your project goals and what you want to build."
                  className="rounded-2xl bg-black/25 text-white placeholder-white/45 border border-white/15
                             focus:outline-none focus:ring-2 focus:ring-purple-300/70
                             px-5 py-4 font-['Rajdhani'] tracking-wide leading-relaxed resize-vertical"
                />
              </label>

              {/* NEW: Hours + Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="grid gap-2">
                  <span className="text-white/80 font-['Rajdhani']">Minimum Hours / week: {minHours}h</span>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={minHours}
                    onChange={(e) => setMinHours(parseInt(e.target.value))}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-white/80 font-['Rajdhani']">Due Date (optional)</span>
                  <input
                    type="date"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-2.5"
                  />
                </label>
              </div>

              {/* Required Skills */}
              <div className="space-y-4">
                <div className="text-white/85 font-['Rajdhani'] tracking-wide">Required Skills</div>

                {requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {requiredSkills.map((s) => (
                      <span
                        key={s.name}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-white/90"
                      >
                        <span className="font-['Rajdhani']">{s.name}</span>
                        <span className="text-white/70 text-sm font-['Rajdhani']">Lv{s.level}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(s.name)}
                          className="text-white/60 hover:text-white"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_240px_auto] gap-4 md:gap-5 items-end">
                    {/* Category */}
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
                        {categoryOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Skill */}
                    <label className="grid gap-1.5">
                      <span className="text-white/70 text-sm">Skill</span>
                      <select
                        value={skillName}
                        onChange={(e) => setSkillName(e.target.value)}
                        className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-2.5 appearance-none"
                        disabled={!skillCategory}
                      >
                        <option value="">{skillCategory ? "Select a skill" : "Choose category first"}</option>
                        {skillOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Level slider */}
                    <label className="grid gap-1.5">
                      <span className="text-white/70 text-sm">Level: Lv{skillLevel}</span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(parseInt(e.target.value))}
                        className="w-full"
                        disabled={!skillName}
                      />
                    </label>

                    {/* Add */}
                    <button
                      type="button"
                      onClick={addSkill}
                      disabled={!skillName}
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-3 text-white font-['Rajdhani'] disabled:opacity-50"
                    >
                      <span className="relative z-[1]">Add Skill</span>
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]"
                      />
                      <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl border border-white/10 bg-white/5 text-white px-5 py-2.5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-3 text-white font-['Orbitron'] uppercase tracking-wide"
                >
                  <span className="relative z-[1]">Create Project</span>
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]"
                  />
                  <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
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
