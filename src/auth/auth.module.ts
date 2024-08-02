import { Module } from '@nestjs/common';
import { AuthSvc } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/jwt.stategy';

@Module({
  providers: [AuthResolver, AuthSvc, JwtStrategy],
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
    ConfigModule,
    TypeOrmModule.forFeature([User]),
  ],
})
export class AuthModule {}
