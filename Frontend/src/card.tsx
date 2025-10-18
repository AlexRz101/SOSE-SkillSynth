type Props = {
  skill: string;
  description: string;
  image: string;
  onClick?: () => void;
};

export default function Card({ skill, description, image, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-5 py-6 text-left transition hover:translate-y-[-2px] hover:border-white/25 hover:bg-white/15"
    >
      <div className="flex items-center gap-4">
        <img src={image} alt="" className="h-12 w-12 rounded-lg opacity-90" />
        <div>
          <h3 className="text-lg font-semibold tracking-wide">{skill}</h3>
          <p className="mt-1 text-sm text-white/80">{description}</p>
        </div>
      </div>

      {/* subtle glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute -inset-10 bg-gradient-to-r from-purple-500/10 via-cyan-400/10 to-blue-500/10 blur-2xl" />
      </div>
    </button>
  );
}
