import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type User = {
  id: number
  username: string
  displayName?: string | null
  role: string
}

type Team = {
  id: number
  name: string
  elo: number
}

type Player = {
  id: number
  pseudo: string
  role: string
  teamId?: number | null
}

type Hero = {
  id: number
  name: string
  role: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const ROLE_RANK: Record<string, number> = {
  owner: 6,
  admin: 6,
  ceo: 5,
  manager_pole_ow: 4,
  manager: 3,
  coach: 3,
  joueur: 1,
  user: 1,
  player: 1,
}

const ASSIGNABLE_ROLES = [
  'ceo',
  'manager_pole_ow',
  'manager',
  'coach',
  'joueur',
]

function normalizeRole(role: string | undefined) {
  if (!role) {
    return 'joueur'
  }

  return role.toLowerCase()
}

function roleLevel(role: string | undefined) {
  return ROLE_RANK[normalizeRole(role)] ?? 0
}

function canAccess(actorRole: string | undefined, minimumRole: string) {
  return roleLevel(actorRole) >= roleLevel(minimumRole)
}

async function apiRequest<T>(
  path: string,
  method: string,
  body?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.message ?? 'Erreur API'
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message))
  }

  return payload as T
}

function createInitials(name: string) {
  const words = name.trim().split(/\s+/)
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('ow_token'))
  const [user, setUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    displayName: '',
  })

  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamElo, setNewTeamElo] = useState('1000')
  const [roleTargetId, setRoleTargetId] = useState('')
  const [newRole, setNewRole] = useState('joueur')
  const [successMessage, setSuccessMessage] = useState('')

  const canManageRoles = canAccess(user?.role, 'coach')
  const canCreateTeams = canAccess(user?.role, 'owner')

  const topTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.elo - a.elo).slice(0, 2)
  }, [teams])

  const playerDistribution = useMemo(() => {
    const total = players.length || 1
    const withTeam = players.filter((player) => player.teamId).length
    const ratio = Math.round((withTeam / total) * 100)

    return {
      withTeam,
      ratio,
    }
  }, [players])

  async function loadDashboard(jwtToken: string) {
    const [me, teamList, playerList, heroList] = await Promise.all([
      apiRequest<User>('/auth/me', 'GET', undefined, jwtToken),
      apiRequest<Team[]>('/teams', 'GET', undefined, jwtToken),
      apiRequest<Player[]>('/players', 'GET', undefined, jwtToken),
      apiRequest<Hero[]>('/heroes', 'GET', undefined, jwtToken),
    ])

    setUser(me)
    setTeams(Array.isArray(teamList) ? teamList : [])
    setPlayers(Array.isArray(playerList) ? playerList : [])
    setHeroes(Array.isArray(heroList) ? heroList : [])
  }

  useEffect(() => {
    let active = true

    async function init() {
      if (!token) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        await loadDashboard(token)
      } catch (loadError) {
        if (!active) {
          return
        }

        localStorage.removeItem('ow_token')
        setToken(null)
        setUser(null)
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Session invalide, reconnecte-toi.',
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void init()

    return () => {
      active = false
    }
  }, [token])

  async function handleAuthSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    try {
      if (authMode === 'register') {
        await apiRequest<{ message: string }>('/auth/register', 'POST', {
          username: authForm.username,
          password: authForm.password,
          displayName: authForm.displayName || null,
        })
      }

      const loginResult = await apiRequest<{
        accessToken: string
        user: User
      }>('/auth/login', 'POST', {
        username: authForm.username,
        password: authForm.password,
      })

      localStorage.setItem('ow_token', loginResult.accessToken)
      setToken(loginResult.accessToken)
      setAuthForm({ username: '', password: '', displayName: '' })
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Auth impossible')
    }
  }

  async function handleCreateTeam(event: FormEvent) {
    event.preventDefault()

    if (!token) {
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      await apiRequest('/teams', 'POST', {
        name: newTeamName,
        elo: Number(newTeamElo),
      }, token)

      await loadDashboard(token)
      setNewTeamName('')
      setNewTeamElo('1000')
      setSuccessMessage('Team creee avec succes.')
    } catch (teamError) {
      setError(teamError instanceof Error ? teamError.message : 'Creation impossible')
    }
  }

  async function handleSetRole(event: FormEvent) {
    event.preventDefault()

    if (!token) {
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      await apiRequest(`/auth/users/${roleTargetId}/role`, 'PATCH', { role: newRole }, token)
      await loadDashboard(token)
      setRoleTargetId('')
      setSuccessMessage('Role mis a jour.')
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : 'Changement de role impossible')
    }
  }

  function logout() {
    localStorage.removeItem('ow_token')
    setToken(null)
    setUser(null)
    setTeams([])
    setPlayers([])
    setHeroes([])
    setSuccessMessage('')
  }

  if (loading) {
    return (
      <main className="boot-screen">
        <div className="boot-card">
          <div className="pulse-dot" />
          <p>Chargement du dashboard Overwatch...</p>
        </div>
      </main>
    )
  }

  if (!token || !user) {
    return (
      <main className="auth-layout">
        <section className="auth-panel">
          <p className="eyebrow">OW Esport Control</p>
          <h1>Pilotage des equipes et du roster</h1>
          <p className="muted">
            UI premium, logique metier complete, roles securises et connectes au backend.
          </p>

          <div className="auth-switch">
            <button
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Connexion
            </button>
            <button
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Inscription
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <label>
              Username
              <input
                value={authForm.username}
                onChange={(event) =>
                  setAuthForm((prev) => ({ ...prev, username: event.target.value }))
                }
                required
              />
            </label>

            {authMode === 'register' ? (
              <label>
                Display name
                <input
                  value={authForm.displayName}
                  onChange={(event) =>
                    setAuthForm((prev) => ({ ...prev, displayName: event.target.value }))
                  }
                />
              </label>
            ) : null}

            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm((prev) => ({ ...prev, password: event.target.value }))
                }
                required
              />
            </label>

            <button type="submit" className="primary-btn">
              {authMode === 'login' ? 'Entrer' : 'Creer et se connecter'}
            </button>
          </form>

          {error ? <p className="form-error">{error}</p> : null}
        </section>
      </main>
    )
  }

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-mark" />
        <nav>
          <button className="nav-item active">O</button>
          <button className="nav-item">T</button>
          <button className="nav-item">P</button>
          <button className="nav-item">H</button>
        </nav>
        <button className="nav-item bottom" onClick={logout}>
          X
        </button>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <input placeholder="Search teams, players, heroes" />
          <div className="topbar-user">
            <span className="role-pill">{normalizeRole(user.role)}</span>
            <div className="avatar-chip">{createInitials(user.displayName || user.username)}</div>
          </div>
        </header>

        <section className="hero-card">
          <div>
            <p className="eyebrow">Control Center</p>
            <h2>
              Salut {user.displayName || user.username},
              <br />
              ton hub OW est pret.
            </h2>
            <p className="muted">Visualise les equipes, gere les roles et lance des actions securisees.</p>
            {canCreateTeams ? (
              <form className="inline-form" onSubmit={handleCreateTeam}>
                <input
                  placeholder="Nom de team"
                  value={newTeamName}
                  onChange={(event) => setNewTeamName(event.target.value)}
                  required
                />
                <input
                  type="number"
                  min={1}
                  value={newTeamElo}
                  onChange={(event) => setNewTeamElo(event.target.value)}
                  required
                />
                <button type="submit" className="primary-btn">
                  Creer team
                </button>
              </form>
            ) : (
              <p className="hint">Creation de team reservee au role owner.</p>
            )}
          </div>
          <div className="hero-illustration" aria-hidden="true">
            <div className="ring ring-a" />
            <div className="ring ring-b" />
            <div className="orb" />
          </div>
        </section>

        <section className="metrics-grid">
          <article className="metric-card">
            <p>Teams</p>
            <h3>{teams.length}</h3>
            <span>Actives dans ton ecosysteme</span>
          </article>
          <article className="metric-card">
            <p>Players</p>
            <h3>{players.length}</h3>
            <span>{playerDistribution.withTeam} assignes a une team</span>
          </article>
          <article className="metric-card">
            <p>Hero pool</p>
            <h3>{heroes.length}</h3>
            <span>Meta monitor live</span>
          </article>
        </section>

        <section className="bottom-cards">
          <article className="content-card">
            <h4>Focus recrutement</h4>
            <p>Distribution joueurs avec team: {playerDistribution.ratio}%</p>
            <div className="progress-track">
              <div style={{ width: `${playerDistribution.ratio}%` }} />
            </div>
          </article>
          <article className="content-card">
            <h4>Roles du roster</h4>
            <ul>
              <li>Tank/DPS/Support sync via backend players</li>
              <li>RBAC hierarchique actif cote API</li>
              <li>Actions UI filtrees selon ton niveau</li>
            </ul>
          </article>
        </section>
      </section>

      <aside className="dashboard-right">
        <section className="calendar-card">
          <div className="calendar-head">
            <span>March 2026</span>
            <span>23</span>
          </div>
          <div className="calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <small key={day}>{day}</small>
            ))}
            {[21, 22, 23, 24, 25, 26, 27].map((date) => (
              <button key={date} className={date === 23 ? 'selected' : ''}>
                {date}
              </button>
            ))}
          </div>
        </section>

        <section className="list-card">
          <h4>Top teams by ELO</h4>
          {topTeams.map((team) => (
            <div key={team.id} className="list-item">
              <div>
                <p>{team.name}</p>
                <span>ELO {team.elo}</span>
              </div>
              <button>Open</button>
            </div>
          ))}
          {topTeams.length === 0 ? <p className="hint">Aucune team pour le moment.</p> : null}
        </section>

        <section className="list-card">
          <h4>Role control</h4>
          {canManageRoles ? (
            <form className="role-form" onSubmit={handleSetRole}>
              <input
                placeholder="User ID"
                type="number"
                min={1}
                value={roleTargetId}
                onChange={(event) => setRoleTargetId(event.target.value)}
                required
              />
              <select value={newRole} onChange={(event) => setNewRole(event.target.value)}>
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <button type="submit" className="primary-btn">
                Changer le role
              </button>
            </form>
          ) : (
            <p className="hint">Gestion des roles reservee a coach et plus.</p>
          )}
        </section>

        {error ? <p className="form-error right-msg">{error}</p> : null}
        {successMessage ? <p className="form-success right-msg">{successMessage}</p> : null}
      </aside>
    </main>
  )
}

export default App
