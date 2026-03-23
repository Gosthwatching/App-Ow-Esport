import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Roles } from '../security/roles.decorator';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  getAll() {
    return this.teamsService.getAll();
  }

  @Get(':teamIdentifier')
  getOne(@Param('teamIdentifier') teamIdentifier: string) {
    return this.teamsService.getOne(teamIdentifier);
  }

  @Get(':teamIdentifier/players')
  getPlayers(@Param('teamIdentifier') teamIdentifier: string) {
    return this.teamsService.getPlayers(teamIdentifier);
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Put(':teamIdentifier')
  @Roles('admin')
  update(
    @Param('teamIdentifier') teamIdentifier: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(teamIdentifier, dto);
  }

  @Delete(':teamIdentifier')
  @Roles('admin')
  delete(@Param('teamIdentifier') teamIdentifier: string) {
    return this.teamsService.delete(teamIdentifier);
  }
}