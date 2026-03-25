import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import type { Training, User } from '../utils/types'
import { apiRequest } from '../utils/api'

interface TrainingViewProps {
  token: string
  user: User | null
}

const TRAINING_CATEGORIES = ['general', 'tank', 'dps', 'support', 'strategy'] as const

export function TrainingView({ token, user }: TrainingViewProps) {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('general')

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    content: '',
    videoUrl: '',
  })

  useEffect(() => {
    loadTrainings()
  }, [token])

  async function loadTrainings() {
    if (!token) return
    setLoading(true)
    try {
      const data = await apiRequest<Training[]>('/trainings', 'GET', undefined, token).catch(
        () => []
      )
      setTrainings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTraining(e: FormEvent) {
    e.preventDefault()
    if (!token || !form.title || !form.content) return

    try {
      const body = {
        title: form.title,
        description: form.description,
        category: form.category,
        content: form.content,
        videoUrl: form.videoUrl || undefined,
      }
      await apiRequest('/trainings', 'POST', body, token)
      setForm({ title: '', description: '', category: 'general', content: '', videoUrl: '' })
      setShowForm(false)
      await loadTrainings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur création training')
    }
  }

  async function handleDeleteTraining(trainingId: number) {
    if (!token || !confirm('Confirmer la suppression?')) return

    try {
      await apiRequest(`/trainings/${trainingId}`, 'DELETE', undefined, token)
      await loadTrainings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur suppression training')
    }
  }

  const canEdit = user?.role === 'coach' || user?.role === 'manager' || user?.role === 'owner'
  const filteredTrainings =
    selectedCategory === 'all'
      ? trainings
      : trainings.filter((t) => t.category === selectedCategory)

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      general: '📚',
      tank: '🛡️',
      dps: '⚔️',
      support: '💚',
      strategy: '🎯',
    }
    return emojis[category] || '📂'
  }

  return (
    <div className="training-view">
      <div className="training-header">
        <h2>🎓 Contenu de Formation</h2>
        {canEdit && (
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Annuler' : '+ Nouveau Contenu'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && canEdit && (
        <form onSubmit={handleCreateTraining} className="training-form">
          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Techniques d'engagement en tant que Tank"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brève description"
            />
          </div>

          <div className="form-group">
            <label>Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {TRAINING_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryEmoji(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Contenu</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Détails du contenu..."
              rows={8}
              required
            />
          </div>

          <div className="form-group">
            <label>URL Vidéo (optionnel)</label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            Créer Contenu
          </button>
        </form>
      )}

      <div className="category-filter">
        <button
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => setSelectedCategory('all')}
        >
          Tous
        </button>
        {TRAINING_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? 'active' : ''}
            onClick={() => setSelectedCategory(cat)}
          >
            {getCategoryEmoji(cat)} {cat}
          </button>
        ))}
      </div>

      <div className="trainings-grid">
        {filteredTrainings.length === 0 ? (
          <p className="empty-state">Aucun contenu de formation pour cette catégorie</p>
        ) : (
          filteredTrainings.map((training) => (
            <div key={training.id} className="training-card">
              <div className="training-header-card">
                <h4>{training.title}</h4>
                <span className="category-badge">{getCategoryEmoji(training.category)}</span>
              </div>
              {training.description && <p className="description">{training.description}</p>}
              <div className="training-content">{training.content}</div>
              {training.videoUrl && (
                <a href={training.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link">
                  🎬 Voir la vidéo
                </a>
              )}
              {canEdit && (
                <button
                  onClick={() => handleDeleteTraining(training.id)}
                  className="btn-delete-small"
                >
                  Supprimer
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
