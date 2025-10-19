import { useEffect, useMemo, useState } from "react";

/** --------- Types --------- **/
type Skill = { name: string; level: number };

/** --------- Catalog: 10 categories with sample skills --------- **/
const SKILL_CATALOG: Record<string, string[]> = {
  "Programming Languages": [
    "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust", "PHP"
  ],
  "Web Frontend": [
    "React", "Next.js", "Vue", "Svelte", "Tailwind CSS", "Redux", "Vite", "Webpack", "CSS", "HTML"
  ],
  "Web Backend": [
    "Node.js", "Express", "Django", "Flask", "Spring Boot", ".NET", "FastAPI", "GraphQL", "REST APIs", "gRPC"
  ],
  "Databases": [
    "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Elasticsearch", "Prisma", "ORMs", "Data Modeling", "SQL"
  ],
  "DevOps & Cloud": [
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "Terraform", "Linux Admin", "Nginx", "Monitoring"
  ],
  "Operating Systems": [
    "Linux", "Windows Server", "macOS", "Shell Scripting", "Systemd", "Permissions & ACL", "File Systems", "Processes"
  ],
  "Networking": [
    "TCP/IP", "DNS", "HTTP/HTTPS", "Routing", "Switching", "VPN", "Wireshark", "Firewalls", "Load Balancing", "NAT"
  ],
  "Cybersecurity": [
    "Threat Modeling", "Vuln Scanning", "OWASP Top 10", "SIEM", "IAM", "Pen Testing Basics", "Incident Response", "Zero Trust"
  ],
  "Data & ML": [
    "NumPy", "Pandas", "Matplotlib", "scikit-learn", "PyTorch", "TensorFlow", "ETL", "Feature Engineering", "Experimentation"
  ],
  "Mobile & Tools": [
    "React Native", "Flutter", "Swift", "Kotlin", "Android", "iOS", "Git", "GitHub Actions", "Jest", "Playwright"
  ],
};

/** deduped flat list for quick “already-added” checks */
const ALL_SKILLS = Object.values(SKILL_CATALOG).flat();

/** --------- Helpers --------- **/
const loadSkills = (): Skill[] => {
  try {
    const raw = localStorage.getItem("skills");
    if (!raw) return [];
    const parsed: Skill[] = JSON.parse(raw);
    return parsed.filter((s) => typeof s.name === "string" && typeof s.level === "number");
  } catch {
    return [];
  }
};

const saveSkills = (skills: Skill[]) => {
  localStorage.setItem("skills", JSON.stringify(skills));
  // let other routes (dashboard) know
  window.dispatchEvent(new Event("skills-updated"));
};

/** --------- Component --------- **/
export default function Profile() {
  // Basic profile (stub for now)
  const [fullName, setFullName] = useState<string>("Alex Doe");
  const [availability, setAvailability] = useState<string>("1-3h");

  // Skills state (persisted)
  const [skills, setSkills] = useState<Skill[]>(() => loadSkills());

  // For picker UI
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");

  // Available options excluding already-added skills
  const taken = useMemo(() => new Set(skills.map((s) => s.name)), [skills]);

  useEffect(() => {
    saveSkills(skills);
  }, [skills]);

  const addSkill = () => {
    if (!selectedSkill) return;
    if (taken.has(selectedSkill)) return;
    const updated = [...skills, { name: selectedSkill, level: 1 }];
    setSkills(updated);
    setSelectedSkill("");
  };

  const removeSkill = (name: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== name));
  };

  const changeLevel = (name: string, level: number) => {
    setSkills((prev) => prev.map((s) => (s.name === name ? { ...s, level } : s)));
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // You can persist name/availability later; for now we just keep in memory.
    // Skills already saved via useEffect above.
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-10 text-white space-y-10">
      {/* Title / subtitle */}
      <header className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] tracking-[0.25em] leading-tight
                       text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300
                       motion-safe:animate-[textGlow_4s_ease-in-out_infinite_alternate]">
          Profile
        </h1>
        <p className="text-white/70 font-['Rajdhani'] text-lg">
          Update your profile to get better project matches.
        </p>
      </header>

      {/* Profile form card */}
      <form
        onSubmit={saveProfile}
        className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-60"
          style={{
            background:
              "linear-gradient(120deg, rgba(157,45,252,0.18), rgba(2,150,255,0.18))",
            filter: "blur(18px)",
            zIndex: -1,
          }}
        />
        {/* Full Name */}
        <label className="block mb-5">
          <span className="block text-sm text-white/80 font-['Rajdhani'] mb-1">
            Full Name
          </span>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl bg-black/25 text-white placeholder-white/45
                       border border-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/70
                       px-4 py-3 font-['Rajdhani'] tracking-wide shadow-[inset_0_0_0_999px_rgba(255,255,255,0.02)]"
            placeholder="Your name"
          />
        </label>

        {/* Availability */}
        <label className="block">
          <span className="block text-sm text-white/80 font-['Rajdhani'] mb-1">
            Weekly Availability
          </span>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full rounded-xl bg-black/25 text-white border border-[#a855f7]/60 focus:outline-none
                       focus:ring-2 focus:ring-purple-400/70 px-4 py-3 appearance-none"
          >
            <option value="1-3h">1-3h</option>
            <option value="4-7h">4-7h</option>
            <option value="8-12h">8-12h</option>
            <option value="13-20h">13-20h</option>
            <option value="20+h">20+h</option>
          </select>
        </label>

        <div className="mt-6">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-['Rajdhani'] border border-purple-400/50
                       bg-purple-500/25 hover:bg-purple-500/40 transition-colors"
          >
            Save Profile
          </button>
        </div>
      </form>

      {/* Skills card */}
      <section className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-60"
          style={{
            background:
              "linear-gradient(120deg, rgba(157,45,252,0.18), rgba(2,150,255,0.18))",
            filter: "blur(18px)",
            zIndex: -1,
          }}
        />
        <h2 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95 mb-6">
          Your Skills
        </h2>

        {/* Existing skills */}
        <div className="space-y-6">
          {skills.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.04] p-6 text-white/70 font-['Rajdhani']">
              No skills yet — add some below.
            </div>
          )}

          {skills.map((s) => (
            <div key={s.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/85">{s.name}</span>
                <span className="inline-grid place-items-center w-10 h-10 rounded-full
                                 bg-white/5 border border-white/10 text-sm">
                  <div className="leading-3 text-white/70">Lv</div>
                  <div className="text-white font-semibold">{s.level}</div>
                </span>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={1}
                max={10}
                value={s.level}
                onChange={(e) => changeLevel(s.name, Number(e.target.value))}
                className="w-full accent-purple-400"
              />

              {/* Remove */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeSkill(s.name)}
                  className="px-3 py-1.5 rounded-lg border border-pink-400/40 bg-pink-500/20
                             hover:bg-pink-500/35 text-pink-200 text-sm font-semibold transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new skill */}
        <div className="mt-8 space-y-3">
          <div className="text-white/80 font-['Rajdhani']">Add a new skill</div>

          {/* Category + skill selects (grouped) */}
          <div className="grid gap-3 md:grid-cols-2">
            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSkill("");
              }}
              className="w-full rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none
                         focus:ring-2 focus:ring-cyan-300/70 px-4 py-3 appearance-none"
            >
              <option value="" disabled>
                Select a category
              </option>
              {Object.keys(SKILL_CATALOG).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Skill (filtered by category, excludes already-added) */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none
                         focus:ring-2 focus:ring-cyan-300/70 px-4 py-3 appearance-none"
              disabled={!selectedCategory}
            >
              <option value="">
                {selectedCategory ? "Select a skill to add" : "Pick a category first"}
              </option>
              {selectedCategory &&
                SKILL_CATALOG[selectedCategory]
                  .filter((n) => !taken.has(n))
                  .map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={addSkill}
              disabled={!selectedSkill}
              className="relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-3
                         text-white font-['Orbitron'] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-[1]">Add Skill</span>
              <span
                aria-hidden
                className="absolute inset-0 rounded-xl opacity-90
                           [background:linear-gradient(45deg,rgba(157,45,252,0.25),rgba(2,150,255,0.25))]"
              />
              <span
                aria-hidden
                className="absolute inset-[2px] rounded-[10px] bg-[#101010]/80 border border-white/10"
              />
            </button>
          </div>
        </div>
      </section>

      {/* keyframes */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes textGlow {
            0%, 100% { text-shadow: 0 0 10px rgba(155,93,229,0.7), 0 0 22px rgba(0,204,255,0.35); }
            50%     { text-shadow: 0 0 24px rgba(0,204,255,0.9), 0 0 36px rgba(155,93,229,0.7); }
          }
        }
      `}</style>
    </div>
  );
}
