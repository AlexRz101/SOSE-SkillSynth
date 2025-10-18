import { useNavigate } from 'react-router-dom';

export default function SignIn() {
  const navigate = useNavigate();

  return (
    <div className="m-auto h-screen flex flex-col items-center justify-center">
      {/* Logo — fast, smooth 360 on load */}
      <img
        src="/ssLogo.svg"
        alt="Skill Synth Logo"
        className="mb-12 w-32 h-32 md:w-40 md:h-40 animate-logo-fast drop-shadow-[0_0_28px_rgba(0,200,255,0.35)]"
      />
      
      <h2 className="mb-10 text-6xl font-['Rajdhani']">Sign In</h2>
      {/* Example sign in form */}
      <input type="text" placeholder="Username" className="mb-4 p-2 rounded border-2 border-black p-2 font-['Rajdhani'] w-80" />
      <input type="password" placeholder="Password" className="mb-4 p-2 rounded border-2 border-black p-2 font-['Rajdhani'] w-80" />
      <input type="skill" placeholder="React, Java, Python, e.g." className="mb-4 p-2 rounded border-2 border-black p-2 font-['Rajdhani'] w-80" />
      <input type="experience" placeholder="Beginner, Intermediate or Advanced" className="mb-8 p-2 rounded border-2 border-black p-2 font-['Rajdhani'] w-80" />

      {/* Enter button */}
      <button
        className="px-6 py-3 rounded-lg bg-blue-800 text-white font-bold"
        onClick={() => navigate('/main')} 
      >
        Enter
      </button>
    </div>
  );
}
