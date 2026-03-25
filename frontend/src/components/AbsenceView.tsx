import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { Absence, Player, Team, User } from '../utils/types'
import { apiRequest } from '../utils/api'

interface AbsenceViewProps {
  token: string
  user: User | null
  players: Player[]
  teams: Team[]
}

export function AbsenceView({ token, user, players, teams }: AbsenceViewProps) {
  const [absences, setAbsences] = useState<Absence[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    playerId: '',
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    loadAbsences()
  }, [token])

  async function loadAbsences() {
    if (!token) return
    setLoading(true)
    try {
      const data = await apiRequest<Absence[]>('/absences', 'GET', undefined, token).catch(
        () => []
      )
      setAbsences(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAbsence(e: FormEvent) {
    e.preventDefault()
    if (!token || !form.playerId || !form.startDate || !form.endDate) return

    try {
      const body = {
        playerId: parseInt(form.playerId),
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason || undefined,
      }
      await apiRequest('/absences', 'POST', body, token)
      setForm({ playerId: '', startDate: '', endDate: '', reason: '' })
      setShowForm(false)
      await loadAbsences()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur création absence')
    }
  }

  async function handleDeleteAbsence(absenceId: number) {
    if (!token || !confirm('Confirmer la suppression?')) return

    try {
      await apiRequest(`/absences/${absenceId}`, 'DELETE', undefined, token)
      await loadAbsences()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression absence')
    }
  }

  const canManage = user?.role === 'manager' || user?.role === 'coach' || user?.role === 'owner'

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getPlayerName = (playerId: number) => {
    return players.find((p) => p.id === playerId)?.pseudo || 'Joueur inconnu'
  }

  const getTeamName = (playerId: number) => {
    const player = players.find((p) => p.id === playerId)
    if (!player) return '-'
    const teamId = player.teamId ?? player.team_id
    return teams.find((t) => t.id === teamId)?.name || '-'
  }

  const today = new Date()
  const activeAbsences = absences.filter((a) => {
    const endDate = new Date(a.endDate)
    return endDate >= today
  })

  const pastAbsences = absences.filter((a) => {
    const endDate = new Date(a.endDate)
    return endDate < today
  })

  return (
    <div className="absence-view">
      <div className="absence-header">
        <h2>📅 Gestion des Absences</h2>
        {canManage && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '+ Nouvelle Absence'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && canManage && (
        <form onSubmit={handleCreateAbsence} className="absence-form">
          <div className="form-group">
            <label>Joueur</label>
            <select
              value={form.playerId}
              onChange={(e) => setForm({ ...form, playerId: e.target.value })}
              required
            >
              <option value="">Sélectionner un joueur</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.pseudo}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de début</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Date de fin</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Raison (optionnel)</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Ex: Maladie, Vacances, Jours fériés..."
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            Créer Absence
          </button>
        </form>
      )}

      <div className="absences-container">
        <section className="absences-section">
          <h3>⚠️ Absences Actives ({activeAbsences.length})</h3>
          {activeAbsences.length === 0 ? (
            <p className="empty-state">Aucune absence actuellement</p>
          ) : (
            <div className="absences-grid">
              {activeAbsences.map((absence) => (
                <div key={absence.id} className="absence-card active">
                  <div className="absence-header-card">
                    <h4>{getPlayerName(absence.playerId)}</h4>
                    <span className="team-badge">{getTeamName(absence.playerId)}</span>
                  </div>
                  <div className="absence-dates">
                    📅 {formatDate(absence.startDate)} → {formatDate(absence.endDate)}
                  </div>
                  {absence.reason && <p className="reason">Raison: {absence.reason}</p>}
                  {canManage && (
                    <button
                      onClick={() => handleDeleteAbsence(absence.id)}
                      className="btn-delete-small"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="absences-section">
          <h3>✓ Absences Passées ({pastAbsences.length})</h3>
          {pastAbsences.length === 0 ? (
            <p className="empty-state">Aucune absence passée</p>
          ) : (
            <div className="absences-grid">
              {pastAbsences.map((absence) => (
                <div key={absence.id} className="absence-card past">
                  <div className="absence-header-card">
                    <h4>{getPlayerName(absence.playerId)}</h4>
                    <span className="team-badge">{getTeamName(absence.playerId)}</span>
                  </div>
                  <div className="absence-dates">
                    📅 {formatDate(absence.startDate)} → {formatDate(absence.endDate)}
                  </div>
                  {absence.reason && <p className="reason">Raison: {absence.reason}</p>}
                  {canManage && (
                    <button
                      onClick={() => handleDeleteAbsence(absence.id)}
                      className="btn-delete-small"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
