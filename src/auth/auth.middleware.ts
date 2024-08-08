import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getClientIp } from 'request-ip';
import uaParserJs from 'ua-parser-js';
import { compareSync } from 'bcrypt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

function generateFingerprint(req: Request) {
	return { ip: getClientIp(req), ua: uaParserJs.UAParser() };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(
		private authSvc: AuthService,
		private cfgSvc: ConfigService,
	) {}
	private readonly refreshUrl = '/auth/refreshToken';

	use(req: Request, res: Response, next: NextFunction) {
		req['fingerprint'] = generateFingerprint(req);
		const refresh = req.url === this.refreshUrl;

		var tkn: string, rfrshTkn: string;
		for (const cki in req.cookies) {
			if (compareSync(this.cfgSvc.get('REFRESH'), cki)) rfrshTkn = req.cookies[cki];
			else if (compareSync(this.cfgSvc.get('ACCESS'), cki)) tkn = req.cookies[cki];
		}

		const tknPld = this.authSvc.decrypt(tkn);
		req.headers.authorization = `Bearer ${refresh ? this.authSvc.decrypt(rfrshTkn, tknPld.split('.')[2]) : tknPld}`;

		next();
	}
}
