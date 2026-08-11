import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  login(@Body() body: { username: string }) {
    if (!body.username) {
      throw new UnauthorizedException('Debe ingresar un usuario');
    }

    // Firma un token básico con duración de 1 hora
    const payload = { sub: body.username, role: 'ADMIN' };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Autenticación exitosa',
      access_token: accessToken,
    };
  }
}