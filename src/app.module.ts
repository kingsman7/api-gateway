import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { BffController } from './bff/bff.controller';
import { AuthController } from './auth/auth.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super_secret_key_123456789',
      signOptions: { expiresIn: '1h' },
    }),
    HttpModule,
  ],
  controllers: [
    AppController,
    BffController,
    AuthController,
  ],
  providers:[
    AppService
  ]
})
export class AppModule {}