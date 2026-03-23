import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

import { LoadingScreen } from './components/LoadingScreen'
import { AuthScreen } from './components/AuthScreen'
import { DashboardLayout } from './components/DashboardLayout'

import { apiRequest } from './utils/api'
import { canAccess } from './utils/auth'
import type {
  User,
  Team,
  Player,
  Hero,
  AuthForm,
  HeroPoolEntry,
  HeroPoolByPseudoResponse,
} from './utils/types'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('ow_token'))
  const [user, setUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState<AuthForm>({
    username: '',
    password: '',
    displayName: '',
  })

  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamElo, setNewTeamElo] = useState('1000')
  const [roleTargetId, setRoleTargetId] = useState('')
  const [newRole, setNewRole] = useState('joueur')
  const [successMessage, setSuccessMessage] = useState('')
  const [currentPage, setCurrentPage] = useState<'overview' | 'teams' | 'players' | 'heroes'>('overview')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedTeamPlayers, setSelectedTeamPlayers] = useState<Player[]>([])
  const [teamDetailsLoading, setTeamDetailsLoading] = useState(false)
  const [teamEditName, setTeamEditName] = useState('')
  const [teamEditElo, setTeamEditElo] = useState('1000')
  const [heroPoolEntries, setHeroPoolEntries] = useState<HeroPoolEntry[]>([])
  const [heroPoolOwner, setHeroPoolOwner] = useState('')
  const [heroPseudoInput, setHeroPseudoInput] = useState('')
  const [heroPoolLoading, setHeroPoolLoading] = useState(false)

  const canManageRoles = canAccess(user?.role, 'coach')
  const canCreateTeams = canAccess(user?.role, 'owner')
  const canManageTeams = canAccess(user?.role, 'admin')

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

    // Default hero pool is the connected account pool.
    const ownPool = await apiRequest<HeroPoolEntry[]>(
      `/tier-list/users/${me.id}/heroes`,
      'GET',
      undefined,
      jwtToken,
    )
    setHeroPoolEntries(Array.isArray(ownPool) ? ownPool : [])
    setHeroPoolOwner(me.displayName || me.username)
    setHeroPseudoInput('')
  }

  async function loadHeroPoolByPseudo(pseudo: string) {
    if (!token) {
      return
    }

    setHeroPoolLoading(true)
    setError('')

    try {
      const response = await apiRequest<HeroPoolByPseudoResponse>(
        `/tier-list/users/by-pseudo/${encodeURIComponent(pseudo)}/heroes`,
        'GET',
        undefined,
        token,
      )

      setHeroPoolEntries(Array.isArray(response.heroes) ? response.heroes : [])
      setHeroPoolOwner(response.displayName || response.username)
      setHeroPseudoInput(pseudo)
    } catch (poolError) {
      setError(poolError instanceof Error ? poolError.message : 'Pool introuvable')
    } finally {
      setHeroPoolLoading(false)
    }
  }

  async function handleHeroPoolSearch(event: FormEvent) {
    event.preventDefault()

    if (!heroPseudoInput.trim()) {
      if (token && user) {
        setHeroPoolLoading(true)
        try {
          const ownPool = await apiRequest<HeroPoolEntry[]>(
            `/tier-list/users/${user.id}/heroes`,
            'GET',
            undefined,
            token,
          )
          setHeroPoolEntries(Array.isArray(ownPool) ? ownPool : [])
          setHeroPoolOwner(user.displayName || user.username)
          setHeroPseudoInput('')
        } catch (poolError) {
          setError(poolError instanceof Error ? poolError.message : 'Pool introuvable')
        } finally {
          setHeroPoolLoading(false)
        }
      }
      return
    }

    await loadHeroPoolByPseudo(heroPseudoInput.trim())
  }

  async function handleOpenPlayerProfile(pseudo: string) {
    setCurrentPage('heroes')
    await loadHeroPoolByPseudo(pseudo)
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

  async function handleLoadTeamDetails(teamIdentifier: string) {
    if (!token) {
      return
    }

    setTeamDetailsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const [teamDetails, teamPlayers] = await Promise.all([
        apiRequest<Team>(`/teams/${encodeURIComponent(teamIdentifier)}`, 'GET', undefined, token),
        apiRequest<Player[]>(`/teams/${encodeURIComponent(teamIdentifier)}/players`, 'GET', undefined, token),
      ])

      setSelectedTeam(teamDetails)
      setSelectedTeamPlayers(Array.isArray(teamPlayers) ? teamPlayers : [])
      setTeamEditName(teamDetails.name)
      setTeamEditElo(String(teamDetails.elo ?? 1000))
    } catch (detailsError) {
      setError(detailsError instanceof Error ? detailsError.message : 'Impossible de charger la team')
    } finally {
      setTeamDetailsLoading(false)
    }
  }

  async function handleUpdateSelectedTeam(event: FormEvent) {
    event.preventDefault()

    if (!token || !selectedTeam) {
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      await apiRequest(
        `/teams/${selectedTeam.id}`,
        'PUT',
        {
          name: teamEditName,
          elo: Number(teamEditElo),
        },
        token,
      )

      await loadDashboard(token)
      await handleLoadTeamDetails(String(selectedTeam.id))
      setSuccessMessage('Team mise a jour.')
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Mise a jour impossible')
    }
  }

  async function handleDeleteTeam(teamIdentifier: string) {
    if (!token) {
      return
    }

    const confirmed = window.confirm('Supprimer cette team ? Cette action est irreversible.')
    if (!confirmed) {
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      await apiRequest(`/teams/${encodeURIComponent(teamIdentifier)}`, 'DELETE', undefined, token)
      await loadDashboard(token)

      if (selectedTeam && String(selectedTeam.id) === teamIdentifier) {
        setSelectedTeam(null)
        setSelectedTeamPlayers([])
      }

      setSuccessMessage('Team supprimee.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Suppression impossible')
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
    setHeroPoolEntries([])
    setHeroPoolOwner('')
    setHeroPseudoInput('')
    setSelectedTeam(null)
    setSelectedTeamPlayers([])
    setTeamEditName('')
    setTeamEditElo('1000')
    setSuccessMessage('')
    setCurrentPage('overview')
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!token || !user) {
    return (
      <AuthScreen
        authMode={authMode}
        onModeChange={setAuthMode}
        username={authForm.username}
        password={authForm.password}
        displayName={authForm.displayName}
        onUsernameChange={(value) => setAuthForm((prev) => ({ ...prev, username: value }))}
        onPasswordChange={(value) => setAuthForm((prev) => ({ ...prev, password: value }))}
        onDisplayNameChange={(value) => setAuthForm((prev) => ({ ...prev, displayName: value }))}
        onSubmit={handleAuthSubmit}
        error={error}
      />
    )
  }

  return (
    <DashboardLayout
      user={user}
      teams={teams}
      topTeams={topTeams}
      players={players}
      playerCount={players.length}
      playersWithTeam={playerDistribution.withTeam}
      playerRatio={playerDistribution.ratio}
      heroesCount={heroes.length}
      canCreateTeams={canCreateTeams}
      canManageTeams={canManageTeams}
      canManageRoles={canManageRoles}
      newTeamName={newTeamName}
      newTeamElo={newTeamElo}
      roleTargetId={roleTargetId}
      newRole={newRole}
      selectedTeam={selectedTeam}
      selectedTeamPlayers={selectedTeamPlayers}
      teamDetailsLoading={teamDetailsLoading}
      teamEditName={teamEditName}
      teamEditElo={teamEditElo}
      heroPoolOwner={heroPoolOwner || (user.displayName || user.username)}
      heroPseudoInput={heroPseudoInput}
      heroPoolLoading={heroPoolLoading}
      heroPoolEntries={heroPoolEntries}
      error={error}
      successMessage={successMessage}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={logout}
      onTeamNameChange={setNewTeamName}
      onTeamEloChange={setNewTeamElo}
      onCreateTeam={handleCreateTeam}
      onLoadTeamDetails={handleLoadTeamDetails}
      onTeamEditNameChange={setTeamEditName}
      onTeamEditEloChange={setTeamEditElo}
      onUpdateSelectedTeam={handleUpdateSelectedTeam}
      onDeleteTeam={handleDeleteTeam}
      onOpenPlayerProfile={handleOpenPlayerProfile}
      onHeroPseudoInputChange={setHeroPseudoInput}
      onSearchHeroPoolByPseudo={handleHeroPoolSearch}
      onTargetIdChange={setRoleTargetId}
      onRoleChange={setNewRole}
      onSetRole={handleSetRole}
    />
  )
}

export default App
