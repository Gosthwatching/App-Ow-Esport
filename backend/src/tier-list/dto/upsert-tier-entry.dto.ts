import { IsIn } from 'class-validator';

const tiers = ['S', 'A', 'B', 'C', 'D'] as const;

export class UpsertTierEntryDto {
  @IsIn(tiers)
  tier: (typeof tiers)[number];
}