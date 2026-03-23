import type { FormEvent } from 'react'

type AuthScreenProps = {
  authMode: 'login' | 'register'
  onModeChange: (mode: 'login' | 'register') => void
  username: string
  password: string
  displayName: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onDisplayNameChange: (value: string) => void
  onSubmit: (e: FormEvent) => Promise<void>
  error: string
}

export function AuthScreen({
  authMode,
  onModeChange,
  username,
  password,
  displayName,
  onUsernameChange,
  onPasswordChange,
  onDisplayNameChange,
  onSubmit,
  error,
}: AuthScreenProps) {
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
            onClick={() => onModeChange('login')}
          >
            Connexion
          </button>
          <button
            className={authMode === 'register' ? 'active' : ''}
            onClick={() => onModeChange('register')}
          >
            Inscription
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Username
            <input
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              required
            />
          </label>

          {authMode === 'register' ? (
            <label>
              Display name
              <input
                value={displayName}
                onChange={(e) => onDisplayNameChange(e.target.value)}
              />
            </label>
          ) : null}

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
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
