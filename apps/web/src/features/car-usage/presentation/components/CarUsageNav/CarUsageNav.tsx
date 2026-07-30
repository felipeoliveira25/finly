import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

export function CarUsageNav() {
  const baseClass = 'flex flex-col items-center gap-1 py-2 px-4 text-xs transition-colors'
  const activeClass = 'text-accent'
  const inactiveClass = 'text-text-secondary'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around z-10">
      <NavLink
        to={ROUTES.CAR_USAGE}
        end
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        {/* Car icon SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2"/>
          <path d="M16 8h4l3 5v3h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
        Registro
      </NavLink>

      <NavLink
        to={ROUTES.CAR_USAGE_SETTINGS}
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        {/* Settings icon SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        Config
      </NavLink>

      <NavLink
        to={ROUTES.CAR_USAGE_REPORT}
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        {/* Chart icon SVG */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
          <line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
        Relatório
      </NavLink>
    </nav>
  )
}
