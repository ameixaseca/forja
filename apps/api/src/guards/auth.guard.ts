import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';

export interface AuthenticatedRequest extends FastifyRequest {
  userId: string;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJwks() {
  if (!jwks) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error(
        'SUPABASE_URL é obrigatória para validar o JWT do Supabase Auth',
      );
    }
    jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
  }
  return jwks;
}

function extractUserId(payload: JWTPayload): string {
  if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
    throw new UnauthorizedException('token sem sub válido');
  }
  return payload.sub;
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('token ausente');
    }
    const token = authHeader.slice('Bearer '.length);

    try {
      const { payload } = await jwtVerify(token, getJwks());
      request.userId = extractUserId(payload);
      return true;
    } catch {
      throw new UnauthorizedException('token inválido ou expirado');
    }
  }
}
