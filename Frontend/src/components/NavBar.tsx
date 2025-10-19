import React from 'react';

export default function NavBar() {
  return (
    <nav className="w-auto h-25 bg-gray-900 text-white flex items-center px-6">
        <a href="/" className="text-3xl font-bold">Skill Synth</a>
        <ul className="ml-10 flex gap-6">
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/projects">Projects</a></li>
            <li><a href="/learn">Learn</a></li>
        </ul>
</nav>
  );
}
