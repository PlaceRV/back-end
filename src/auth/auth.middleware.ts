import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getClientIp } from 'request-ip';
import uaParserJs from 'ua-parser-js';
import { compareSync } from 'bcrypt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { lookup } from 'geoip-lite';

export function generateFingerprint(req: Request) {
	const ipAddress = getClientIp(req);
	return {
		ipAddress: ipAddress,
		userAgent: uaParserJs.UAParser(),
		maxmindData: lookup(ipAddress),
	};
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		private authSvc: AuthService,
		private cfgSvc: ConfigService,
	) {}
	private readonly rfsGrd = /\/?([.\w]*)\/(logout|refresh[tT]oken)/g;
	private readonly ckiPfx = this.cfgSvc.get('SERVER_COOKIE_PREFIX');
	private readonly rfsKey = this.cfgSvc.get('REFRESH_KEY');
	private readonly acsKey = this.cfgSvc.get('ACCESS_KEY');

	use(req: Request, res: Response, next: NextFunction) {
		req['fingerprint'] = generateFingerprint(req);
		const isRefresh = req.url.match(this.rfsGrd);

		let acsTkn: string, rfsTkn: string;
		for (const cki in req.cookies)
			if (compareSync(this.rfsKey, cki.substring(this.ckiPfx.length)))
				rfsTkn = req.cookies[cki];
			else if (compareSync(this.acsKey, cki.substring(this.ckiPfx.length)))
				acsTkn = req.cookies[cki];

		const tknPld = this.authSvc.decrypt(acsTkn);
		req.headers.authorization = `Bearer ${isRefresh ? this.authSvc.decrypt(rfsTkn, tknPld.split('.')[2]) : tknPld}`;

		next();
	}
}
