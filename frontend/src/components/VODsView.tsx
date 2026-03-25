import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { VOD, User } from '../utils/types'
import { apiRequest } from '../utils/api'

interface VODsViewProps {
  token: string
  user: User | null
}

export function VODsView({ token, user }: VODsViewProps) {
  const [vods, setVods] = useState<VOD[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    team1Name: '',
    team2Name: '',
    team1Score: '',
    team2Score: '',
    mapName: '',
    vodUrl: '',
    duration: '',
  })

  useEffect(() => {
    loadVODs()
  }, [token])

  async function loadVODs() {
    if (!token) return
    setLoading(true)
    try {
      const data = await apiRequest<VOD[]>('/vods', 'GET', undefined, token).catch(() => [])
      setVods(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateVOD(e: FormEvent) {
    e.preventDefault()
    if (!token || !form.title || !form.vodUrl) return

    try {
      const body = {
        title: form.title,
        description: form.description || undefined,
        team1Name: form.team1Name || undefined,
        team2Name: form.team2Name || undefined,
        team1Score: form.team1Score ? parseInt(form.team1Score) : undefined,
        team2Score: form.team2Score ? parseInt(form.team2Score) : undefined,
        mapName: form.mapName || undefined,
        vodUrl: form.vodUrl,
        duration: form.duration ? parseInt(form.duration) : undefined,
      }
      await apiRequest('/vods', 'POST', body, token)
      setForm({
        title: '',
        description: '',
        team1Name: '',
        team2Name: '',
        team1Score: '',
        team2Score: '',
        mapName: '',
        vodUrl: '',
        duration: '',
      })
      setShowForm(false)
      await loadVODs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur création VOD')
    }
  }

  async function handleDeleteVOD(vodId: number) {
    if (!token || !confirm('Confirmer la suppression?')) return

    try {
      await apiRequest(`/vods/${vodId}`, 'DELETE', undefined, token)
      await loadVODs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression VOD')
    }
  }

  const canManage = user?.role === 'manager' || user?.role === 'coach' || user?.role === 'owner'

  const extractVideoId = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0]
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0]
    }
    return null
  }

  const getYoutubeEmbed = (url: string) => {
    const videoId = extractVideoId(url)
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
    return null
  }

  return (
    <div className="vods-view">
      <div className="vods-header">
        <h2>🎬 VODs & Matchs</h2>
        {canManage && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '+ Ajouter VOD'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && canManage && (
        <form onSubmit={handleCreateVOD} className="vod-form">
          <div className="form-section">
            <h4>Informations de Base</h4>
            <div className="form-group">
              <label>Titre</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Dragon Soul vs Despair Esport"
                required
              />
            </div>

            <div className="form-group">
              <label>Description (optionnel)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Notes supplémentaires..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>URL VOD/Vidéo</label>
              <input
                type="url"
                value={form.vodUrl}
                onChange={(e) => setForm({ ...form, vodUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                required
              />
            </div>

            <div className="form-group">
              <label>Durée (minutes, optionnel)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="180"
                min="1"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Détails du Match</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Équipe 1</label>
                <input
                  type="text"
                  value={form.team1Name}
                  onChange={(e) => setForm({ ...form, team1Name: e.target.value })}
                  placeholder="Nom de l'équipe"
                />
              </div>
              <div className="form-group">
                <label>Score 1</label>
                <input
                  type="number"
                  value={form.team1Score}
                  onChange={(e) => setForm({ ...form, team1Score: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Équipe 2</label>
                <input
                  type="text"
                  value={form.team2Name}
                  onChange={(e) => setForm({ ...form, team2Name: e.target.value })}
                  placeholder="Nom de l'équipe"
                />
              </div>
              <div className="form-group">
                <label>Score 2</label>
                <input
                  type="number"
                  value={form.team2Score}
                  onChange={(e) => setForm({ ...form, team2Score: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Map Jouée</label>
              <input
                type="text"
                value={form.mapName}
                onChange={(e) => setForm({ ...form, mapName: e.target.value })}
                placeholder="Ex: Route 66, King's Row..."
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            Ajouter VOD
          </button>
        </form>
      )}

      <div className="vods-grid">
        {vods.length === 0 ? (
          <p className="empty-state">Aucune VOD enregistrée</p>
        ) : (
          vods.map((vod) => {
            const embedUrl = getYoutubeEmbed(vod.vodUrl)
            return (
              <div key={vod.id} className="vod-card">
                <div className="vod-thumbnail">
                  {embedUrl ? (
                    <iframe
                      width="100%"
                      height="200"
                      src={embedUrl}
                      title={vod.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="thumbnail-fallback">
                      <p>🎬 {vod.title}</p>
                      <a href={vod.vodUrl} target="_blank" rel="noopener noreferrer">
                        Voir la VOD
                      </a>
                    </div>
                  )}
                </div>

                <div className="vod-info">
                  <h4>{vod.title}</h4>
                  {vod.description && <p className="description">{vod.description}</p>}

                  {(vod.team1Name || vod.team2Name) && (
                    <div className="match-score">
                      <span className="team">{vod.team1Name || 'Team A'}</span>
                      <span className="score">
                        {vod.team1Score ?? '?'} - {vod.team2Score ?? '?'}
                      </span>
                      <span className="team">{vod.team2Name || 'Team B'}</span>
                    </div>
                  )}

                  <div className="vod-details">
                    {vod.mapName && <span>🗺️ {vod.mapName}</span>}
                    {vod.duration && <span>⏱️ {Math.floor(vod.duration / 60)}:{String(vod.duration % 60).padStart(2, '0')}</span>}
                  </div>

                  <div className="vod-actions">
                    <a
                      href={vod.vodUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-external"
                    >
                      Regarder
                    </a>
                    {canManage && (
                      <button
                        onClick={() => handleDeleteVOD(vod.id)}
                        className="btn-delete-small"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
