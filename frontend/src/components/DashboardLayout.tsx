import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { HeroCard } from './HeroCard'
import { MetricsGrid } from './MetricsGrid'
import { BottomCards } from './BottomCards'
import { CalendarCard } from './CalendarCard'
import { TeamsList } from './TeamsList'
import { TeamsView } from './TeamsView'
import { PlayersView } from './PlayersView'
import { HeroesView } from './HeroesView'
import { FaceitStatsView } from './FaceitStatsView'
import type { FormEvent } from 'react'
import type { User, Team, Player, HeroPoolEntry, TeamMapStatsEntry } from '../utils/types'

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
  canFillTeams: boolean
  newTeamName: string
  newTeamElo: string
  selectedTeam: Team | null
  selectedTeamPlayers: Player[]
  teamDetailsLoading: boolean
  teamEditName: string
  teamEditElo: string
  fillNames: string
  fillRole: string
  fillRank: string
  heroPoolOwner: string
  heroPseudoInput: string
  heroPoolLoading: boolean
  heroPoolEntries: HeroPoolEntry[]
  isOwnPool: boolean
  myPlayerRole?: string | null
  error: string
  successMessage: string
  currentPage: 'overview' | 'teams' | 'players' | 'heroes' | 'faceit'
  onPageChange: (page: 'overview' | 'teams' | 'players' | 'heroes' | 'faceit') => void
  onLogout: () => void
  onTeamNameChange: (value: string) => void
  onTeamEloChange: (value: string) => void
  onCreateTeam: (e: FormEvent) => Promise<void>
  onLoadTeamDetails: (teamIdentifier: string) => Promise<void>
  onTeamEditNameChange: (value: string) => void
  onTeamEditEloChange: (value: string) => void
  onFillNamesChange: (value: string) => void
  onFillRoleChange: (value: string) => void
  onFillRankChange: (value: string) => void
  onUpdateSelectedTeam: (e: FormEvent) => Promise<void>
  onFillSelectedTeam: (e: FormEvent) => Promise<void>
  onDeleteTeam: (teamIdentifier: string) => Promise<void>
  onOpenPlayerProfile: (pseudo: string) => void
  onHeroPseudoInputChange: (value: string) => void
  onSearchHeroPoolByPseudo: (e: FormEvent) => Promise<void>
  onSetTier: (heroId: number, tier: string) => Promise<void>
  onRemoveTier: (heroId: number) => Promise<void>
  faceitSelectedTeamId: string
  faceitMapFilter: string
  faceitLimit: string
  faceitLoading: boolean
  faceitMapStats: TeamMapStatsEntry[]
  onFaceitTeamChange: (value: string) => void
  onFaceitMapFilterChange: (value: string) => void
  onFaceitLimitChange: (value: string) => void
  onLoadFaceitStats: (e: FormEvent) => Promise<void>
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
  canFillTeams,
  newTeamName,
  newTeamElo,
  selectedTeam,
  selectedTeamPlayers,
  teamDetailsLoading,
  teamEditName,
  teamEditElo,
  fillNames,
  fillRole,
  fillRank,
  heroPoolOwner,
  heroPseudoInput,
  heroPoolLoading,
  heroPoolEntries,
  isOwnPool,
  myPlayerRole,
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
  onFillNamesChange,
  onFillRoleChange,
  onFillRankChange,
  onUpdateSelectedTeam,
  onFillSelectedTeam,
  onDeleteTeam,
  onOpenPlayerProfile,
  onHeroPseudoInputChange,
  onSearchHeroPoolByPseudo,
  onSetTier,
  onRemoveTier,
  faceitSelectedTeamId,
  faceitMapFilter,
  faceitLimit,
  faceitLoading,
  faceitMapStats,
  onFaceitTeamChange,
  onFaceitMapFilterChange,
  onFaceitLimitChange,
  onLoadFaceitStats,
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
            canFillTeams={canFillTeams}
            selectedTeam={selectedTeam}
            selectedTeamPlayers={selectedTeamPlayers}
            isLoading={teamDetailsLoading}
            teamEditName={teamEditName}
            teamEditElo={teamEditElo}
            fillNames={fillNames}
            fillRole={fillRole}
            fillRank={fillRank}
            onLoadTeamDetails={onLoadTeamDetails}
            onTeamEditNameChange={onTeamEditNameChange}
            onTeamEditEloChange={onTeamEditEloChange}
            onFillNamesChange={onFillNamesChange}
            onFillRoleChange={onFillRoleChange}
            onFillRankChange={onFillRankChange}
            onUpdateSelectedTeam={onUpdateSelectedTeam}
            onFillSelectedTeam={onFillSelectedTeam}
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
            isOwnPool={isOwnPool}
            myPlayerRole={myPlayerRole}
            onPseudoInputChange={onHeroPseudoInputChange}
            onSearchByPseudo={onSearchHeroPoolByPseudo}
            onSetTier={onSetTier}
            onRemoveTier={onRemoveTier}
          />
        )}

        {currentPage === 'faceit' && (
          <FaceitStatsView
            teams={teams}
            selectedTeamId={faceitSelectedTeamId}
            selectedMapFilter={faceitMapFilter}
            limit={faceitLimit}
            isLoading={faceitLoading}
            mapStats={faceitMapStats}
            onTeamChange={onFaceitTeamChange}
            onMapFilterChange={onFaceitMapFilterChange}
            onLimitChange={onFaceitLimitChange}
            onLoadStats={onLoadFaceitStats}
          />
        )}
      </section>

      <aside className="dashboard-right">
        <CalendarCard />
        <TeamsList teams={topTeams} />

        {error ? <p className="form-error right-msg">{error}</p> : null}
        {successMessage ? <p className="form-success right-msg">{successMessage}</p> : null}
      </aside>
    </main>
  )
}
