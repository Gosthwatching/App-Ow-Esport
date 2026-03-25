import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import './NewTabs.css'

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
  MapPoolEntry,
  MapPoolByPseudoResponse,
  TeamFaceitMapStatsResponse,
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
    faceitNickname: '',
  })

  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamElo, setNewTeamElo] = useState('1000')
  const [successMessage, setSuccessMessage] = useState('')
  const [currentPage, setCurrentPage] = useState<'overview' | 'teams' | 'players' | 'heroes' | 'maps' | 'faceit' | 'planning' | 'training' | 'absence' | 'vods'>('overview')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedTeamPlayers, setSelectedTeamPlayers] = useState<Player[]>([])
  const [teamDetailsLoading, setTeamDetailsLoading] = useState(false)
  const [teamEditName, setTeamEditName] = useState('')
  const [teamEditElo, setTeamEditElo] = useState('1000')
  const [fillNames, setFillNames] = useState('')
  const [fillRole, setFillRole] = useState('DPS')
  const [fillRank, setFillRank] = useState('Gold')
  const [heroPoolEntries, setHeroPoolEntries] = useState<HeroPoolEntry[]>([])
  const [heroPoolOwner, setHeroPoolOwner] = useState('')
  const [heroPseudoInput, setHeroPseudoInput] = useState('')
  const [heroPoolLoading, setHeroPoolLoading] = useState(false)
  const [faceitSelectedTeamId, setFaceitSelectedTeamId] = useState('')
  const [faceitMapFilter, setFaceitMapFilter] = useState('')
  const [faceitLimit, setFaceitLimit] = useState('20')
  const [faceitLoading, setFaceitLoading] = useState(false)
  const [faceitMapStats, setFaceitMapStats] = useState<TeamFaceitMapStatsResponse['mapStats']>([])

  const [mapPoolEntries, setMapPoolEntries] = useState<MapPoolEntry[]>([])
  const [mapPoolOwner, setMapPoolOwner] = useState('')
  const [mapPseudoInput, setMapPseudoInput] = useState('')
  const [mapPoolLoading, setMapPoolLoading] = useState(false)

  const canCreateTeams = canAccess(user?.role, 'owner')
  const canManageTeams = canAccess(user?.role, 'admin')
  const canFillTeams = canAccess(user?.role, 'coach')

  // Find the player profile linked to the logged-in user
  const myPlayer = players.find(
    (p) => (p.userId ?? p.user_id) === user?.id,
  )
  const myPlayerRole = myPlayer?.role ?? null

  // Is the displayed hero pool the logged-in user's own pool?
  const isOwnPool =
    !heroPseudoInput.trim() ||
    heroPseudoInput.trim().toLowerCase() === (user?.displayName ?? user?.username ?? '').toLowerCase()

  // Is the displayed map pool the logged-in user's own pool?
  const isOwnMapPool =
    !mapPseudoInput.trim() ||
    mapPseudoInput.trim().toLowerCase() === (user?.displayName ?? user?.username ?? '').toLowerCase()

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

    if (!faceitSelectedTeamId && Array.isArray(teamList) && teamList.length > 0) {
      setFaceitSelectedTeamId(String(teamList[0].id))
    }

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
    // Default map pool is the connected account pool.
    const ownMapPool = await apiRequest<MapPoolEntry[]>(
      `/tier-list/users/${me.id}/maps`,
      'GET',
      undefined,
      jwtToken,
    )
    setMapPoolEntries(Array.isArray(ownMapPool) ? ownMapPool : [])
    setMapPoolOwner(me.displayName || me.username)
    setMapPseudoInput('')
  }

  async function handleSetHeroTier(heroId: number, tier: string) {
    if (!token || !user) return
    await apiRequest(
      `/tier-list/users/${user.id}/heroes/${heroId}`,
      'PUT',
      { tier },
      token,
    )
    // Refresh the hero pool entries
    const updated = await apiRequest<HeroPoolEntry[]>(
      `/tier-list/users/${user.id}/heroes`,
      'GET',
      undefined,
      token,
    )
    setHeroPoolEntries(Array.isArray(updated) ? updated : [])
  }

  async function handleRemoveHeroTier(heroId: number) {
    if (!token || !user) return
    await apiRequest(
      `/tier-list/users/${user.id}/heroes/${heroId}`,
      'DELETE',
      undefined,
      token,
    )
    const updated = await apiRequest<HeroPoolEntry[]>(
      `/tier-list/users/${user.id}/heroes`,
      'GET',
      undefined,
      token,
    )
    setHeroPoolEntries(Array.isArray(updated) ? updated : [])
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

  async function loadMapPoolByPseudo(pseudo: string) {
    if (!token) {
      return
    }

    setMapPoolLoading(true)
    setError('')

    try {
      const response = await apiRequest<MapPoolByPseudoResponse>(
        `/tier-list/users/by-pseudo/${encodeURIComponent(pseudo)}/maps`,
        'GET',
        undefined,
        token,
      )

      setMapPoolEntries(Array.isArray(response.maps) ? response.maps : [])
      setMapPoolOwner(response.displayName || response.username)
      setMapPseudoInput(pseudo)
    } catch (poolError) {
      setError(poolError instanceof Error ? poolError.message : 'Map pool introuvable')
    } finally {
      setMapPoolLoading(false)
    }
  }

  async function handleMapPoolSearch(event: FormEvent) {
    event.preventDefault()

    if (!mapPseudoInput.trim()) {
      if (token && user) {
        setMapPoolLoading(true)
        try {
          const ownMapPool = await apiRequest<MapPoolEntry[]>(
            `/tier-list/users/${user.id}/maps`,
            'GET',
            undefined,
            token,
          )
          setMapPoolEntries(Array.isArray(ownMapPool) ? ownMapPool : [])
          setMapPoolOwner(user.displayName || user.username)
          setMapPseudoInput('')
        } catch (poolError) {
          setError(poolError instanceof Error ? poolError.message : 'Map pool introuvable')
        } finally {
          setMapPoolLoading(false)
        }
      }
      return
    }

    await loadMapPoolByPseudo(mapPseudoInput.trim())
  }

  async function handleOpenPlayerProfile(pseudo: string) {
    setCurrentPage('heroes')
    await loadHeroPoolByPseudo(pseudo)
  }

  async function handleToggleMapPool(mapId: number, currentlyInPool: boolean) {
    if (!token || !user) return

    await apiRequest(
      `/tier-list/users/${user.id}/maps/${mapId}`,
      currentlyInPool ? 'DELETE' : 'PUT',
      undefined,
      token,
    )

    const updated = await apiRequest<MapPoolEntry[]>(
      `/tier-list/users/${user.id}/maps`,
      'GET',
      undefined,
      token,
    )
    setMapPoolEntries(Array.isArray(updated) ? updated : [])
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
          faceitNickname: authForm.faceitNickname || null,
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
      setAuthForm({ username: '', password: '', displayName: '', faceitNickname: '' })
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
      setFaceitSelectedTeamId(String(teamDetails.id))
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

  async function handleFillSelectedTeam(event: FormEvent) {
    event.preventDefault()

    if (!token || !selectedTeam) {
      return
    }

    const names = fillNames
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)

    if (names.length === 0) {
      setError('Ajoute au moins un pseudo joueur.')
      return
    }

    setError('')
    setSuccessMessage('')

    try {
      await apiRequest(
        `/teams/${selectedTeam.id}/fill`,
        'POST',
        {
          names,
          role: fillRole,
          rank: fillRank,
        },
        token,
      )

      await loadDashboard(token)
      await handleLoadTeamDetails(String(selectedTeam.id))
      setFillNames('')
      setSuccessMessage('Roster mis a jour avec succes.')
    } catch (fillError) {
      setError(fillError instanceof Error ? fillError.message : 'Impossible de remplir la team')
    }
  }

  async function handleLoadFaceitTeamStats(event: FormEvent) {
    event.preventDefault()

    if (!token) {
      return
    }

    if (!faceitSelectedTeamId) {
      setError('Selectionne une team pour charger les stats FACEIT.')
      return
    }

    setFaceitLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const query = new URLSearchParams({ limit: faceitLimit || '20' })
      if (faceitMapFilter.trim()) {
        query.set('map', faceitMapFilter.trim())
      }

      const response = await apiRequest<TeamFaceitMapStatsResponse>(
        `/faceit/teams/${encodeURIComponent(faceitSelectedTeamId)}/map-stats?${query.toString()}`,
        'GET',
        undefined,
        token,
      )

      setFaceitMapStats(Array.isArray(response.mapStats) ? response.mapStats : [])
      setSuccessMessage(`Stats FACEIT chargees pour ${response.team.name}.`)
      setCurrentPage('faceit')
    } catch (faceitError) {
      setFaceitMapStats([])
      setError(faceitError instanceof Error ? faceitError.message : 'Chargement FACEIT impossible')
    } finally {
      setFaceitLoading(false)
    }
  }

  useEffect(() => {
    if (!token || currentPage !== 'faceit' || !faceitSelectedTeamId) {
      return
    }

    setFaceitLoading(true)
    setError('')

    const query = new URLSearchParams({ limit: faceitLimit || '20' })
    if (faceitMapFilter.trim()) {
      query.set('map', faceitMapFilter.trim())
    }

    apiRequest<TeamFaceitMapStatsResponse>(
      `/faceit/teams/${encodeURIComponent(faceitSelectedTeamId)}/map-stats?${query.toString()}`,
      'GET',
      undefined,
      token,
    )
      .then((response) => {
        setFaceitMapStats(Array.isArray(response.mapStats) ? response.mapStats : [])
      })
      .catch((faceitError) => {
        setFaceitMapStats([])
        setError(faceitError instanceof Error ? faceitError.message : 'Chargement FACEIT impossible')
      })
      .finally(() => {
        setFaceitLoading(false)
      })
  }, [currentPage, faceitSelectedTeamId, faceitMapFilter, faceitLimit, token])

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
    setMapPoolEntries([])
    setMapPoolOwner('')
    setMapPseudoInput('')
    setSelectedTeam(null)
    setSelectedTeamPlayers([])
    setTeamEditName('')
    setTeamEditElo('1000')
    setFillNames('')
    setFillRole('DPS')
    setFillRank('Gold')
    setFaceitSelectedTeamId('')
    setFaceitMapFilter('')
    setFaceitLimit('20')
    setFaceitMapStats([])
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
        faceitNickname={authForm.faceitNickname}
        onUsernameChange={(value) => setAuthForm((prev) => ({ ...prev, username: value }))}
        onPasswordChange={(value) => setAuthForm((prev) => ({ ...prev, password: value }))}
        onDisplayNameChange={(value) => setAuthForm((prev) => ({ ...prev, displayName: value }))}
        onFaceitNicknameChange={(value) => setAuthForm((prev) => ({ ...prev, faceitNickname: value }))}
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
      canFillTeams={canFillTeams}
      newTeamName={newTeamName}
      newTeamElo={newTeamElo}
      selectedTeam={selectedTeam}
      selectedTeamPlayers={selectedTeamPlayers}
      teamDetailsLoading={teamDetailsLoading}
      teamEditName={teamEditName}
      teamEditElo={teamEditElo}
      fillNames={fillNames}
      fillRole={fillRole}
      fillRank={fillRank}
      heroPoolOwner={heroPoolOwner || (user.displayName || user.username)}
      heroPseudoInput={heroPseudoInput}
      heroPoolLoading={heroPoolLoading}
      heroPoolEntries={heroPoolEntries}
      isOwnPool={isOwnPool}
      mapPoolOwner={mapPoolOwner || (user.displayName || user.username)}
      mapPseudoInput={mapPseudoInput}
      mapPoolLoading={mapPoolLoading}
      mapPoolEntries={mapPoolEntries}
      isOwnMapPool={isOwnMapPool}
      myPlayerRole={myPlayerRole}
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
      onFillNamesChange={setFillNames}
      onFillRoleChange={setFillRole}
      onFillRankChange={setFillRank}
      onUpdateSelectedTeam={handleUpdateSelectedTeam}
      onFillSelectedTeam={handleFillSelectedTeam}
      onDeleteTeam={handleDeleteTeam}
      onOpenPlayerProfile={handleOpenPlayerProfile}
      onHeroPseudoInputChange={setHeroPseudoInput}
      onSearchHeroPoolByPseudo={handleHeroPoolSearch}
      onSetTier={handleSetHeroTier}
      onRemoveTier={handleRemoveHeroTier}
      onMapPseudoInputChange={setMapPseudoInput}
      onSearchMapPoolByPseudo={handleMapPoolSearch}
      onToggleMapPool={handleToggleMapPool}
      faceitSelectedTeamId={faceitSelectedTeamId}
      faceitMapFilter={faceitMapFilter}
      faceitLimit={faceitLimit}
      faceitLoading={faceitLoading}
      faceitMapStats={faceitMapStats}
      onFaceitTeamChange={setFaceitSelectedTeamId}
      onFaceitMapFilterChange={setFaceitMapFilter}
      onFaceitLimitChange={setFaceitLimit}
      onLoadFaceitStats={handleLoadFaceitTeamStats}
      token={token}
    />
  )
}

export default App
