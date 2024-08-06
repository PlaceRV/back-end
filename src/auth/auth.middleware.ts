import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getClientIp } from 'request-ip';
import uaParserJs from 'ua-parser-js';
import { compareSync } from 'bcrypt';
import { AuthService } from './auth.service';

function generateFingerprint(req: Request) {
	return { ip: getClientIp(req), ua: uaParserJs.UAParser() };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private authSvc: AuthService) {}

	use(req: Request, res: Response, next: NextFunction) {
		req['fingerprint'] = generateFingerprint(req);

		var u: boolean;
		for (const cki in req.cookies)
			if ((u = compareSync('refresh', cki)) || compareSync('access', cki)) {
				req.headers.authorization = `Bearer ${this.authSvc.decrypt(req.cookies[cki])}`;
				if (req.url === '/auth/refresh' && u) next();
			}

		next();
	}
}
