import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={theme === 'light' ? t.darkMode : t.lightMode}
      title={theme === 'light' ? t.darkMode : t.lightMode}
    >
      {theme === 'light' ? (
        <Moon className="theme-toggle-icon" />
      ) : (
        <Sun className="theme-toggle-icon" />
      )}
    </button>
  );
};

export default ThemeToggle;
