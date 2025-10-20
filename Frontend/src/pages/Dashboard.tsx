import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* ---------- Types ---------- */
type RequestStatus = "pending" | "accepted" | "declined" | "canceled";

type IncomingReq = {
  id: string;
  from: string;
  projectTitle: string;
  time: string;
  message?: string;
  status: RequestStatus;
};
type OutgoingReq = {
  id: string;
  to: string;
  projectTitle: string;
  time: string;
  status: RequestStatus;
};

type Member = { id: string; name: string; role?: string };
type RequiredSkill = { name: string; level: number }; // 1..10

type Space = {
  id: string;
  kind: "project" | "group";
  name: string;
  blurb: string;
  owner: boolean;                   // true if current user is owner
  members: Member[];
  requiredSkills: RequiredSkill[];
  weeklyAvailability?: number;      // hours / wk
  due?: string;                     // ISO date
};

/* ---------- Helpers (Discord + Dates + Owner lookup) ---------- */
function getMyDiscord(): string | null {
  try {
    const raw = localStorage.getItem("profile.contact");
    if (!raw) return null;
    const contact = JSON.parse(raw);
    const handle = contact?.discord?.handle ?? contact?.discord;
    if (typeof handle === "string" && handle.trim()) return handle.trim();
  } catch {}
  return null;
}

function getOwnerMember(space: Space): Member | null {
  return space.members.find((m) => (m.role ?? "").toLowerCase() === "owner") ?? null;
}

function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso as string;
  }
}

/* ---------- Component ---------- */
export default function Dashboard() {
  // Skills intentionally blank (filled via Profile later)
  const skills: Array<{ name: string; xp: number; level: number }> = useMemo(() => [], []);

  /* Requests — mock data */
  const [incoming, setIncoming] = useState<IncomingReq[]>([
    { id: "in1", from: "Alex Doe",  projectTitle: "E-commerce Frontend", time: "2h ago", message: "Can I join your in-progress work?", status: "pending" },
    { id: "in2", from: "Sam Wilson",projectTitle: "API Wrapper",         time: "1d ago", status: "pending" },
  ]);
  const [outgoing, setOutgoing] = useState<OutgoingReq[]>([
    { id: "out1", to: "Jane Smith", projectTitle: "Unit Test Suite",   time: "3h ago", status: "pending" },
    { id: "out2", to: "Chen Wei",   projectTitle: "Portfolio Landing", time: "2d ago", status: "accepted" },
  ]);

  const acceptIncoming = (id: string) =>
    setIncoming(prev => prev.map(r => (r.id === id ? { ...r, status: "accepted" } : r)));
  const declineIncoming = (id: string) =>
    setIncoming(prev => prev.map(r => (r.id === id ? { ...r, status: "declined" } : r)));
  const cancelOutgoing = (id: string) =>
    setOutgoing(prev => prev.map(r => (r.id === id ? { ...r, status: "canceled" } : r)));

  /* Combined spaces (projects + groups) */
  const [spaces, setSpaces] = useState<Space[]>([
    /* Owned */
    {
      id: "s1",
      kind: "project",
      name: "Portfolio Landing",
      blurb: "Marketing site for the SkillSynth portfolio with animated hero.",
      owner: true,
      members: [
        { id: "u1", name: "You", role: "Owner" },
        { id: "u2", name: "Alex Doe", role: "Contributor" },
      ],
      requiredSkills: [
        { name: "React", level: 3 },
        { name: "TypeScript", level: 3 },
        { name: "Tailwind", level: 2 },
      ],
      weeklyAvailability: 6,
      due: "2025-11-02",
    },
    {
      id: "s2",
      kind: "group",
      name: "React SaaS Starter",
      blurb: "SaaS dashboard skeleton with auth mock + charts.",
      owner: true,
      members: [
        { id: "u1", name: "You", role: "Owner" },
        { id: "u3", name: "Sam Wilson", role: "Contributor" },
        { id: "u4", name: "Jane Smith", role: "Contributor" },
      ],
      requiredSkills: [
        { name: "React", level: 4 },
        { name: "TypeScript", level: 3 },
        { name: "Tailwind", level: 2 },
      ],
      weeklyAvailability: 5,
    },

    /* Member-only */
    {
      id: "s3",
      kind: "project",
      name: "API Wrapper",
      blurb: "Small wrapper around a public API with caching.",
      owner: false,
      members: [
        { id: "u5", name: "Chen Wei", role: "Owner" },
        { id: "u1", name: "You", role: "Contributor" },
      ],
      requiredSkills: [
        { name: "Node.js", level: 3 },
        { name: "PostgreSQL", level: 2 },
      ],
      weeklyAvailability: 4,
      due: "2025-11-15",
    },
    {
      id: "s4",
      kind: "group",
      name: "Go API + Postgres",
      blurb: "REST API with Go and Postgres. Tiny web tester.",
      owner: false,
      members: [
        { id: "u4", name: "Jane Smith", role: "Owner" },
        { id: "u1", name: "You", role: "Contributor" },
      ],
      requiredSkills: [
        { name: "Go", level: 3 },
        { name: "PostgreSQL", level: 3 },
        { name: "Docker", level: 2 },
      ],
      weeklyAvailability: 4,
    },
  ]);

  const owned = spaces.filter(s => s.owner);
  const memberOnly = spaces.filter(s => !s.owner);

  /* Group/Project modal (owner aware) */
  const [active, setActive] = useState<Space | null>(null);
  const openSpace = (s: Space) => setActive(s);
  const closeSpace = () => setActive(null);

  const saveSpace = (id: string, patch: Partial<Space>) => {
    setSpaces(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };
  const inviteToSpace = (id: string, name: string) => {
    setSpaces(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, members: [...s.members, { id: crypto.randomUUID(), name, role: "Contributor" }] }
          : s
      )
    );
  };
  const kickFromSpace = (id: string, memberId: string) => {
    setSpaces(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, members: s.members.filter(m => m.id !== memberId) }
          : s
      )
    );
  };

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  return (
    <div className="space-y-8 overflow-visible">
      {/* Heading */}
      <header className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] tracking-[0.25em] leading-tight
                       text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300
                       motion-safe:animate-[textGlow_4s_ease-in-out_infinite_alternate] break-words overflow-visible">
          My Dashboard
        </h1>
        <p className="text-white/70 font-['Rajdhani'] text-lg">
          Track your skill progress and collaborate with your teams.
        </p>
      </header>

      {/* Main layout: sidebar + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Sidebar — Requests */}
        <aside className="space-y-6">
          <RequestCard title="Incoming Requests / Invites">
            {incoming.length === 0 ? (
              <Empty text="No incoming requests" />
            ) : (
              <ul className="grid gap-3">
                {incoming.map((r) => (
                  <li key={r.id} className="rounded-xl border border-white/12 bg-white/[0.05] backdrop-blur-md p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-['Rajdhani'] text-white/95">{r.from}</span>
                          <StatusPill status={r.status} />
                        </div>
                        <div className="text-white/70 text-sm mt-0.5">
                          for <span className="text-white/85">{r.projectTitle}</span> • {r.time}
                        </div>
                        {r.message && <p className="mt-2 text-white/80 text-sm">{r.message}</p>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <ButtonGrad onClick={() => acceptIncoming(r.id)} disabled={r.status !== "pending"} label="Accept" tone="green" />
                      <ButtonGrad onClick={() => declineIncoming(r.id)} disabled={r.status !== "pending"} label="Decline" tone="pink" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </RequestCard>

          <RequestCard title="Outgoing Requests / Invites">
            {outgoing.length === 0 ? (
              <Empty text="No outgoing requests" />
            ) : (
              <ul className="grid gap-3">
                {outgoing.map((r) => (
                  <li key={r.id} className="rounded-xl border border-white/12 bg-white/[0.05] backdrop-blur-md p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-['Rajdhani'] text-white/95">To {r.to}</span>
                        <StatusPill status={r.status} />
                      </div>
                      <div className="text-white/70 text-sm mt-0.5">
                        for <span className="text-white/85">{r.projectTitle}</span> • {r.time}
                      </div>
                    </div>
                    <div className="mt-3">
                      <ButtonGrad onClick={() => cancelOutgoing(r.id)} disabled={r.status !== "pending"} label="Cancel" tone="cyan" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </RequestCard>
        </aside>

        {/* Main content */}
        <main className="space-y-6 overflow-visible">
          {/* Skill Mastery */}
          <section className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 md:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.35)] overflow-visible">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-2xl opacity-60"
              style={{
                background: "linear-gradient(120deg, rgba(157,45,252,0.18), rgba(2,150,255,0.18))",
                filter: "blur(18px)",
                zIndex: -1,
              }}
            />
            <h2 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95">
              <span className="font-semibold">Skill Mastery</span>
              <span className="ml-2 text-white/60 text-base md:text-lg">XP Progress per Skill</span>
            </h2>

            {skills.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center">
                <p className="text-white/80 font-['Rajdhani']">
                  No skills yet. Add skills in{" "}
                  <Link to="/profile" className="underline underline-offset-4 text-cyan-300 hover:text-cyan-200">
                    Profile
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-6">{/* future skill bars */}</div>
            )}
          </section>

          {/* My Groups / Projects — merged */}
          <section className="space-y-4 overflow-visible">
            <h2 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95">My Groups / Projects</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Owned (full control) */}
              <div className="space-y-3">
                <h3 className="text-lg font-['Rajdhani'] text-white/80">Owned</h3>
                {owned.length === 0 ? (
                  <Card><Empty text="You don't own any projects yet" hint="Create one from Projects or Groups." /></Card>
                ) : (
                  <div className="grid gap-4">
                    {owned.map((s) => (
                      <SpaceCard key={s.id} s={s}>
                        <ButtonFrame onClick={() => openSpace(s)} label="Edit / Manage" />
                      </SpaceCard>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Member-only (view-only) */}
              <div className="space-y-3">
                <h3 className="text-lg font-['Rajdhani'] text-white/80">Member Only</h3>
                {memberOnly.length === 0 ? (
                  <Card><Empty text="Not a member of any groups yet" hint="Request to join from Groups." /></Card>
                ) : (
                  <div className="grid gap-4">
                    {memberOnly.map((s) => (
                      <SpaceCard key={s.id} s={s}>
                        <ButtonFrame onClick={() => openSpace(s)} label="View Details" />
                      </SpaceCard>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Space modal */}
      {active && (
        <SpaceModal
          space={active}
          onClose={closeSpace}
          onSave={(patch) => { saveSpace(active.id, patch); showToast("Saved"); }}
          onInvite={(name) => { inviteToSpace(active.id, name); showToast("Invited"); }}
          onKick={(memberId) => { kickFromSpace(active.id, memberId); showToast("Removed"); }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[130]">
          <div className="rounded-xl border border-white/10 bg-black/70 backdrop-blur-md px-4 py-2 text-white font-['Rajdhani'] shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
            {toast}
          </div>
        </div>
      )}

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

/* ---------- Cards / Bits ---------- */

function SpaceCard({ s, children }: { s: Space; children: React.ReactNode }) {
  return (
    <article className="relative rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-5 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-40"
        style={{
          background: "linear-gradient(120deg, rgba(157,45,252,0.16), rgba(2,150,255,0.16))",
          filter: "blur(16px)",
          zIndex: -1,
        }}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-['Rajdhani'] text-white/95 truncate">{s.name}</h3>
            {s.owner ? (
              <span className="inline-flex items-center rounded-md px-2 py-[2px] text-[0.7rem] font-semibold bg-gradient-to-r from-[#7dd3fc] to-[#a78bfa] text-black/90 shadow-[0_0_6px_rgba(0,0,0,0.15)]">
                Owner
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md px-2 py-[2px] text-[0.7rem] font-semibold bg-gradient-to-r from-[#cbd5e1] to-[#94a3b8] text-black/90 shadow-[0_0_6px_rgba(0,0,0,0.15)]">
                Member
              </span>
            )}
          </div>
          <p className="text-white/75 font-['Rajdhani'] mt-1">{s.blurb}</p>
        </div>
        <div className="shrink-0 grid gap-1 text-right">
          {typeof s.weeklyAvailability === "number" && (
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-white/85 font-['Rajdhani']">
              ~{s.weeklyAvailability}h / wk
            </div>
          )}
          {s.due && (
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-white/85 font-['Rajdhani']">
              Due: {formatDate(s.due)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="text-white/70 font-['Rajdhani'] text-sm mb-1">Members</div>
          <div className="flex flex-wrap gap-2">
            {s.members.slice(0, 4).map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-white/90 text-[0.85rem]"
              >
                {m.name}
                {m.role ? <span className="opacity-70">({m.role})</span> : null}
              </span>
            ))}
            {s.members.length > 4 && (
              <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-white/80 text-[0.85rem]">
                +{s.members.length - 4} more
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-white/70 font-['Rajdhani'] text-sm mb-1">Required Skills</div>
          <div className="flex flex-wrap gap-2">
            {s.requiredSkills.map((rs, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-white/90 text-[0.85rem]">
                {rs.name} <span className="opacity-80">Lv{rs.level}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end">{children}</div>
    </article>
  );
}

function RequestCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-[0_10px_35px_rgba(0,0,0,0.35)]">
      <div aria-hidden className="pointer-events-none absolute -inset-px rounded-2xl opacity-50"
        style={{ background: "linear-gradient(120deg, rgba(157,45,252,0.18), rgba(2,150,255,0.18))", filter: "blur(18px)", zIndex: -1 }} />
      <h3 className="text-xl font-['Rajdhani'] text-white/95 mb-3">{title}</h3>
      {children}
    </section>
  );
}

function StatusPill({ status }: { status: "pending" | "accepted" | "declined" | "canceled" }) {
  const map: Record<string, string> = {
    pending:  "from-[#fcd34d] to-[#f59e0b] text-black/90",
    accepted: "from-[#34d399] to-[#10b981] text-black/90",
    declined: "from-[#fb7185] to-[#db2777] text-black/90",
    canceled: "from-[#a3a3a3] to-[#737373] text-black/90",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-[2px] text-[0.7rem] font-semibold bg-gradient-to-r ${map[status]}`}>
      {status}
    </span>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-dashed border-white/15 bg-white/[0.04] backdrop-blur-md p-7 overflow-visible">
      <div aria-hidden className="pointer-events-none absolute -inset-px rounded-2xl opacity-40"
        style={{ background: "linear-gradient(120deg, rgba(157,45,252,0.14), rgba(2,150,255,0.14))", filter: "blur(18px)", zIndex: -1 }} />
      {children}
    </div>
  );
}

function Empty({ text, hint }: { text: string; hint?: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-white/5 border border-white/10 grid place-items-center shadow-[inset_0_0_24px_rgba(0,0,0,0.45)]">
        <span className="text-2xl">⚡</span>
      </div>
      <h3 className="mt-5 text-xl font-['Rajdhani'] text-white/90">{text}</h3>
      {hint && <p className="mt-2 text-white/65 font-['Rajdhani']">{hint}</p>}
    </div>
  );
}

function ButtonGrad({
  label,
  onClick,
  disabled,
  tone = "cyan",
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "cyan" | "green" | "pink";
}) {
  const grad =
    tone === "green"
      ? "linear-gradient(45deg,rgba(34,197,94,0.28),rgba(16,185,129,0.28))"
      : tone === "pink"
      ? "linear-gradient(45deg,rgba(244,63,94,0.30),rgba(219,39,119,0.30))"
      : "linear-gradient(45deg,rgba(2,150,255,0.28),rgba(157,45,252,0.28))";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="relative inline-flex items-center justify-center overflow-hidden rounded-lg px-3 py-1.5 text-sm text-white disabled:opacity-50"
    >
      <span className="relative z-[1]">{label}</span>
      <span aria-hidden className="absolute inset-0 rounded-lg opacity-90" style={{ background: grad }} />
      <span aria-hidden className="absolute inset-[2px] rounded-[8px] bg-[#101010]/85 border border-white/10" />
    </button>
  );
}

function ButtonFrame({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-4 py-2.5 text-white font-['Orbitron'] uppercase tracking-wide"
    >
      <span className="relative z-[1]">{label}</span>
      <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]" />
      <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/85 border border-white/10" />
    </button>
  );
}

/* ---------- Space Modal (owner aware) ---------- */
function SpaceModal({
  space,
  onClose,
  onSave,
  onInvite,
  onKick,
}: {
  space: Space;
  onClose: () => void;
  onSave: (patch: Partial<Space>) => void;
  onInvite: (name: string) => void;
  onKick: (memberId: string) => void;
}) {
  const [tab, setTab] = useState<"members" | "details">("members");
  const [name, setName] = useState(space.name);
  const [blurb, setBlurb] = useState(space.blurb);
  const [due, setDue] = useState(space.due ?? "");
  const [hours, setHours] = useState<number>(space.weeklyAvailability ?? 4);
  const [inviteName, setInviteName] = useState("");

  // skills editor
  const [skills, setSkills] = useState<RequiredSkill[]>(space.requiredSkills);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(3);

  const isOwner = space.owner;

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    const n = newSkillName.trim();
    if (!n) return;
    setSkills(prev => {
      const found = prev.find(s => s.name.toLowerCase() === n.toLowerCase());
      if (found) {
        return prev.map(s => (s.name.toLowerCase() === n.toLowerCase() ? { ...s, level: newSkillLevel } : s));
      }
      return [...prev, { name: n, level: newSkillLevel }];
    });
    setNewSkillName("");
    setNewSkillLevel(3);
  };
  const removeSkill = (name: string) => {
    if (!isOwner) return;
    setSkills(prev => prev.filter(s => s.name.toLowerCase() !== name.toLowerCase()));
  };

  const saveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    onSave({
      name: name.trim() || space.name,
      blurb: blurb.trim() || space.blurb,
      due: due || undefined,
      weeklyAvailability: hours,
      requiredSkills: skills,
    });
    onClose();
  };

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    const v = inviteName.trim();
    if (!v) return;
    onInvite(v);
    setInviteName("");
  };

  const ownerMember = getOwnerMember(space);
  const myDiscord = getMyDiscord();

  return (
    <div className="fixed inset-0 z-[130] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0e0e12]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-['Rajdhani'] text-white/95">{space.owner ? "Manage" : "View"}: {space.name}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none px-2">×</button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex items-center gap-2">
          <Tab like="Members" active={tab === "members"} onClick={() => setTab("members")} />
          <Tab like="Details" active={tab === "details"} onClick={() => setTab("details")} />
        </div>

        {/* Content */}
        {tab === "members" ? (
          <div className="mt-5 space-y-5">
            {/* Invite (owner only) */}
            <div className={`rounded-xl border border-white/10 bg-white/[0.05] p-4 ${isOwner ? "" : "opacity-60"}`}>
              <form onSubmit={invite} className="flex flex-col sm:flex-row gap-3 items-stretch">
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder={isOwner ? "Enter name to invite…" : "Only owners can invite members"}
                  disabled={!isOwner}
                  className="flex-1 rounded-xl bg-black/25 text-white placeholder-white/45 border border-white/15 focus:outline-none px-4 py-2.5"
                />
                {isOwner && <ButtonFrame label="Invite" />}
              </form>
            </div>

            {/* Members list (owner Discord visible here only) */}
            <ul className="grid gap-2">
              {space.members.map((m) => {
                const isOwnerMember = ownerMember ? m.id === ownerMember.id : false;
                // We can only reliably show YOUR discord (pulled from Profile) if you're the owner member.
                const ownerDiscordDisplay =
                  isOwnerMember
                    ? (m.name === "You" ? (myDiscord ?? "—") : "—")
                    : undefined;

                return (
                  <li key={m.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2">
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="h-8 w-8 rounded-full bg-white/10 border border-white/10 grid place-items-center">
                        {m.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                      </span>
                      <span className="font-['Rajdhani']">{m.name}</span>
                      {m.role && <span className="text-white/70 text-sm">({m.role})</span>}
                      {isOwnerMember && (
                        <span className="text-white/70 text-sm"> · {ownerDiscordDisplay}</span>
                      )}
                    </div>
                    {isOwner && m.name !== "You" ? (
                      <ButtonGrad label="Kick" tone="pink" onClick={() => onKick(m.id)} />
                    ) : (
                      <span className="text-white/60 text-sm">{m.name === "You" ? "You" : ""}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <form onSubmit={saveDetails} className="mt-5 grid gap-5">
            {/* Editable if owner; disabled if member-only */}
            <label className="grid gap-1">
              <span className="text-white/70 text-sm">Title</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwner}
                className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-2.5 disabled:opacity-50"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-white/70 text-sm">Description</span>
              <textarea
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
                rows={4}
                disabled={!isOwner}
                className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-2.5 disabled:opacity-50"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="grid gap-1">
                <span className="text-white/70 text-sm">Due Date</span>
                <input
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  disabled={!isOwner}
                  className="rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-4 py-2.5 disabled:opacity-50"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-white/70 text-sm">Hours / Week: {hours}h</span>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  disabled={!isOwner}
                />
              </label>
              <div />
            </div>

            {/* Skills editor */}
            <div className={`rounded-xl border border-white/10 bg-white/[0.05] p-4 ${isOwner ? "" : "opacity-60"}`}>
              <div className="text-white/80 font-['Rajdhani'] mb-2">Required Skills</div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((s) => (
                    <span key={s.name} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-white/90">
                      <span>{s.name}</span>
                      <span className="text-white/70 text-sm">Lv{s.level}</span>
                      {isOwner && (
                        <button type="button" onClick={() => removeSkill(s.name)} className="text-white/60 hover:text-white" aria-label="Remove">
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}

              <form onSubmit={addSkill} className="grid grid-cols-1 md:grid-cols-[1fr_160px_auto] gap-3 items-end">
                <input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder={isOwner ? "Skill name (e.g., React)" : "View only"}
                  disabled={!isOwner}
                  className="rounded-xl bg-black/25 text-white placeholder-white/45 border border-white/15 focus:outline-none px-4 py-2.5"
                />
                <label className="grid gap-1">
                  <span className="text-white/70 text-sm">Level: Lv{newSkillLevel}</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(parseInt(e.target.value))}
                    disabled={!isOwner || !newSkillName.trim()}
                  />
                </label>
                {isOwner && (
                  <ButtonFrame label="Add Skill" />
                )}
              </form>
            </div>

            <div className="mt-1 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2 hover:bg-white/10">
                Close
              </button>
              {isOwner && (
                <button type="submit" className="relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-2.5 text-white">
                  <span className="relative z-[1]">Save</span>
                  <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.28),rgba(2,150,255,0.28))]" />
                  <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/80 border border-white/10" />
                </button>
              )}
            </div>
          </form>
        )}

        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator,
          input[type="date"]::-webkit-inner-spin-button { display: none; -webkit-appearance: none; }
          select { background-image: none; }
        `}</style>
      </div>
    </div>
  );
}

/* ---------- Small UI helpers ---------- */
function Tab({ like, active, onClick }: { like: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative rounded-lg px-3 py-1.5 font-['Rajdhani'] text-sm tracking-wide transition",
        "border border-white/10 bg-gradient-to-r from-[#141220] to-[#0a0a18] backdrop-blur-sm",
        active ? "text-white shadow-[0_0_22px_rgba(2,150,255,0.55)]" : "text-white/75 hover:text-cyan-300",
      ].join(" ")}
    >
      <span className="relative z-[1]">{like}</span>
      {active && (
        <span aria-hidden className="absolute inset-0 rounded-lg opacity-100 bg-gradient-to-r from-[#9d2dfc]/40 via-[#0296ff]/40 to-[#6a0dad]/40" />
      )}
    </button>
  );
}
