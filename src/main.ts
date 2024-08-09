import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
			cors: {
				origin: 'https://tmplrv.github.io',
				methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
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
	await app.use(cookieParser()).listen(cfgSvc.get('PORT'));
}
bootstrap();
