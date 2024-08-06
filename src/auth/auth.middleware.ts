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

	use(req: Request, res: Response, next: NextFunction) {
		req['fingerprint'] = generateFingerprint(req);

		let u: boolean = false;
		for (const cki in req.cookies)
			if (
				(u = u || compareSync(this.cfgSvc.get('REFRESH'), cki)) ||
				compareSync(this.cfgSvc.get('ACCESS'), cki)
			) {
				req.headers.authorization = `Bearer ${this.authSvc.decrypt(req.cookies[cki])}`;
				if (req.url === '/auth/refresh' && u) next();
			}

		if (!u) next();
	}
}
