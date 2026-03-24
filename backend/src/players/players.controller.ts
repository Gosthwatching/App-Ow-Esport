import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Roles } from '../security/roles.decorator';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  getAll() {
    return this.playersService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.getOne(id);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreatePlayerDto) {
    return this.playersService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, dto);
  }

  @Put(':id/assign-team/:teamId')
  @Roles('admin')
  assignTeam(
    @Param('id', ParseIntPipe) id: number,
    @Param('teamId', ParseIntPipe) teamId: number,
  ) {
    return this.playersService.assignTeam(id, teamId);
  }

  @Put(':id/remove-team')
  @Roles('admin')
  removeTeam(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.removeFromTeam(id);
  }

  @Delete(':id')
  @Roles('admin')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.delete(id);
  }

  /**
   * Synchronise les données Faceit d'un joueur.
   * POST /players/:id/sync-faceit?nickname=FaceitPseudo
   * Le paramètre nickname est optionnel (utilise le pseudo du joueur par défaut).
   */
  @Post(':id/sync-faceit')
  @Roles('admin')
  syncFaceit(
    @Param('id', ParseIntPipe) id: number,
    @Query('nickname') nickname?: string,
  ) {
    return this.playersService.syncFaceit(id, nickname);
  }
}