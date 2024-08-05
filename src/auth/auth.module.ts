import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthService, EncryptionService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessStrategy } from './strategies/access.stategy';
import { DeviceService } from 'src/device/device.service';
import { DeviceSession } from 'src/device/device.entity';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';

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
					secret: cfg.get('JWT_ACCESS_SECRET'),
					signOptions: {
						expiresIn: cfg.get('JWT_ACCESS_EXPIRES'),
					},
				};
			},
		}),
	],
	providers: [
		AuthService,
		EncryptionService,
		// Foreign service
		UserService,
		AccessStrategy,
		DeviceService,
	],
	controllers: [AuthController],
})
export class AuthModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes(AuthController);
	}
}
