import { useEffect, useState } from 'react';
import { Logo } from '../common/Logo';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <button 
      onClick={toggleTheme}
      className="fixed bottom-6 left-6 z-[9999] w-12 h-12 rounded-full border-2 border-primary bg-surface shadow-brutal flex items-center justify-center hover:-translate-y-1 transition-transform"
      aria-label="Toggle theme"
    >
      <Logo className="w-6 h-6 object-contain" pathClassName="fill-primary" />
    </button>
  );
};
