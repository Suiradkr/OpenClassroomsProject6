import { useState } from 'react'

// Top bar: search on the left, current user + logout menu on the right.
export default function TopBar({ search, onSearchChange, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Show a friendly name like "Xkaeqmom X." from the username.
  const displayName = user
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
    : ''
  const initial = user ? user.username.charAt(0).toUpperCase() : '?'

  return (
    <header className="topbar">
      <div className="topbar-search">
        <span className="search-icon">⌕</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="topbar-user">
        <button className="user-button" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="user-name">
            {displayName}
            {user && user.role === 'admin' && (
              <span className="role-badge">admin</span>
            )}
          </span>
          <span className="user-avatar">{initial}</span>
          <span className="chevron">▾</span>
        </button>
        {menuOpen && (
          <div className="user-menu">
            <button className="user-menu-item" onClick={onLogout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
