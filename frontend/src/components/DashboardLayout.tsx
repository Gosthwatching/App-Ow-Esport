import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { HeroCard } from './HeroCard'
import { MetricsGrid } from './MetricsGrid'
import { BottomCards } from './BottomCards'
import { CalendarCard } from './CalendarCard'
import { TeamsList } from './TeamsList'
import { RoleControlForm } from './RoleControlForm'
import { TeamsView } from './TeamsView'
import { PlayersView } from './PlayersView'
import { HeroesView } from './HeroesView'
import type { FormEvent } from 'react'
import type { User, Team, Player, HeroPoolEntry } from '../utils/types'

type DashboardLayoutProps = {
  user: User
  teams: Team[]
  topTeams: Team[]
  players: Player[]
  playerCount: number
  playersWithTeam: number
  playerRatio: number
  heroesCount: number
  canCreateTeams: boolean
  canManageTeams: boolean
  canManageRoles: boolean
  newTeamName: string
  newTeamElo: string
  roleTargetId: string
  newRole: string
  selectedTeam: Team | null
  selectedTeamPlayers: Player[]
  teamDetailsLoading: boolean
  teamEditName: string
  teamEditElo: string
  heroPoolOwner: string
  heroPseudoInput: string
  heroPoolLoading: boolean
  heroPoolEntries: HeroPoolEntry[]
  error: string
  successMessage: string
  currentPage: 'overview' | 'teams' | 'players' | 'heroes'
  onPageChange: (page: 'overview' | 'teams' | 'players' | 'heroes') => void
  onLogout: () => void
  onTeamNameChange: (value: string) => void
  onTeamEloChange: (value: string) => void
  onCreateTeam: (e: FormEvent) => Promise<void>
  onLoadTeamDetails: (teamIdentifier: string) => Promise<void>
  onTeamEditNameChange: (value: string) => void
  onTeamEditEloChange: (value: string) => void
  onUpdateSelectedTeam: (e: FormEvent) => Promise<void>
  onDeleteTeam: (teamIdentifier: string) => Promise<void>
  onOpenPlayerProfile: (pseudo: string) => void
  onHeroPseudoInputChange: (value: string) => void
  onSearchHeroPoolByPseudo: (e: FormEvent) => Promise<void>
  onTargetIdChange: (value: string) => void
  onRoleChange: (value: string) => void
  onSetRole: (e: FormEvent) => Promise<void>
}

export function DashboardLayout({
  user,
  teams,
  topTeams,
  players,
  playerCount,
  playersWithTeam,
  playerRatio,
  heroesCount,
  canCreateTeams,
  canManageTeams,
  canManageRoles,
  newTeamName,
  newTeamElo,
  roleTargetId,
  newRole,
  selectedTeam,
  selectedTeamPlayers,
  teamDetailsLoading,
  teamEditName,
  teamEditElo,
  heroPoolOwner,
  heroPseudoInput,
  heroPoolLoading,
  heroPoolEntries,
  error,
  successMessage,
  currentPage,
  onPageChange,
  onLogout,
  onTeamNameChange,
  onTeamEloChange,
  onCreateTeam,
  onLoadTeamDetails,
  onTeamEditNameChange,
  onTeamEditEloChange,
  onUpdateSelectedTeam,
  onDeleteTeam,
  onOpenPlayerProfile,
  onHeroPseudoInputChange,
  onSearchHeroPoolByPseudo,
  onTargetIdChange,
  onRoleChange,
  onSetRole,
}: DashboardLayoutProps) {
  return (
    <main className="dashboard-shell">
      <Sidebar currentPage={currentPage} onPageChange={onPageChange} onLogout={onLogout} />

      <section className="dashboard-main">
        <Topbar user={user} />

        {currentPage === 'overview' && (
          <>
            <HeroCard
              user={user}
              canCreateTeams={canCreateTeams}
              newTeamName={newTeamName}
              newTeamElo={newTeamElo}
              onTeamNameChange={onTeamNameChange}
              onTeamEloChange={onTeamEloChange}
              onCreateTeam={onCreateTeam}
            />
            <MetricsGrid
              teamsCount={teams.length}
              playersCount={playerCount}
              playersWithTeam={playersWithTeam}
              heroesCount={heroesCount}
            />
            <BottomCards playerRatio={playerRatio} />
          </>
        )}

        {currentPage === 'teams' && (
          <TeamsView
            teams={teams}
            canManageTeams={canManageTeams}
            selectedTeam={selectedTeam}
            selectedTeamPlayers={selectedTeamPlayers}
            isLoading={teamDetailsLoading}
            teamEditName={teamEditName}
            teamEditElo={teamEditElo}
            onLoadTeamDetails={onLoadTeamDetails}
            onTeamEditNameChange={onTeamEditNameChange}
            onTeamEditEloChange={onTeamEditEloChange}
            onUpdateSelectedTeam={onUpdateSelectedTeam}
            onDeleteTeam={onDeleteTeam}
          />
        )}
        {currentPage === 'players' && (
          <PlayersView players={players} onViewProfile={onOpenPlayerProfile} />
        )}
        {currentPage === 'heroes' && (
          <HeroesView
            poolOwner={heroPoolOwner}
            pseudoInput={heroPseudoInput}
            isLoading={heroPoolLoading}
            poolEntries={heroPoolEntries}
            onPseudoInputChange={onHeroPseudoInputChange}
            onSearchByPseudo={onSearchHeroPoolByPseudo}
          />
        )}
      </section>

      <aside className="dashboard-right">
        <CalendarCard />
        <TeamsList teams={topTeams} />
        <RoleControlForm
          canManageRoles={canManageRoles}
          roleTargetId={roleTargetId}
          newRole={newRole}
          onTargetIdChange={onTargetIdChange}
          onRoleChange={onRoleChange}
          onSubmit={onSetRole}
        />

        {error ? <p className="form-error right-msg">{error}</p> : null}
        {successMessage ? <p className="form-success right-msg">{successMessage}</p> : null}
      </aside>
    </main>
  )
}
