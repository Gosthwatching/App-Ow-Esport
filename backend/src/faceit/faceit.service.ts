import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class FaceitService {
  private readonly baseUrl = 'https://open.faceit.com/data/v4';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @Inject('DATABASE_POOL') private readonly db: Pool,
  ) {}

  private normalizeMapName(rawMap: unknown): string {
    if (typeof rawMap !== 'string' || rawMap.trim().length === 0) {
      return 'Unknown';
    }

    return rawMap
      .replace(/^de_/i, '')
      .replace(/^cs2_/i, '')
      .replace(/_/g, ' ')
      .trim();
  }

  private extractRawMapToken(matchPayload: Record<string, unknown>): string | null {
    const payload = matchPayload as Record<string, unknown>;
    const rounds = payload.rounds as Array<Record<string, unknown>> | undefined;

    if (Array.isArray(rounds) && rounds.length > 0) {
      const roundStats = rounds[0]?.round_stats as Record<string, unknown> | undefined;
      const rawRoundMap = roundStats?.Map ?? roundStats?.map;
      if (typeof rawRoundMap === 'string' && rawRoundMap.trim().length > 0) {
        return rawRoundMap.trim();
      }
    }

    if (typeof payload.map === 'string' && payload.map.trim().length > 0) {
      return payload.map.trim();
    }

    const voting = payload.voting as Record<string, unknown> | undefined;
    const votingPick = voting?.pick;
    if (typeof votingPick === 'string' && votingPick.trim().length > 0) {
      const firstToken = votingPick.trim().split(/\s+/)[0];
      return firstToken ?? null;
    }

    return null;
  }

  private extractMapFromVotingMap(votingMap: unknown): string {
    if (typeof votingMap === 'string') {
      return this.normalizeMapName(votingMap);
    }

    if (!votingMap || typeof votingMap !== 'object') {
      return 'Unknown';
    }

    const votingPayload = votingMap as Record<string, unknown>;
    const pick = typeof votingPayload.pick === 'string' ? votingPayload.pick : '';
    const pickTokens = pick
      .split(/\s+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 0);

    const entities = Array.isArray(votingPayload.entities)
      ? (votingPayload.entities as Array<Record<string, unknown>>)
      : [];

    for (const token of pickTokens) {
      const entity = entities.find((candidate) => {
        const candidateId = candidate.id;
        const candidateGuid = candidate.guid;
        const candidateGameMapId = candidate.game_maps_id;
        const candidateGameMapIdSingular = candidate.game_map_id;
        return (
          (typeof candidateId === 'string' && candidateId === token) ||
          (typeof candidateGuid === 'string' && candidateGuid === token) ||
          (typeof candidateGameMapId === 'string' && candidateGameMapId === token) ||
          (typeof candidateGameMapIdSingular === 'string' && candidateGameMapIdSingular === token)
        );
      });

      if (!entity) {
        continue;
      }

      const labelCandidates: unknown[] = [entity.name, entity.class_name];
      for (const candidate of labelCandidates) {
        const normalized = this.normalizeMapName(candidate);
        if (normalized !== 'Unknown') {
          return normalized;
        }
      }
    }

    return 'Unknown';
  }

  private extractMapName(matchDetails: Record<string, unknown>): string {
    const payload = matchDetails as Record<string, unknown>;
    const competition = payload.competition as Record<string, unknown> | undefined;
    const voting = payload.voting as Record<string, unknown> | undefined;
    const rounds = payload.rounds as Array<Record<string, unknown>> | undefined;

    if (Array.isArray(rounds) && rounds.length > 0) {
      const roundStats = rounds[0]?.round_stats as Record<string, unknown> | undefined;
      const roundMap = this.normalizeMapName(roundStats?.Map ?? roundStats?.map);
      if (roundMap !== 'Unknown') {
        return roundMap;
      }
    }

    const votingMapName = this.extractMapFromVotingMap(voting?.map);
    if (votingMapName !== 'Unknown') {
      return votingMapName;
    }

    const directCandidates: unknown[] = [
      payload.map,
      voting?.pick,
      competition?.name,
    ];

    for (const candidate of directCandidates) {
      const normalized = this.normalizeMapName(candidate);
      if (normalized !== 'Unknown') {
        return normalized;
      }
    }

    return 'Unknown';
  }

  private resolveMapNameFromDetails(
    matchDetails: Record<string, unknown>,
    preferredToken?: string | null,
  ): string {
    const voting = (matchDetails.voting as Record<string, unknown> | undefined) ?? {};
    const votingMap = voting.map as Record<string, unknown> | undefined;

    if (votingMap && typeof votingMap === 'object') {
      const entities = Array.isArray(votingMap.entities)
        ? (votingMap.entities as Array<Record<string, unknown>>)
        : [];

      const pickTokens =
        typeof votingMap.pick === 'string'
          ? votingMap.pick
              .split(/\s+/)
              .map((token) => token.trim())
              .filter((token) => token.length > 0)
          : [];

      const candidateTokens = preferredToken
        ? [preferredToken, ...pickTokens]
        : pickTokens;

      for (const token of candidateTokens) {
        const match = entities.find((entity) => {
          const guid = entity.guid;
          const id = entity.id;
          const gameMapId = entity.game_map_id;
          const gameMapsId = entity.game_maps_id;
          return (
            (typeof guid === 'string' && guid === token) ||
            (typeof id === 'string' && id === token) ||
            (typeof gameMapId === 'string' && gameMapId === token) ||
            (typeof gameMapsId === 'string' && gameMapsId === token)
          );
        });

        if (!match) {
          continue;
        }

        const name = this.normalizeMapName(match.name ?? match.class_name);
        if (name !== 'Unknown') {
          return name;
        }
      }
    }

    return this.extractMapName(matchDetails);
  }

  private extractPlayerStatNumber(stats: Record<string, unknown>, keys: string[]): number {
    for (const key of keys) {
      const value = stats[key];
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string') {
        const normalized = value.replace('%', '').trim();
        const parsed = Number(normalized);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }

    return 0;
  }

  private extractPlayerRowsFromMatch(
    matchDetails: Record<string, unknown>,
  ): Array<{ faceitId: string; nickname: string; stats: Record<string, unknown> }> {
    const payload = matchDetails as Record<string, unknown>;
    const rounds = payload.rounds as Array<Record<string, unknown>> | undefined;
    const rows: Array<{ faceitId: string; nickname: string; stats: Record<string, unknown> }> = [];

    if (!Array.isArray(rounds)) {
      return rows;
    }

    for (const round of rounds) {
      const teams = round.teams as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(teams)) {
        continue;
      }

      for (const team of teams) {
        const players = team.players as Array<Record<string, unknown>> | undefined;
        if (!Array.isArray(players)) {
          continue;
        }

        for (const player of players) {
          const playerId = player.player_id;
          const nickname = player.nickname;
          const playerStats =
            (player.player_stats as Record<string, unknown> | undefined) ?? {};

          if (typeof playerId !== 'string' || typeof nickname !== 'string') {
            continue;
          }

          rows.push({
            faceitId: playerId,
            nickname,
            stats: playerStats,
          });
        }
      }
    }

    return rows;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.config.get<string>('FACEIT_API_KEY')}`,
    };
  }

  private handleError(err: unknown): never {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status ?? 500;
    const message =
      (axiosErr.response?.data as any)?.message ?? 'Faceit API error';
    throw new HttpException(message, status);
  }

  async getPlayerByNickname(nickname: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/players`, {
          headers: this.headers,
          params: { nickname, game: 'ow2' },
        }),
      );
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getPlayerById(faceitPlayerId: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/players/${faceitPlayerId}`, {
          headers: this.headers,
        }),
      );
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getPlayerStats(faceitPlayerId: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(
          `${this.baseUrl}/players/${faceitPlayerId}/stats/ow2`,
          { headers: this.headers },
        ),
      );
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getMatchHistory(faceitPlayerId: string, limit = 20) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(
          `${this.baseUrl}/players/${faceitPlayerId}/history`,
          {
            headers: this.headers,
            params: { game: 'ow2', limit },
          },
        ),
      );
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getMatchDetails(matchId: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/matches/${matchId}`, {
          headers: this.headers,
        }),
      );
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getMatchStats(matchId: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/matches/${matchId}/stats`, {
          headers: this.headers,
        }),
      );
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  async getTeamMapStats(teamIdentifier: string, limit = 20, mapFilter?: string) {
    const teamResult = await this.db.query(
      'SELECT id, name, slug FROM teams WHERE id::text = $1 OR LOWER(slug) = LOWER($1) LIMIT 1',
      [teamIdentifier],
    );

    if (!teamResult.rows.length) {
      throw new HttpException('Team not found', 404);
    }

    const team = teamResult.rows[0] as { id: number; name: string; slug: string | null };

    const playersResult = await this.db.query(
      'SELECT id, pseudo, faceit_id FROM players WHERE team_id = $1 ORDER BY id ASC',
      [team.id],
    );

    const players = playersResult.rows as Array<{
      id: number;
      pseudo: string;
      faceit_id: string | null;
    }>;

    const normalizedFilter = mapFilter?.trim().toLowerCase();
    const mapNameByToken = new Map<string, string>();
    const mapAccumulator = new Map<
      string,
      {
        map: string;
        players: Map<
          string,
          {
            playerId: number;
            pseudo: string;
            faceitId: string;
            matches: number;
            wins: number;
            kills: number;
            deaths: number;
            assists: number;
            kd: number;
          }
        >;
      }
    >();

    for (const player of players) {
      const fallbackFaceitId = player.faceit_id;
      let faceitId: string | null = fallbackFaceitId;

      if (!faceitId) {
        try {
          const profile = await this.getPlayerByNickname(player.pseudo);
          const resolvedFaceitId = (profile as Record<string, unknown>)?.player_id;
          faceitId = typeof resolvedFaceitId === 'string' ? resolvedFaceitId : null;
        } catch {
          continue;
        }
      }

      if (!faceitId) {
        continue;
      }

      let historyItems: Array<Record<string, unknown>> = [];
      try {
        const history = await this.getMatchHistory(faceitId, limit);
        historyItems = Array.isArray((history as Record<string, unknown>)?.items)
          ? ((history as Record<string, unknown>).items as Array<Record<string, unknown>>)
          : [];
      } catch {
        continue;
      }

      for (const item of historyItems) {
        const matchId = item.match_id;
        if (typeof matchId !== 'string') {
          continue;
        }

        let statsPayload: Record<string, unknown>;
        try {
          statsPayload = (await this.getMatchStats(matchId)) as Record<string, unknown>;
        } catch {
          continue;
        }

        let detailsPayload: Record<string, unknown> = {};
        const rawMapToken = this.extractRawMapToken(statsPayload);

        let map = this.normalizeMapName(rawMapToken);

        if (rawMapToken && mapNameByToken.has(rawMapToken)) {
          map = mapNameByToken.get(rawMapToken) as string;
        }

        if (
          rawMapToken &&
          /^0x[0-9a-f]+$/i.test(rawMapToken) &&
          !mapNameByToken.has(rawMapToken)
        ) {
          try {
            detailsPayload = (await this.getMatchDetails(matchId)) as Record<string, unknown>;
            const resolvedFromDetails = this.resolveMapNameFromDetails(
              detailsPayload,
              rawMapToken,
            );
            if (resolvedFromDetails !== 'Unknown') {
              mapNameByToken.set(rawMapToken, resolvedFromDetails);
              map = resolvedFromDetails;
            }
          } catch {
            // Keep processing with token fallback.
          }
        }

        if (map === 'Unknown' && rawMapToken) {
          map = rawMapToken;
        }

        if (normalizedFilter && map.toLowerCase() !== normalizedFilter) {
          continue;
        }

        const rows = this.extractPlayerRowsFromMatch(statsPayload);
        const playerRow = rows.find((row) => row.faceitId === faceitId);
        if (!playerRow) {
          continue;
        }

        const current = mapAccumulator.get(map) ?? {
          map,
          players: new Map(),
        };

        const existingPlayerStats = current.players.get(faceitId) ?? {
          playerId: player.id,
          pseudo: player.pseudo,
          faceitId,
          matches: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
          kd: 0,
        };

        const stats = playerRow.stats;
        const kills = this.extractPlayerStatNumber(stats, ['Kills', 'kills', 'K', 'Eliminations']);
        const deaths = this.extractPlayerStatNumber(stats, ['Deaths', 'deaths', 'D']);
        const assists = this.extractPlayerStatNumber(stats, ['Assists', 'assists', 'A']);
        const won = this.extractPlayerStatNumber(stats, ['Result', 'Win', 'Won', 'winner']);

        existingPlayerStats.matches += 1;
        existingPlayerStats.wins += won > 0 ? 1 : 0;
        existingPlayerStats.kills += kills;
        existingPlayerStats.deaths += deaths;
        existingPlayerStats.assists += assists;
        existingPlayerStats.kd =
          existingPlayerStats.deaths > 0
            ? Number((existingPlayerStats.kills / existingPlayerStats.deaths).toFixed(2))
            : existingPlayerStats.kills;

        current.players.set(faceitId, existingPlayerStats);
        mapAccumulator.set(map, current);
      }
    }

    const mapStats = Array.from(mapAccumulator.values()).map((entry) => ({
      map: entry.map,
      players: Array.from(entry.players.values()).sort((a, b) => b.matches - a.matches),
    }));

    mapStats.sort((a, b) => a.map.localeCompare(b.map));

    return {
      team: {
        id: team.id,
        name: team.name,
        slug: team.slug,
      },
      mapStats,
      totalMaps: mapStats.length,
    };
  }
}
