import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database.module';
import { PlayersModule } from './players/players.module';
import { TeamsModule } from './teams/teams.module';
import { MapsModule } from './maps/maps.module';
import { ScrimsModule } from './scrims/scrims.module';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { StatsModule } from './stats/stats.module';
import { HeroesModule } from './heroes/heroes.module';
import { TierListModule } from './tier-list/tier-list.module';
import { WriteAuthGuard } from './security/write-auth.guard';
import { AuthModule } from './auth/auth.module';
import { FaceitModule } from './faceit/faceit.module';
import { CoachingSessionsModule } from './coaching-sessions/coaching-sessions.module';
import { TrainingsModule } from './trainings/trainings.module';
import { AbsencesModule } from './absences/absences.module';
import { VODsModule } from './vods/vods.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    DatabaseModule,
    PlayersModule,
    TeamsModule,
    MapsModule,
    ScrimsModule,
    MatchmakingModule,
    StatsModule,
    HeroesModule,
    TierListModule,
    AuthModule,
    FaceitModule,
    CoachingSessionsModule,
    TrainingsModule,
    AbsencesModule,
    VODsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: WriteAuthGuard,
    },
  ],
})
export class AppModule {}
