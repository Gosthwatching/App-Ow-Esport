export class CreateScrimDto {
  team1Id: number;
  team2Id: number;
  scheduledAt: string;
  format: string;
  maps: { mapId: number; order: number }[];
}