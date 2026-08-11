import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token Bearer no proporcionado');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Validar firma y vigencia del token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super_secret_key_123456789',
      });

      // Inyectar datos del usuario verificado en las cabeceras HTTP hacia los microservicios
      req.headers['x-user-id'] = payload.sub || payload.userId;
      req.headers['x-user-role'] = payload.role || 'USER';

      next();
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}