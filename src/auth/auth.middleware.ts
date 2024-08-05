import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { getClientIp } from 'request-ip';
import uaParserJs from 'ua-parser-js';

function generateFingerprint(req: Request) {
	return { ip: getClientIp(req), ua: uaParserJs.UAParser() };
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	async use(req: Request, next: NextFunction) {
		req['fingerprint'] = generateFingerprint(req);

		next();
	}
}
