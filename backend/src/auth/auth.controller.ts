import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetUserRoleDto } from './dto/set-user-role.dto';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { CurrentUser } from '../security/current-user.decorator';
import { PublicWrite } from '../security/public-write.decorator';
import { Roles } from '../security/roles.decorator';
import type { AuthenticatedUser } from './authenticated-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @PublicWrite()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @PublicWrite()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.sub);
  }

  @Patch('users/:userId/role')
  @UseGuards(JwtAuthGuard)
  @Roles('coach')
  setUserRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: SetUserRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.authService.setUserRole(userId, dto.role, actor);
  }
}
