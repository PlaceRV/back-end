import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { readFileSync } from 'fs';

async function bootstrap() {
	const httpsOptions = {
			key: readFileSync('./secrets/key.pem'),
			cert: readFileSync('./secrets/cert.pem'),
		},
		app = await NestFactory.create(AppModule, {
			httpsOptions,
			cors: {
				origin: [
					/anhvietnguyen\.id\.vn$/,
					/((http([s]){0,1}:\/\/){0,1}(localhost|127.0.0.1){1}(([:]){0,1}[\0-9]{4}){0,1}\/{0,1}){1}/g,
				],
				methods: '*',
				credentials: true,
			},
		}),
		cfgSvc = app.get(ConfigService);
	exec(
		`node ./node_modules/geoip-lite/scripts/updatedb.js license_key=${cfgSvc.get('MAXMIND_LICENSE_KEY')}`,
		async (error, stdout, stderr) => {
			if (stdout) console.log("Update geoip's databases successfully");
			else console.error(error + stderr);
		},
	);
	await app.use(cookieParser()).listen(443);
}
bootstrap();
