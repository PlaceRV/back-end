import { Module } from '@nestjs/common';
import { AuthSvc } from './auth.service';
import { AuthResolv } from './auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt.stategy';

@Module({
  imports: [
    // Authencation secure
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        return {
          secret: cfg.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: cfg.get<string>('JWT_EXPIRES'),
          },
        };
      },
    }),
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthResolv, AuthSvc, JwtStrategy],
})
export class AuthModule {}
