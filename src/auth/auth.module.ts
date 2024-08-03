import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.stategy';
import { AuthResolver } from './auth.resolver';
import { DeviceService } from 'src/device/device.service';
import { DeviceSession } from 'src/device/device.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, DeviceSession]),
		// Authencation
		PassportModule.register({ session: true }),
		JwtModule.registerAsync({
			global: true,
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
	],
	providers: [
		AuthService,
		AuthResolver,
		// Foreign service
		UserService,
		JwtStrategy,
		DeviceService,
	],
})
export class AuthModule {}
