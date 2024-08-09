import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { DeviceService, UserRecieve } from 'src/device/device.service';
import { SignUpDto } from './auth.dto';
import { TestModule } from 'test/test.module';
import { AuthService, UserMetadata } from './auth.service';
import { NextFunction } from 'express';
import { AuthMiddleware } from './auth.middleware';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { createRequest, createResponse } from 'node-mocks-http';

describe('AuthauthCon', () => {
	let authCon: AuthController,
		authSvc: AuthService,
		dvcSvc: DeviceService,
		authMdw: AuthMiddleware,
		cfgSvc: ConfigService;
	const firstName = 'dsaphfijpadhf',
		lastName = 'ewrohqpewor',
		password = 'sdfoewqropiur',
		email = 'oieuwpqoru@gmail.com';

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AuthModule, TestModule],
		}).compile();

		(authCon = module.get(AuthController)),
			(cfgSvc = module.get(ConfigService)),
			(authSvc = module.get(AuthService)),
			(dvcSvc = module.get(DeviceService)),
			(authMdw = new AuthMiddleware(authSvc, cfgSvc));
	});

	describe('signup', () => {
		it('should call authSvc.signUp and sendBack', async () => {
			let req = createRequest(),
				res = createResponse(),
				dto: SignUpDto = { email, password, firstName, lastName },
				userRecieve: UserRecieve,
				next = async () => {
					jest.spyOn(authSvc, 'signUp').mockResolvedValue(userRecieve);
					jest.spyOn(authCon, 'sendBack').mockImplementation();

					await authCon.signup(req, dto, res);

					expect(authSvc.signUp).toHaveBeenCalledWith(dto, expect.any(UserMetadata));
					expect(authCon.sendBack).toHaveBeenCalledWith(req, res, userRecieve);
				};
			authMdw.use(req, res, next);
		});
	});

	describe('login', () => {
		it('should call authSvc.login and sendBack', async () => {
			let req = createRequest(),
				res = createResponse(),
				dto = { email, password },
				usrRcv: UserRecieve,
				next = async () => {
					jest.spyOn(authSvc, 'login').mockResolvedValue(usrRcv);
					jest.spyOn(authCon, 'sendBack').mockImplementation();

					await authCon.login(req, dto, res);

					expect(authSvc.login).toHaveBeenCalledWith(dto, expect.any(UserMetadata));
					expect(authCon.sendBack).toHaveBeenCalledWith(req, res, usrRcv);
				};
			authMdw.use(req, res, next);
		});
	});

	describe('refresh', () => {
		it('should call dvcSvc.getTokens and sendBack if req.user.success is false', async () => {
			let req = createRequest({
					user: { success: false, userId: 'user_id' },
				}),
				res = createResponse(),
				userRecieve: UserRecieve;
			const next: NextFunction = async () => {
				jest.spyOn(dvcSvc, 'getTokens').mockResolvedValue(userRecieve);
				jest.spyOn(authCon, 'sendBack').mockImplementation();

				await authCon.refresh(req, res);

				expect(dvcSvc.getTokens).toHaveBeenCalledWith(req.user['userId'], expect.any(UserMetadata));
				expect(authCon.sendBack).toHaveBeenCalledWith(req, res, userRecieve);
			};
			authMdw.use(req, res, next);
		});

		it('should call sendBack if req.user.success is true and compareSync is true', async () => {
			let req = createRequest(),
				res = createResponse(),
				next = async () => {
					jest.spyOn(authCon, 'sendBack').mockImplementation();
					req.user = {
						success: true,
						userId: 'user_id',
						acsTkn: 'access_token',
						rfsTkn: 'refresh_token',
						ua: authSvc.hash(new UserMetadata(req).toString()),
					};

					await authCon.refresh(req, res);

					expect(authCon.sendBack).toHaveBeenCalledWith(req, res, expect.any(UserRecieve));
				};
			authMdw.use(req, res, next);
		});
	});
});
