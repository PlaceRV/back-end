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

		var token: string;
		for (const cki in req.cookies) {
			if (compareSync(this.cfgSvc.get('REFRESH'), cki) && req.url === this.refreshUrl)
				token = req.cookies[cki];
			else if (compareSync(this.cfgSvc.get('ACCESS'), cki) && req.url !== this.refreshUrl)
				token = req.cookies[cki];
		}
		req.headers.authorization = `Bearer ${this.authSvc.decrypt(token)}`;
		
		next();
	}
}
