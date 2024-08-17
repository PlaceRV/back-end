import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessStrategy } from './strategies/access.stategy';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { DeviceModule } from 'src/device/device.module';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [
		// Authencation
		PassportModule.register({ session: true }),
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (cfgSvc: ConfigService) => {
				return {
					secret: cfgSvc.get('ACCESS_SECRET'),
					signOptions: {
						expiresIn: cfgSvc.get('ACCESS_EXPIRES'),
					},
				};
			},
		}),
		// Foreign modules
		forwardRef(() => DeviceModule),
		forwardRef(() => UserModule),
	],
	providers: [
		AuthService,
		// Strategies
		AccessStrategy,
		RefreshStrategy,
	],
	controllers: [AuthController],
	exports: [AuthService],
})
export class AuthModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes(AuthController);
	}
}
