type SidebarProps = {
  currentPage: 'overview' | 'teams' | 'players' | 'heroes' | 'maps' | 'faceit'
  onPageChange: (page: 'overview' | 'teams' | 'players' | 'heroes' | 'maps' | 'faceit') => void
  onLogout: () => void
}

export function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-mark" />
      <nav>
        <button
          className={`nav-item ${currentPage === 'overview' ? 'active' : ''}`}
          onClick={() => onPageChange('overview')}
          title="Overview"
        >
          O
        </button>
        <button
          className={`nav-item ${currentPage === 'teams' ? 'active' : ''}`}
          onClick={() => onPageChange('teams')}
          title="Teams"
        >
          T
        </button>
        <button
          className={`nav-item ${currentPage === 'players' ? 'active' : ''}`}
          onClick={() => onPageChange('players')}
          title="Players"
        >
          P
        </button>
        <button
          className={`nav-item ${currentPage === 'heroes' ? 'active' : ''}`}
          onClick={() => onPageChange('heroes')}
          title="Heroes"
        >
          H
        </button>
        <button
          className={`nav-item ${currentPage === 'maps' ? 'active' : ''}`}
          onClick={() => onPageChange('maps')}
          title="Maps"
        >
          M
        </button>
        <button
          className={`nav-item ${currentPage === 'faceit' ? 'active' : ''}`}
          onClick={() => onPageChange('faceit')}
          title="Faceit"
        >
          F
        </button>
      </nav>
      <button className="nav-item bottom" onClick={onLogout} title="Logout">
        X
      </button>
    </aside>
  )
}
