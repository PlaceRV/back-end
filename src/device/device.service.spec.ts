import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { AuthService, UserMetadata } from 'src/auth/auth.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { TestModule } from 'test/test.module';
import { DeepPartial } from 'typeorm';
import { DeviceModule } from './device.module';
import { DeviceService, UserRecieve } from './device.service';

describe('DeviceService', () => {
	let dvcSvc: DeviceService,
		authMdw: AuthMiddleware,
		cfgSvc: ConfigService,
		authSvc: AuthService,
		jwtSvc: JwtService,
		usrSvc: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, DeviceModule],
		}).compile();

		(dvcSvc = module.get(DeviceService)),
			(cfgSvc = module.get(ConfigService)),
			(authSvc = module.get(AuthService)),
			(authMdw = new AuthMiddleware(authSvc, cfgSvc)),
			(jwtSvc = module.get(JwtService)),
			(usrSvc = module.get(UserService));
	});

	it('should be defined', () => expect(dvcSvc).toBeDefined());

	describe('getTokens', () => {
		let mtdt: UserMetadata, usr: DeepPartial<User>;
		beforeEach(async () => {
			(mtdt = UserMetadata.test), (usr = await usrSvc.save(User.test));
		});

		it('should create a new device session and return tokens', async () => {
			const usrRcv = UserRecieve.test;

			jest.spyOn(authSvc, 'hash'),
				jest
					.spyOn(jwtSvc, 'sign')
					.mockReturnValueOnce(usrRcv.refreshToken)
					.mockReturnValueOnce(usrRcv.accessToken);

			const result = await dvcSvc.getTokens(usr.id, mtdt);

			expect(jwtSvc.sign).toHaveBeenCalledTimes(2),
				expect(authSvc.hash).toHaveBeenCalledWith(mtdt.toString()),
				expect(result).toEqual(usrRcv);
		});
	});
});
