import { Controller, Get, Param, Query } from '@nestjs/common';
import { FaceitService } from './faceit.service';

@Controller('faceit')
export class FaceitController {
  constructor(private readonly faceitService: FaceitService) {}

  /**
   * Cherche un joueur Faceit par son pseudo OW2.
   * GET /faceit/players/nickname/:nickname
   */
  @Get('players/nickname/:nickname')
  getPlayerByNickname(@Param('nickname') nickname: string) {
    return this.faceitService.getPlayerByNickname(nickname);
  }

  /**
   * Récupère le profil complet d'un joueur par son ID Faceit.
   * GET /faceit/players/:playerId
   */
  @Get('players/:playerId')
  getPlayerById(@Param('playerId') playerId: string) {
    return this.faceitService.getPlayerById(playerId);
  }

  /**
   * Récupère les stats OW2 d'un joueur Faceit.
   * GET /faceit/players/:playerId/stats
   */
  @Get('players/:playerId/stats')
  getPlayerStats(@Param('playerId') playerId: string) {
    return this.faceitService.getPlayerStats(playerId);
  }

  /**
   * Récupère l'historique des matchs OW2 d'un joueur Faceit.
   * GET /faceit/players/:playerId/history?limit=20
   */
  @Get('players/:playerId/history')
  getMatchHistory(
    @Param('playerId') playerId: string,
    @Query('limit') limit?: string,
  ) {
    return this.faceitService.getMatchHistory(
      playerId,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * Récupère les détails d'un match Faceit.
   * GET /faceit/matches/:matchId
   */
  @Get('matches/:matchId')
  getMatchDetails(@Param('matchId') matchId: string) {
    return this.faceitService.getMatchDetails(matchId);
  }

  /**
   * Agrège les stats Faceit d'une team par map.
   * GET /faceit/teams/:teamIdentifier/map-stats?limit=20&map=ilios
   */
  @Get('teams/:teamIdentifier/map-stats')
  getTeamMapStats(
    @Param('teamIdentifier') teamIdentifier: string,
    @Query('limit') limit?: string,
    @Query('map') map?: string,
  ) {
    return this.faceitService.getTeamMapStats(
      teamIdentifier,
      limit ? parseInt(limit, 10) : 20,
      map,
    );
  }
}
