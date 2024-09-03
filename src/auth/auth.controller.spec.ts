import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DeviceService } from 'device/device.service';
import { Request, Response } from 'express';
import { TestModule } from 'module/test.module';
import { createRequest, createResponse } from 'node-mocks-http';
import { UserRecieve } from 'user/user.dto';
import { User } from 'user/user.entity';
import { hash } from 'utils';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthModule } from './auth.module';
import { AuthService, UserMetadata } from './auth.service';

describe('AuthauthCon', () => {
	const usr = User.test;

	let authCon: AuthController,
		authSvc: AuthService,
		dvcSvc: DeviceService,
		authMdw: AuthMiddleware,
		cfgSvc: ConfigService,
		req: Request,
		res: Response,
		acsKey: string,
		rfsKey: string,
		ckiSfx: string;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AuthModule, TestModule],
		}).compile();

		(authCon = module.get(AuthController)),
			(cfgSvc = module.get(ConfigService)),
			(authSvc = module.get(AuthService)),
			(dvcSvc = module.get(DeviceService)),
			(authMdw = new AuthMiddleware(authSvc, cfgSvc));

		(req = createRequest()),
			(res = createResponse()),
			(acsKey = cfgSvc.get('ACCESS_KEY')),
			(rfsKey = cfgSvc.get('REFRESH_KEY')),
			(ckiSfx = cfgSvc.get('SERVER_COOKIE_PREFIX'));
	});

	it('be defined', () => expect(authCon).toBeDefined());

	describe('signup', () => {
		it('call authSvc.signup and sendBack', () => {
			const usrRcv = UserRecieve.test,
				next = async () => {
					jest.spyOn(authSvc, 'signUp').mockResolvedValue(usrRcv),
						jest.spyOn(authCon, 'sendBack').mockImplementation();
					await authCon.signUp(req, usr, res),
						expect(authSvc.signUp).toHaveBeenCalledWith(
							usr,
							expect.any(UserMetadata),
						),
						expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});
	});

	describe('login', () => {
		it('call authSvc.login and sendBack', () => {
			const usrRcv = UserRecieve.test,
				next = async () => {
					jest.spyOn(authSvc, 'login').mockResolvedValue(usrRcv),
						jest.spyOn(authCon, 'sendBack').mockImplementation();
					await authCon.login(req, usr, res),
						expect(authSvc.login).toHaveBeenCalledWith(
							usr,
							expect.any(UserMetadata),
						),
						expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});
	});

	describe('logout', () => {
		it('clear all cookies and delete device session from databse', async () => {
			req.user = { id: 'a' };

			jest.spyOn(authCon, 'clearCookies').mockImplementation(),
				jest.spyOn(dvcSvc, 'delete').mockImplementation();
			await authCon.logout(req, res),
				expect(authCon.clearCookies).toHaveBeenCalledWith(req, res),
				expect(dvcSvc.delete).toHaveBeenCalledWith({ id: req.user['id'] });
		});
	});

	describe('refresh', () => {
		it('call dvcSvc.getTokens and sendBack if req.user.success is false', () => {
			const usrRcv = UserRecieve.test,
				next = async () => {
					req.user = { success: false, userId: 'user_id' };

					jest.spyOn(dvcSvc, 'getTokens').mockResolvedValue(usrRcv),
						jest.spyOn(authCon, 'sendBack').mockImplementation();
					await authCon.refresh(req, res),
						expect(dvcSvc.getTokens).toHaveBeenCalledWith(
							req.user['userId'],
							expect.any(UserMetadata),
						),
						expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});

		it('call sendBack if req.user.success is true and compareSync is true', () => {
			const next = async () => {
				req.user = {
					success: true,
					ua: hash(new UserMetadata(req).toString()),
				};

				jest.spyOn(authCon, 'sendBack').mockImplementation();
				await authCon.refresh(req, res),
					expect(authCon.sendBack).toHaveBeenCalledWith(
						req,
						res,
						expect.any(UserRecieve),
					);
			};
			authMdw.use(req, res, next);
		});
	});

	describe('clearCookies', () => {
		it('call res.clearCookie twice', () => {
			let acs: string, rfs: string;
			req.cookies[`${(acs = ckiSfx + hash(acsKey))}`] =
				randomBytes(6).toString();
			req.cookies[`${(rfs = ckiSfx + hash(rfsKey))}`] =
				randomBytes(6).toString();

			jest.spyOn(res, 'clearCookie');
			authCon.clearCookies(req, res),
				expect(res['cookies'][acs].value).toBe(''),
				expect(res['cookies'][rfs].value).toBe(''),
				expect(res.clearCookie).toHaveBeenCalledTimes(2);
		});
	});

	describe('sendBack', () => {
		it('call clearCookies once and res.cookie twice', () => {
			jest.spyOn(authCon, 'clearCookies').mockImplementation(),
				jest.spyOn(res, 'cookie');
			authCon.sendBack(req, res, UserRecieve.test),
				expect(authCon.clearCookies).toHaveBeenCalledWith(req, res),
				expect(res.cookie).toHaveBeenCalledTimes(2),
				expect(res['cookies']).toBeDefined();
		});
	});
});
