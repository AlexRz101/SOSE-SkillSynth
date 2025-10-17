
function Header() {
    return(
        <>
            <header className="absolute top-0 left-0 w-full flex flex-col items-center pt-8 gap-6">
            <h1 className="text-4xl font-mono">Skill Synth</h1>
            <img src="/ssLogo.svg" alt="Logo" className="w-40 h-40" />
            <p className="text-base md:text-2xl lg:text-2xl">Choose a skill and Generate curriculumns and projects</p>
            <p className="text-base md:text-2xl lg:text-2xl">tied to your experience and level. Progress, learn and level up</p>
            <p className="text-base md:text-2xl lg:text-2xl">to get ready for interviews, internships and jobs.</p>
            </header>
        </>
    );
}

export default Header;