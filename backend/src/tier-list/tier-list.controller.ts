import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';
import { TierListService } from './tier-list.service';
import { CreateTierListUserDto } from './dto/create-tier-list-user.dto';
import { UpsertTierEntryDto } from './dto/upsert-tier-entry.dto';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { CurrentUser } from '../security/current-user.decorator';
import { Roles } from '../security/roles.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user.interface';

@Controller('tier-list')
@UseGuards(JwtAuthGuard)
export class TierListController {
	constructor(private readonly tierListService: TierListService) {}

	private ensureCanAccessUser(targetUserId: number, authUser: AuthenticatedUser) {
		if (authUser.role === 'admin') {
			return;
		}

		if (authUser.sub !== targetUserId) {
			throw new ForbiddenException('You can only access your own tier list');
		}
	}

	@Post('users')
	@Roles('admin')
	createUser(
		@Body() dto: CreateTierListUserDto,
		@CurrentUser() _authUser: AuthenticatedUser,
	) {
		return this.tierListService.createUser(dto);
	}

	@Get('users/:userId/heroes')
	getUserHeroTiers(
		@Param('userId', ParseIntPipe) userId: number,
		@Query('role') role?: string,
		@CurrentUser() authUser?: AuthenticatedUser,
	) {
		this.ensureCanAccessUser(userId, authUser!);
		return this.tierListService.getUserHeroTiers(userId, role);
	}

	@Get('users/:userId/grouped')
	getUserTierListGrouped(
		@Param('userId', ParseIntPipe) userId: number,
		@Query('role') role?: string,
		@CurrentUser() authUser?: AuthenticatedUser,
	) {
		this.ensureCanAccessUser(userId, authUser!);
		return this.tierListService.getUserTierListGrouped(userId, role);
	}

	@Put('users/:userId/heroes/:heroId')
	upsertTier(
		@Param('userId', ParseIntPipe) userId: number,
		@Param('heroId', ParseIntPipe) heroId: number,
		@Body() dto: UpsertTierEntryDto,
		@CurrentUser() authUser?: AuthenticatedUser,
	) {
		this.ensureCanAccessUser(userId, authUser!);
		return this.tierListService.upsertTier(userId, heroId, dto);
	}

	@Delete('users/:userId/heroes/:heroId')
	removeTier(
		@Param('userId', ParseIntPipe) userId: number,
		@Param('heroId', ParseIntPipe) heroId: number,
		@CurrentUser() authUser?: AuthenticatedUser,
	) {
		this.ensureCanAccessUser(userId, authUser!);
		return this.tierListService.removeTier(userId, heroId);
	}
}
