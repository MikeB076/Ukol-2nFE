import { NavLink } from "./NavLink";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-container">
        <NavLink to="/lists" className="header-logo">
          <span className="logo-icon" aria-hidden="true">🛒</span>
          <span className="app-title">Shopping Lists</span>
        </NavLink>

        <div className="header-actions">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
