import { readFileSync } from 'fs';
import http from 'http';
import https from 'https';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { validate } from 'class-validator';
import cookieParser from 'cookie-parser';
import express from 'express';
import { AppModule } from './app.module';
import { Device } from './device/device.entity';
import { Place } from './place/place.entity';
import { User } from './user/user.entity';

async function bootstrap() {
	const httpsOptions = {
			key: readFileSync('./secrets/key.pem'),
			cert: readFileSync('./secrets/cert.pem'),
		},
		{ AdminJS } = await import('adminjs'),
		{ buildAuthenticatedRouter } = await import('@adminjs/express'),
		{ Database, Resource } = await import('@adminjs/typeorm'),
		server = express(),
		app = (await NestFactory.create(AppModule, new ExpressAdapter(server)))
			.use(cookieParser())
			.useGlobalPipes(new ValidationPipe()),
		cfgSvc = app.get(ConfigService);
	Resource.validate = validate;
	AdminJS.registerAdapter({ Resource, Database });
	const admin = new AdminJS({ resources: [User, Device, Place] }),
		adminRouter = buildAuthenticatedRouter(
			admin,
			{
				authenticate(email, password) {
					return email === cfgSvc.get('ADMIN_EMAIL') &&
						password === cfgSvc.get('ADMIN_PASSWORD')
						? Promise.resolve({ email, password })
						: null;
				},
				cookieName: 'adminjs',
				cookiePassword: 'sessionsecret',
			},
			null,
			{ resave: false, saveUninitialized: false },
		);

	// Init multiple connection type
	await app.use(admin.options.rootPath, adminRouter).init();
	http.createServer(server).listen(cfgSvc.get('SERVER_PORT'));
	https.createServer(httpsOptions, server).listen(2053);
}

bootstrap();
