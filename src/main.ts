import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
			cors: true,
		}),
		cfgSvc = app.get(ConfigService);
	await app.use(cookieParser()).listen(cfgSvc.get('PORT'));
}
bootstrap();
