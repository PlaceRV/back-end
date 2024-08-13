import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import http from 'http';
import https from 'https';

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
						/anhvietnguyen\.id\.vn$/,
						/((http([s]){0,1}:\/\/){0,1}(localhost|127.0.0.1){1}(([:]){0,1}[\0-9]{4}){0,1}\/{0,1}){1}/g,
					],
					methods: '*',
					credentials: true,
				},
			})
		).use(cookieParser()),
		cfgSvc = app.get(ConfigService);

	// Update geoip databases
	exec(
		`node ./node_modules/geoip-lite/scripts/updatedb.js license_key=${cfgSvc.get('MAXMIND_LICENSE_KEY')}`,
		async (error, stdout, stderr) => {
			if (stdout) console.log("Update geoip's databases successfully");
			else console.error(error + stderr);
		},
	);

	// Init multiple connection type
	await app.init();
	http.createServer(server).listen(cfgSvc.get('PORT'));
	https.createServer(httpsOptions, server).listen(443);
}
bootstrap();
