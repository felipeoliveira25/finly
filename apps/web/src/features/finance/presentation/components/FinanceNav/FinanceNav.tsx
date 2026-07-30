import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/routes'

export function FinanceNav() {
  const baseClass = 'flex flex-col items-center gap-1 py-2 px-4 text-xs transition-colors'
  const activeClass = 'text-accent'
  const inactiveClass = 'text-text-secondary'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around z-10">
      <NavLink
        to={ROUTES.FINANCE}
        end
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        {/* Pie chart icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
          <path d="M22 12A10 10 0 0 0 12 2v10z"/>
        </svg>
        Resumo
      </NavLink>

      <NavLink
        to={ROUTES.FINANCE_TRANSACTIONS}
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        {/* List icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        Lançamentos
      </NavLink>

      <NavLink
        to={ROUTES.FINANCE_SETTINGS}
        className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}
      >
        {/* Settings gear icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        Config
      </NavLink>
    </nav>
  )
}
