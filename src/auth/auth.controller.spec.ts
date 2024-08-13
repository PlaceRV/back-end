import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { DeviceService, UserRecieve } from 'src/device/device.service';
import { SignUpDto } from './auth.dto';
import { TestModule } from 'test/test.module';
import { AuthService, UserMetadata } from './auth.service';
import { AuthMiddleware } from './auth.middleware';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { createRequest, createResponse } from 'node-mocks-http';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';

describe('AuthauthCon', () => {
	const firstName = 'dsaphfijpadhf',
		lastName = 'ewrohqpewor',
		password = 'sdfoewqropiur',
		email = 'oieuwpqoru@gmail.com';

	let authCon: AuthController,
		authSvc: AuthService,
		dvcSvc: DeviceService,
		authMdw: AuthMiddleware,
		cfgSvc: ConfigService,
		req: Request,
		res: Response;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AuthModule, TestModule],
		}).compile();

		(authCon = module.get(AuthController)),
			(cfgSvc = module.get(ConfigService)),
			(authSvc = module.get(AuthService)),
			(dvcSvc = module.get(DeviceService)),
			(authMdw = new AuthMiddleware(authSvc, cfgSvc));

		(req = createRequest()), (res = createResponse());
	});

	it('should be defined', () => expect(authCon).toBeDefined());

	describe('signup', () => {
		it('should call authSvc.signUp and sendBack', () => {
			const dto: SignUpDto = { email, password, firstName, lastName },
				usrRcv = new UserRecieve('', ''),
				next = async () => {
					jest.spyOn(authSvc, 'signUp').mockResolvedValue(usrRcv);
					jest.spyOn(authCon, 'sendBack').mockImplementation();
					await authCon.signup(req, dto, res);
					expect(authSvc.signUp).toHaveBeenCalledWith(
						dto,
						expect.any(UserMetadata),
					);
					expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});
	});

	describe('logIn', () => {
		it('should call authSvc.logIn and sendBack', () => {
			const dto = { email, password },
				usrRcv = new UserRecieve('', ''),
				next = async () => {
					jest.spyOn(authSvc, 'logIn').mockResolvedValue(usrRcv);
					jest.spyOn(authCon, 'sendBack').mockImplementation();
					await authCon.logIn(req, dto, res);
					expect(authSvc.logIn).toHaveBeenCalledWith(
						dto,
						expect.any(UserMetadata),
					);
					expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});
	});

	describe('refresh', () => {
		it('should call dvcSvc.getTokens and sendBack if req.user.success is false', () => {
			const usrRcv = new UserRecieve('', ''),
				next = async () => {
					req.user = { success: false, userId: 'user_id' };

					jest.spyOn(dvcSvc, 'getTokens').mockResolvedValue(usrRcv);
					jest.spyOn(authCon, 'sendBack').mockImplementation();
					await authCon.refresh(req, res);
					expect(dvcSvc.getTokens).toHaveBeenCalledWith(
						req.user['userId'],
						expect.any(UserMetadata),
					);
					expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});

		it('should call sendBack if req.user.success is true and compareSync is true', () => {
			const next = async () => {
				req.user = {
					success: true,
					ua: authSvc.hash(new UserMetadata(req).toString()),
				};

				jest.spyOn(authCon, 'sendBack').mockImplementation();
				await authCon.refresh(req, res);
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
		it('should call res.clearCookie twice', () => {
			let acs: string, rfs: string;
			req.cookies[`${(acs = authSvc.hash(cfgSvc.get('ACCESS')))}`] =
				randomBytes(6).toString();
			req.cookies[`${(rfs = authSvc.hash(cfgSvc.get('REFRESH')))}`] =
				randomBytes(6).toString();

			authCon.clearCookies(req, res);
			expect(res['cookies'][acs].value).toBe('');
			expect(res['cookies'][rfs].value).toBe('');
		});
	});

	describe('sendBack', () => {
		it('should call clearCookies once and res.cookie twice', () => {
			jest.spyOn(authCon, 'clearCookies').mockImplementation();
			jest.spyOn(res, 'cookie');
			authCon.sendBack(req, res, new UserRecieve('', ''));
			expect(authCon.clearCookies).toHaveBeenCalledWith(req, res);
			expect(res.cookie).toHaveBeenCalledTimes(2);
		});
	});
});
