import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request.method as string;

    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const expectedApiKey = process.env.API_KEY;

    // If API_KEY is not configured, guard is disabled to avoid blocking local dev.
    if (!expectedApiKey) {
      return true;
    }

    const providedApiKey = request.headers['x-api-key'];

    if (providedApiKey !== expectedApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    return true;
  }
}