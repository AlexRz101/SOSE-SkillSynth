import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

type Status = "todo" | "inprogress" | "done";
type Priority = "Low" | "Medium" | "High";

type Project = {
  id: string;
  title: string;
  status: Status;
  due?: string;          // ISO "YYYY-MM-DD"
  priority?: Priority;   // Low | Medium | High
};

export default function Dashboard() {
  // Skills intentionally blank (filled via Profile later)
  const skills: Array<{ name: string; xp: number; level: number }> = useMemo(() => [], []);

  // Demo data (swap to store/API later)
  const [projects, setProjects] = useState<Project[]>([
    { id: "p1", title: "Portfolio Landing", status: "inprogress", due: "2025-11-02", priority: "Medium" },
    { id: "p2", title: "API Wrapper",       status: "todo",       due: "2025-11-15", priority: "High" },
    { id: "p3", title: "Unit Test Suite",   status: "done",       due: "2025-10-10", priority: "Low" },
  ]);

  const [tab, setTab] = useState<Status>("inprogress");

  // To-Do create
  const [newTitle, setNewTitle] = useState("");

  // Edit modal state
  const [editing, setEditing] = useState<Project | null>(null);

  // Undo delete state
  const [lastDeleted, setLastDeleted] = useState<Project | null>(null);
  const hideUndoTimer = useRef<number | null>(null);

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setProjects(prev => [{ id: crypto.randomUUID(), title, status: "todo", priority: "Medium" }, ...prev]);
    setNewTitle("");
  };

  const openEdit = (p: Project) => setEditing(p);
  const closeEdit = () => setEditing(null);

  const updateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    closeEdit();
  };

  const deleteProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    setLastDeleted(proj);
    if (hideUndoTimer.current) window.clearTimeout(hideUndoTimer.current);
    hideUndoTimer.current = window.setTimeout(() => setLastDeleted(null), 5000);
  };

  const undoDelete = () => {
    if (!lastDeleted) return;
    setProjects(prev => [lastDeleted, ...prev]);
    setLastDeleted(null);
    if (hideUndoTimer.current) window.clearTimeout(hideUndoTimer.current);
  };

  // Derived lists
  const filtered = {
    todo: projects.filter(p => p.status === "todo"),
    inprogress: projects.filter(p => p.status === "inprogress"),
    done: projects.filter(p => p.status === "done"),
  };

  return (
    <div className="space-y-10 overflow-visible">
      {/* Heading — avoid clipping */}
      <header className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] tracking-[0.25em] leading-tight
                       text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300
                       motion-safe:animate-[textGlow_4s_ease-in-out_infinite_alternate] break-words overflow-visible">
          My Dashboard
        </h1>
        <p className="text-white/70 font-['Rajdhani'] text-lg">
          Track your skill progress and manage your learning projects.
        </p>
      </header>

      {/* Skill Mastery — blank state */}
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

      {/* Projects */}
      <section className="space-y-4 overflow-visible">
        <h2 className="text-2xl md:text-3xl font-['Rajdhani'] text-white/95">My Projects</h2>

        {/* Tabs (recolored) */}
        <div className="flex items-center gap-2">
          <TabButton label="In Progress" active={tab === "inprogress"} onClick={() => setTab("inprogress")} />
          <TabButton label="To Do"       active={tab === "todo"}       onClick={() => setTab("todo")} />
          <TabButton label="Done"        active={tab === "done"}       onClick={() => setTab("done")} />
        </div>

        {/* Content per tab */}
        {tab === "inprogress" && (
          <Card>
            {filtered.inprogress.length ? (
              <List items={filtered.inprogress} onEdit={openEdit} onDelete={deleteProject} />
            ) : (
              <Empty text="No Projects In Progress" hint="Move a project from To Do when you start it." />
            )}
          </Card>
        )}

        {tab === "todo" && (
          <>
            <Card>
              {filtered.todo.length ? (
                <List items={filtered.todo} onEdit={openEdit} onDelete={deleteProject} />
              ) : (
                <Empty text="No To-Do Projects" hint="Add a project below to get started." />
              )}
            </Card>

            {/* Create Project (visible on To-Do) */}
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
              <form onSubmit={addProject} className="flex flex-col sm:flex-row gap-3">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="New project title…"
                  className="flex-1 rounded-xl bg-black/25 text-white placeholder-white/45
                             border border-white/15 focus:outline-none focus:ring-2
                             focus:ring-cyan-300/70 focus:border-cyan-300/70 px-4 py-3
                             font-['Rajdhani'] tracking-wide"
                />
                <button
                  type="submit"
                  className="relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-3
                             text-white font-['Orbitron'] uppercase tracking-wide"
                >
                  <span className="relative z-[1]">Create Project</span>
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
              </form>
            </div>
          </>
        )}

        {tab === "done" && (
          <Card>
            {filtered.done.length ? (
              <List items={filtered.done} onEdit={openEdit} onDelete={deleteProject} />
            ) : (
              <Empty text="Nothing Done Yet" hint="Finish a project to see it here." />
            )}
          </Card>
        )}
      </section>

      {/* Edit Modal */}
      {editing && <EditProjectModal project={editing} onCancel={closeEdit} onSave={updateProject} />}

      {/* Undo Toast */}
      {lastDeleted && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[120]">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/70 backdrop-blur-md px-4 py-3 text-white shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
            <span className="font-['Rajdhani']">Deleted “{lastDeleted.title}”.</span>
            <button
              onClick={undoDelete}
              className="relative inline-flex items-center justify-center overflow-hidden rounded-lg px-3 py-1.5 text-white font-['Rajdhani']"
            >
              <span className="relative z-[1]">Undo</span>
              <span
                aria-hidden
                className="absolute inset-0 rounded-lg opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.25),rgba(2,150,255,0.25))]"
              />
              <span aria-hidden className="absolute inset-[2px] rounded-[8px] bg-[#101010]/80 border border-white/10" />
            </button>
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

/* ---------- Pieces ---------- */

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative rounded-lg px-3 py-1.5 font-['Rajdhani'] text-sm tracking-wide transition",
        "border border-white/10 bg-gradient-to-r from-[#141220] to-[#0a0a18] backdrop-blur-sm",
        active ? "text-white shadow-[0_0_22px_rgba(2,150,255,0.55)]" : "text-white/75 hover:text-cyan-300",
      ].join(" ")}
    >
      <span className="relative z-[1]">{label}</span>
      {active && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-lg opacity-100 bg-gradient-to-r from-[#9d2dfc]/40 via-[#0296ff]/40 to-[#6a0dad]/40"
        />
      )}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-dashed border-white/15 bg-white/[0.04] backdrop-blur-md p-7 overflow-visible">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-40"
        style={{
          background: "linear-gradient(120deg, rgba(157,45,252,0.14), rgba(2,150,255,0.14))",
          filter: "blur(18px)",
          zIndex: -1,
        }}
      />
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

function List({
  items,
  onEdit,
  onDelete,
}: {
  items: Project[];
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ul className="grid gap-3">
      {items.map((p) => (
        <li
          key={p.id}
          className={`relative rounded-xl border border-white/10 backdrop-blur-md px-4 py-3 text-white/90 font-['Rajdhani']
                      tracking-wide flex items-center justify-between gap-3
                      ${
                        p.status === 'todo'
                          ? 'bg-gradient-to-r from-[#1b0a30]/80 to-[#210e3d]/80'
                          : p.status === 'inprogress'
                          ? 'bg-gradient-to-r from-[#041f3b]/80 to-[#07355a]/80'
                          : 'bg-gradient-to-r from-[#062b1f]/80 to-[#0a442f]/80'
                      }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate">{p.title}</span>
              {p.priority && <PriorityBadge value={p.priority} />}
            </div>
            {p.due && (
              <div className="text-white/70 text-sm mt-0.5">
                Due: {formatDate(p.due)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Edit (text button) */}
            <button
              aria-label="Edit project"
              onClick={() => onEdit(p)}
              className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition"
              title="Edit"
            >
              Edit
            </button>
            {/* Delete (text button) */}
            <button
              aria-label="Delete project"
              onClick={() => onDelete(p.id)}
              className="px-3 py-1.5 rounded-lg border border-pink-400/40 bg-pink-500/20 hover:bg-pink-500/35 text-pink-200 text-sm font-semibold transition"
              title="Delete"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* Priority badge — cleaned up sizing/contrast */
function PriorityBadge({ value }: { value: Priority }) {
  const tone =
    value === "High"
      ? "from-[#fb7185] to-[#db2777]" // red-pink
      : value === "Medium"
      ? "from-[#fcd34d] to-[#f59e0b]" // amber
      : "from-[#34d399] to-[#10b981]"; // green

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-[2px] text-[0.75rem] font-semibold
                  bg-gradient-to-r ${tone} text-black/90 shadow-[0_0_6px_rgba(0,0,0,0.15)]`}
      title="Priority"
    >
      {value}
    </span>
  );
}

/* Edit Modal (hide native calendar icon + fix Priority width) */
function EditProjectModal({
  project,
  onCancel,
  onSave,
}: {
  project: Project;
  onCancel: () => void;
  onSave: (p: Project) => void;
}) {
  const [title, setTitle] = useState(project.title);
  const [status, setStatus] = useState<Status>(project.status);
  const [due, setDue] = useState(project.due ?? "");
  const [priority, setPriority] = useState<Priority>(project.priority ?? "Medium");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...project, title: title.trim() || project.title, status, due: due || undefined, priority });
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      {/* dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e0e12]/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <h3 className="text-xl font-['Rajdhani'] text-white/95 mb-4">Edit Project</h3>
        <form onSubmit={submit} className="grid gap-5">
          <label className="grid gap-1">
            <span className="text-white/70 text-sm">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl bg-black/25 text-white placeholder-white/45 border border-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 px-3 py-2"
              placeholder="Project title"
            />
          </label>

          {/* responsive: stack on small, 2 cols on sm, 3 on lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status */}
            <label className="grid gap-1 min-w-0">
              <span className="text-white/70 text-sm">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-3 py-2 appearance-none pr-8"
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>

            {/* Due — native picker icon hidden by CSS below */}
            <label className="grid gap-1 min-w-0">
              <span className="text-white/70 text-sm">Due</span>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="w-36 rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-3 py-2 pr-3"
              />
            </label>

            {/* Priority — constrained so it never bleeds */}
            <label className="grid gap-1 min-w-0">
              <span className="text-white/70 text-sm">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full max-w-[220px] rounded-xl bg-black/25 text-white border border-white/15 focus:outline-none px-3 py-2 appearance-none pr-8"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-white/10 bg-white/5 text-white px-4 py-2 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="relative inline-flex items-center justify-center overflow-hidden rounded-xl px-5 py-2.5 text-white"
            >
              <span className="relative z-[1]">Save</span>
              <span aria-hidden className="absolute inset-0 rounded-xl opacity-90 [background:linear-gradient(45deg,rgba(157,45,252,0.25),rgba(2,150,255,0.25))]" />
              <span aria-hidden className="absolute inset-[2px] rounded-[10px] bg-[#101010]/80 border border-white/10" />
            </button>
          </div>
        </form>

        {/* Hide native calendar icon (WebKit) + remove default chevrons */}
        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator,
          input[type="date"]::-webkit-inner-spin-button {
            display: none;
            -webkit-appearance: none;
          }
          /* Remove default dropdown arrow so our padding works cleanly */
          select {
            background-image: none;
          }
        `}</style>
      </div>
    </div>
  );
}

/* helpers */
function formatDate(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}
