import { Test, TestingModule } from '@nestjs/testing';
import { DeviceService, UserRecieve } from './device.service';
import { TestModule } from 'test/test.module';
import { DeviceModule } from './device.module';
import { AuthService, UserMetadata } from 'src/auth/auth.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DeepPartial, Repository } from 'typeorm';
import { DeviceSession } from './device.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

describe('DeviceService', () => {
	let dvcSvc: DeviceService,
		authMdw: AuthMiddleware,
		cfgSvc: ConfigService,
		authSvc: AuthService,
		jwtSvc: JwtService,
		usrSvc: UserService,
		usrRepo: Repository<User>,
		dvcRepo: Repository<DeviceSession>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, DeviceModule],
		}).compile();

		(dvcSvc = module.get(DeviceService)),
			(cfgSvc = module.get(ConfigService)),
			(authSvc = module.get(AuthService)),
			(authMdw = new AuthMiddleware(authSvc, cfgSvc)),
			(jwtSvc = module.get(JwtService)),
			(usrSvc = module.get(UserService)),
			(dvcRepo = module.get(getRepositoryToken(DeviceSession))),
			(usrRepo = module.get(getRepositoryToken(User)));
	});

	it('should be defined', () => expect(dvcSvc).toBeDefined());

	describe('getTokens', () => {
		let mtdt: UserMetadata, usr: DeepPartial<User>;
		beforeAll(async () => {
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
				expect(result).toEqual(usrRcv),
				expect((await dvcRepo.find()).length).toBe(1);
		});

		afterAll(async () => {
			const dvcs = await dvcRepo.find(),
				usrs = await usrRepo.find();
			for (const dvc of dvcs) await dvcRepo.delete(dvc);
			for (const usr of usrs) await usrRepo.delete({ id: usr.id });
		});
	});
});
