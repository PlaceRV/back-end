import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: false,
	});
	await app.use(cookieParser()).listen(3000);
}
bootstrap();
