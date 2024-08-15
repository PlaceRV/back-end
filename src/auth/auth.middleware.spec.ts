import { Test, TestingModule } from '@nestjs/testing';
import { AuthMiddleware, generateFingerprint } from './auth.middleware';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { getClientIp } from 'request-ip';
import uaParserJs from 'ua-parser-js';
import { lookup } from 'geoip-lite';
import { TestModule } from 'test/test.module';
import { AuthModule } from './auth.module';
import { createRequest, createResponse } from 'node-mocks-http';

jest.mock('request-ip');
jest.mock('ua-parser-js');
jest.mock('geoip-lite');

describe('AuthMiddleware', () => {
	const ip = '10.0.0.1',
		ua = { test: 'test' },
		geo = { country: 'VN' },
		acsTkn = '..access-token',
		rfsTkn = 'refresh-token';

	(getClientIp as jest.Mock).mockReturnValue(ip),
		(uaParserJs.UAParser as unknown as jest.Mock).mockReturnValue(ua),
		(lookup as jest.Mock).mockReturnValue(geo);

	let next: NextFunction,
		req: Request,
		res: Response,
		authMdw: AuthMiddleware,
		authSvc: AuthService,
		cfgSvc: ConfigService,
		acsKey: string,
		rfsKey: string,
		ckiSfx: string;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
			providers: [AuthMiddleware],
		}).compile();

		(authMdw = module.get(AuthMiddleware)),
			(authSvc = module.get(AuthService)),
			(cfgSvc = module.get(ConfigService));

		(req = createRequest()),
			(res = createResponse()),
			(next = jest.fn()),
			(acsKey = cfgSvc.get('ACCESS_KEY')),
			(rfsKey = cfgSvc.get('REFRESH_KEY')),
			(ckiSfx = cfgSvc.get('SERVER_COOKIE_PREFIX'));
	});

	it('should be defined', () => expect(authMdw).toBeDefined());

	describe('generateFingerprint', () => {
		it('should generate a fingerprint object', () => {
			expect(generateFingerprint(req)).toEqual({
				ipAddress: ip,
				userAgent: ua,
				maxmindData: geo,
			});
		});
	});

	describe('use', () => {
		beforeEach(() => {
			req.cookies[`${ckiSfx + authSvc.hash(rfsKey)}`] = authSvc.encrypt(
				rfsTkn,
				acsTkn.split('.')[2],
			);
			req.cookies[`${ckiSfx + authSvc.hash(acsKey)}`] = authSvc.encrypt(acsTkn);
		});

		it('should set the request fingerprint and authorization header for refresh', () => {
			req.url = '/auth/refreshToken';
			authMdw.use(req, res, next),
				expect(req.headers.authorization).toBe(`Bearer ${rfsTkn}`),
				expect(next).toHaveBeenCalled();
		});

		it('should set the request fingerprint and authorization header for access', () => {
			authMdw.use(req, res, next),
				expect(req.headers.authorization).toBe(`Bearer ${acsTkn}`),
				expect(next).toHaveBeenCalled();
		});
	});
});
