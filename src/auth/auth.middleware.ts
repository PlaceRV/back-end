import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getClientIp } from 'request-ip';
import uaParserJs from 'ua-parser-js';
import { compareSync } from 'bcrypt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { lookup } from 'geoip-lite';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		private authSvc: AuthService,
		private cfgSvc: ConfigService,
	) {}
	private readonly refreshUrl = '/auth/refreshToken';

	generateFingerprint(req: Request) {
		const ipAddress = getClientIp(req);
		return {
			ipAddress: ipAddress,
			userAgent: uaParserJs.UAParser(),
			maxmindData: lookup(ipAddress),
		};
	}

	use(req: Request, res: Response, next: NextFunction) {
		req['fingerprint'] = this.generateFingerprint(req);
		const isRefresh = req.url === this.refreshUrl;

		var acsTkn: string, rfsTkn: string;
		for (const cki in req.cookies) {
			if (compareSync(this.cfgSvc.get('REFRESH'), cki)) rfsTkn = req.cookies[cki];
			else if (compareSync(this.cfgSvc.get('ACCESS'), cki)) acsTkn = req.cookies[cki];
		}

		const tknPld = this.authSvc.decrypt(acsTkn);
		req.headers.authorization = `Bearer ${isRefresh ? this.authSvc.decrypt(rfsTkn, tknPld.split('.')[2]) : tknPld}`;

		next();
	}
}
