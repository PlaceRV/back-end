import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import http from 'http';
import https from 'https';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';

async function bootstrap() {
	const httpsOptions = {
			key: readFileSync('./secrets/key.pem'),
			cert: readFileSync('./secrets/cert.pem'),
		},
		server = express(),
		app = (
			await NestFactory.create(AppModule, new ExpressAdapter(server), {
				cors: {
					origin: [
						/^https:\/\/([.\w]*)(anhvietnguyen.id.vn)(:[0-9]+)?\/?(\/[.\w]*)*$/,
					],
					methods: '*',
					credentials: true,
				},
			})
		).use(cookieParser()),
		cfgSvc = app.get(ConfigService),
		admin = new AdminJS({}),
		adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
			authenticate(email, password, context) {
				return email === cfgSvc.get('ADMIN_EMAIL') &&
					password === cfgSvc.get('ADMIN_PASSWORD')
					? Promise.resolve({ email, password })
					: null;
			},
			cookieName: 'adminjs',
			cookiePassword: 'sessionsecret',
		});

	// Init multiple connection type
	await app.use(admin.options.rootPath, adminRouter).init();
	http.createServer(server).listen(cfgSvc.get('PORT'));
	https.createServer(httpsOptions, server).listen(2053);
}

bootstrap();
