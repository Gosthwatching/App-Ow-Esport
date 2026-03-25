import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { Scrim, CoachingSession, Team, User, Player } from '../utils/types'
import { apiRequest } from '../utils/api'

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

type AvailableMap = {
  id: number
  name: string
  type: string
}

interface PlanningViewProps {
  token: string
  user: User | null
  players: Player[]
  teams: Team[]
}

export function PlanningView({ token, user, players, teams }: PlanningViewProps) {
  const [scrims, setScrims] = useState<Scrim[]>([])
  const [sessions, setSessions] = useState<CoachingSession[]>([])
  const [availableMaps, setAvailableMaps] = useState<AvailableMap[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'scrims' | 'coaching'>('scrims')

  // Scrim form state
  const [scrimForm, setScrimForm] = useState({
    team1_id: '',
    team2_id: '',
    opponentTeamId: '',
    scheduled_at: '',
  })
  const [scrimQuick, setScrimQuick] = useState({
    opponentTeamName: '',
    opponentRoster: '',
    language: 'EN' as 'FR' | 'EN',
    lobbyCreation: 'us' as 'them' | 'us',
    twoHourBlock: true,
    stagger: true,
    ban: true,
    mapPoolType: 'faceit' as 'faceit' | 'afo' | 'custom',
    mapPool: 'Faceit Map Pool',
    customMaps: [] as string[],
    sessionSlot: '20-22',
    selectedDate: toDateInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  })

  // Coaching session form state
  const [coachingForm, setCoachingForm] = useState({
    teamId: '',
    topic: '',
    scheduledAt: '',
    duration: '60',
  })

  useEffect(() => {
    loadPlanningData()
    loadAvailableMaps()
  }, [token])

  async function loadPlanningData() {
    if (!token) return
    setLoading(true)
    try {
      const scrimData = await apiRequest<Scrim[]>('/scrims', 'GET', undefined, token)
      setScrims(Array.isArray(scrimData) ? scrimData : [])

      const coachingData = await apiRequest<CoachingSession[]>(
        '/coaching-sessions',
        'GET',
        undefined,
        token
      ).catch(() => [])
      setSessions(Array.isArray(coachingData) ? coachingData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  async function loadAvailableMaps() {
    if (!token) return

    try {
      const data = await apiRequest<AvailableMap[]>('/maps', 'GET', undefined, token).catch(() => [])
      setAvailableMaps(Array.isArray(data) ? data : [])
    } catch {
      setAvailableMaps([])
    }
  }

  async function handleCreateScrim(e: FormEvent) {
    e.preventDefault()

    const myPlayer = players.find((p) => (p.userId ?? p.user_id) === user?.id)
    const myTeamId = myPlayer?.teamId ?? myPlayer?.team_id ?? null
    const isManagerOrCoach = user?.role === 'manager' || user?.role === 'coach'
    const singleTeamMode = Boolean(isManagerOrCoach && myTeamId)

    if (!token) return

    if (singleTeamMode && !scrimQuick.opponentTeamName.trim()) return
    if (singleTeamMode && scrimQuick.mapPoolType === 'custom' && scrimQuick.customMaps.length === 0) {
      setError('Choisis au moins une map pour le map pool custom')
      return
    }
    if (!singleTeamMode && (!scrimForm.team1_id || !scrimForm.team2_id)) return

    try {
      setError('')
      const slotStartHour = Number(scrimQuick.sessionSlot.split('-')[0])
      const baseDate = scrimQuick.selectedDate ? new Date(`${scrimQuick.selectedDate}T00:00:00`) : new Date()
      baseDate.setHours(Number.isNaN(slotStartHour) ? 20 : slotStartHour, 0, 0, 0)

      const scheduledAt = scrimForm.scheduled_at || baseDate.toISOString()
      const body = singleTeamMode
        ? {
            opponentTeamName: scrimQuick.opponentTeamName.trim(),
            opponentRoster: scrimQuick.opponentRoster.trim() || undefined,
            scheduledAt,
            format: 'BO5',
            details: {
              opponentTeamName: scrimQuick.opponentTeamName.trim(),
              opponentRoster: scrimQuick.opponentRoster.trim() || undefined,
              language: scrimQuick.language,
              lobbyCreation: scrimQuick.lobbyCreation,
              twoHourBlock: scrimQuick.twoHourBlock,
              stagger: scrimQuick.stagger,
              ban: scrimQuick.ban,
              mapPool: scrimQuick.mapPool,
              mapPoolType: scrimQuick.mapPoolType,
              customMaps: scrimQuick.mapPoolType === 'custom' ? scrimQuick.customMaps : undefined,
              sessionSlot: scrimQuick.sessionSlot,
            },
          }
        : {
            team1Id: parseInt(scrimForm.team1_id),
            team2Id: parseInt(scrimForm.team2_id),
            scheduledAt,
            format: 'BO5',
          }

      await apiRequest('/scrims', 'POST', body, token)
      setScrimForm({ team1_id: '', team2_id: '', opponentTeamId: '', scheduled_at: '' })
      setScrimQuick((prev) => ({
        ...prev,
        opponentTeamName: '',
        opponentRoster: '',
        customMaps: prev.mapPoolType === 'custom' ? [] : prev.customMaps,
      }))
      await loadPlanningData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur création scrim')
    }
  }

  async function handleCreateCoachingSession(e: FormEvent) {
    e.preventDefault()
    if (!token || !coachingForm.teamId || !coachingForm.topic) return

    const coachId = user?.id
    if (!coachId) {
      setError('Utilisateur non identifié')
      return
    }

    try {
      const body = {
        teamId: parseInt(coachingForm.teamId),
        coachId,
        topic: coachingForm.topic,
        scheduledAt: coachingForm.scheduledAt,
        duration: parseInt(coachingForm.duration),
      }
      await apiRequest('/coaching-sessions', 'POST', body, token)
      setCoachingForm({ teamId: '', topic: '', scheduledAt: '', duration: '60' })
      await loadPlanningData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur création session')
    }
  }

  async function handleDeleteScrim(scrimId: number) {
    if (!token || !confirm('Confirmer la suppression du scrim?')) return

    try {
      await apiRequest(`/scrims/${scrimId}`, 'DELETE', undefined, token)
      await loadPlanningData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression scrim')
    }
  }

  async function handleDeleteCoachingSession(sessionId: number) {
    if (!token || !confirm('Confirmer la suppression de la session de coaching?')) return

    try {
      await apiRequest(`/coaching-sessions/${sessionId}`, 'DELETE', undefined, token)
      await loadPlanningData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression session')
    }
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('fr-FR')
  }

  const identityCandidates = [
    user?.username,
    user?.displayName,
    user?.faceitNickname,
  ]
    .filter((v): v is string => Boolean(v && v.trim()))
    .map((v) => v.trim().toLowerCase())

  const myPlayer = players.find((p) => {
    const byUserId = (p.userId ?? p.user_id) === user?.id
    const pseudo = p.pseudo?.trim().toLowerCase()
    const byPseudo = pseudo ? identityCandidates.includes(pseudo) : false
    return byUserId || byPseudo
  })

  const myTeamId = myPlayer?.teamId ?? myPlayer?.team_id ?? null
  const isManagerOrCoach = user?.role === 'manager' || user?.role === 'coach'
  const singleTeamMode = Boolean(isManagerOrCoach)
  const myTeamName = teams.find((t) => t.id === myTeamId)?.name ?? 'Mon équipe'

  const slotOptions = ['20-22', '21-23', '19-21']
  const mapPoolOptions = [
    { id: 'faceit', label: 'Faceit Map Pool', value: 'Faceit Map Pool' },
    { id: 'afo', label: 'AFO Map Pool', value: 'AFO Map Pool' },
    { id: 'custom', label: 'Custom', value: 'Custom' },
  ] as const

  function toggleCustomMap(mapName: string) {
    setScrimQuick((prev) => ({
      ...prev,
      customMaps: prev.customMaps.includes(mapName)
        ? prev.customMaps.filter((name) => name !== mapName)
        : [...prev.customMaps, mapName],
    }))
  }

  function getMapPoolSummary(scrim: Scrim) {
    if (scrim.details?.mapPoolType === 'custom' && scrim.details.customMaps?.length) {
      return `Custom: ${scrim.details.customMaps.join(', ')}`
    }

    return scrim.details?.mapPool ?? 'Faceit Map Pool'
  }

  return (
    <div className="planning-view">
      <div className="planning-tabs">
        <button
          className={`tab-btn ${activeTab === 'scrims' ? 'active' : ''}`}
          onClick={() => setActiveTab('scrims')}
        >
          📅 Scrims
        </button>
        <button
          className={`tab-btn ${activeTab === 'coaching' ? 'active' : ''}`}
          onClick={() => setActiveTab('coaching')}
        >
          🎓 Sessions Coaching
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'scrims' && (
        <div className="planning-section">
          <h3>Créer un Scrim</h3>
          <form onSubmit={handleCreateScrim} className="form-group">
            <div className="form-row">
              {singleTeamMode ? (
                <>
                  <input type="text" value={myTeamName} disabled />
                  <input
                    type="text"
                    placeholder="Nom de l'équipe adverse"
                    value={scrimQuick.opponentTeamName}
                    onChange={(e) => setScrimQuick({ ...scrimQuick, opponentTeamName: e.target.value })}
                    required
                  />
                </>
              ) : (
                <>
                  <select
                    value={scrimForm.team1_id}
                    onChange={(e) => setScrimForm({ ...scrimForm, team1_id: e.target.value })}
                    required
                  >
                    <option value="">Équipe 1</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={scrimForm.team2_id}
                    onChange={(e) => setScrimForm({ ...scrimForm, team2_id: e.target.value })}
                    required
                  >
                    <option value="">Équipe 2</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {singleTeamMode && (
                <textarea
                  placeholder="Roster adverse (ex: Tank: ..., DPS: ..., Support: ...)"
                  value={scrimQuick.opponentRoster}
                  onChange={(e) => setScrimQuick({ ...scrimQuick, opponentRoster: e.target.value })}
                  rows={3}
                />
              )}

              {singleTeamMode && (
                <div className="scrim-quick-panel">
                  <div className="quick-group">
                    <span>Date</span>
                    <input
                      type="date"
                      className="quick-date-input"
                      value={scrimQuick.selectedDate}
                      min={toDateInputValue(new Date())}
                      onChange={(e) => setScrimQuick({ ...scrimQuick, selectedDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="quick-group">
                    <span>Créneau</span>
                    <div className="quick-actions">
                      {slotOptions.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`quick-chip ${scrimQuick.sessionSlot === slot ? 'active' : ''}`}
                          onClick={() => setScrimQuick({ ...scrimQuick, sessionSlot: slot })}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="quick-group">
                    <span>Langue</span>
                    <div className="quick-actions">
                      <button
                        type="button"
                        className={`quick-chip ${scrimQuick.language === 'EN' ? 'active' : ''}`}
                        onClick={() => setScrimQuick({ ...scrimQuick, language: 'EN' })}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        className={`quick-chip ${scrimQuick.language === 'FR' ? 'active' : ''}`}
                        onClick={() => setScrimQuick({ ...scrimQuick, language: 'FR' })}
                      >
                        FR
                      </button>
                    </div>
                  </div>

                  <div className="quick-group">
                    <span>Lobby</span>
                    <div className="quick-actions">
                      <button
                        type="button"
                        className={`quick-chip ${scrimQuick.lobbyCreation === 'us' ? 'active' : ''}`}
                        onClick={() => setScrimQuick({ ...scrimQuick, lobbyCreation: 'us' })}
                      >
                        US
                      </button>
                      <button
                        type="button"
                        className={`quick-chip ${scrimQuick.lobbyCreation === 'them' ? 'active' : ''}`}
                        onClick={() => setScrimQuick({ ...scrimQuick, lobbyCreation: 'them' })}
                      >
                        THEM
                      </button>
                    </div>
                  </div>

                  <div className="quick-group">
                    <span>Infos</span>
                    <div className="quick-actions">
                      <button
                        type="button"
                        className={`quick-chip ${scrimQuick.twoHourBlock ? 'active' : ''}`}
                        onClick={() => setScrimQuick({ ...scrimQuick, twoHourBlock: !scrimQuick.twoHourBlock })}
                      >
                        2H Block {scrimQuick.twoHourBlock ? 'OK' : 'NO'}
                      </button>
                      <button
                        type="button"
                        className={`quick-chip ${scrimQuick.stagger ? 'active' : ''}`}
                        onClick={() => setScrimQuick({ ...scrimQuick, stagger: !scrimQuick.stagger })}
                      >
                        Stagger {scrimQuick.stagger ? 'OK' : 'NO'}
                      </button>
                      <button
                        type="button"
                        className={`quick-chip ${scrimQuick.ban ? 'active' : ''}`}
                        onClick={() => setScrimQuick({ ...scrimQuick, ban: !scrimQuick.ban })}
                      >
                        Ban {scrimQuick.ban ? 'OK' : 'NO'}
                      </button>
                    </div>
                  </div>

                  <div className="quick-group">
                    <span>Map Pool</span>
                    <div className="quick-actions">
                      {mapPoolOptions.map((pool) => (
                        <button
                          key={pool.id}
                          type="button"
                          className={`quick-chip ${scrimQuick.mapPoolType === pool.id ? 'active' : ''}`}
                          onClick={() => setScrimQuick({
                            ...scrimQuick,
                            mapPoolType: pool.id,
                            mapPool: pool.value,
                            customMaps: pool.id === 'custom' ? scrimQuick.customMaps : [],
                          })}
                        >
                          {pool.label}
                        </button>
                      ))}
                    </div>

                    {scrimQuick.mapPoolType === 'custom' && (
                      <div className="custom-map-grid">
                        {availableMaps.map((map) => (
                          <button
                            key={map.id}
                            type="button"
                            className={`map-chip ${scrimQuick.customMaps.includes(map.name) ? 'active' : ''}`}
                            onClick={() => toggleCustomMap(map.name)}
                          >
                            {map.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!singleTeamMode && (
                <input
                  type="datetime-local"
                  value={scrimForm.scheduled_at}
                  onChange={(e) => setScrimForm({ ...scrimForm, scheduled_at: e.target.value })}
                  placeholder="Date/Heure"
                  required
                />
              )}

              <button type="submit" disabled={loading}>
                Créer Scrim
              </button>

              {singleTeamMode && !myTeamId && (
                <p className="error-message">
                  Ton compte manager/coach n'est pas encore relie a une team joueur. Le backend essaiera la correspondance par pseudo.
                </p>
              )}
            </div>
          </form>

          <h3>Scrims à venir</h3>
          <div className="scrims-list">
            {scrims.length === 0 ? (
              <p>Aucun scrim planifié</p>
            ) : (
              scrims.map((scrim) => (
                <div key={scrim.id} className="scrim-card">
                  <div className="scrim-info">
                    <strong>{scrim.team1_name ?? 'Team A'} vs {scrim.team2_name ?? 'Team B'}</strong>
                    {scrim.scheduled_at && (
                      <p className="scrim-date">📅 {formatDate(scrim.scheduled_at)}</p>
                    )}
                    {scrim.details?.opponentRoster && (
                      <p className="scrim-date">Roster adverse: {scrim.details.opponentRoster}</p>
                    )}
                    {scrim.details && (
                      <p className="scrim-date">Map Pool: {getMapPoolSummary(scrim)}</p>
                    )}
                    {scrim.details && (
                      <p className="scrim-date">
                        {scrim.details.language ?? 'EN'} | Lobby {scrim.details.lobbyCreation === 'eu' ? 'THEM' : (scrim.details.lobbyCreation ?? 'us').toUpperCase()} | 2H {scrim.details.twoHourBlock ? 'OK' : 'NO'} | Stagger {scrim.details.stagger ? 'OK' : 'NO'} | Ban {scrim.details.ban ? 'OK' : 'NO'}
                      </p>
                    )}
                    {scrim.played_at && (
                      <p className="scrim-score">
                        Score: {scrim.score1} - {scrim.score2}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteScrim(scrim.id)}
                    className="btn-delete"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'coaching' && (
        <div className="planning-section">
          <h3>Créer une Session de Coaching</h3>
          <form onSubmit={handleCreateCoachingSession} className="form-group">
            <div className="form-row">
              <select
                value={coachingForm.teamId}
                onChange={(e) => setCoachingForm({ ...coachingForm, teamId: e.target.value })}
                required
              >
                <option value="">Sélectionner une équipe</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Sujet/Topic"
                value={coachingForm.topic}
                onChange={(e) => setCoachingForm({ ...coachingForm, topic: e.target.value })}
                required
              />

              <input
                type="datetime-local"
                value={coachingForm.scheduledAt}
                onChange={(e) =>
                  setCoachingForm({ ...coachingForm, scheduledAt: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Durée (minutes)"
                value={coachingForm.duration}
                onChange={(e) => setCoachingForm({ ...coachingForm, duration: e.target.value })}
                min="15"
                max="480"
              />

              <button type="submit" disabled={loading}>
                Créer Session
              </button>
            </div>
          </form>

          <h3>Sessions de Coaching</h3>
          <div className="sessions-list">
            {sessions.length === 0 ? (
              <p>Aucune session planifiée</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="session-card">
                  <div className="session-info">
                    <strong>{session.topic}</strong>
                    <p>📅 {formatDate(session.scheduledAt ?? (session as unknown as { scheduled_at?: string }).scheduled_at)}</p>
                    <p>⏱️ {session.duration} minutes</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCoachingSession(session.id)}
                    className="btn-delete"
                  >
                    Supprimer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
