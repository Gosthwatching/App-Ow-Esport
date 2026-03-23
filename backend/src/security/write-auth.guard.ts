import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_WRITE_KEY } from './public-write.decorator';
import { ROLES_KEY } from './roles.decorator';
import { hasRequiredRole } from './role-hierarchy';

@Injectable()
export class WriteAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const method = request.method as string;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isPublicWrite = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_WRITE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (['GET', 'HEAD', 'OPTIONS'].includes(method) || isPublicWrite) {
      return true;
    }

    const authHeader = request.headers.authorization as string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();

      if (token) {
        let payload: Record<string, unknown>;

        try {
          payload = await this.jwtService.verifyAsync(token);
        } catch {
          throw new UnauthorizedException('Invalid bearer token');
        }

        request.user = payload;

        if (!hasRequiredRole(payload.role as string | undefined, requiredRoles)) {
          throw new ForbiddenException('Insufficient role to access this route');
        }

        return true;
      }
    }

    throw new UnauthorizedException(
      'Missing authentication. Provide a Bearer token.',
    );
  }
}
