import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserMetadata } from 'auth/auth.service';
import { TestModule } from 'module/test.module';
import { UserRecieve } from 'user/user.dto';
import { User } from 'user/user.entity';
import { UserService } from 'user/user.service';
import { DeviceModule } from './device.module';
import { DeviceService } from './device.service';

describe('DeviceService', () => {
	let dvcSvc: DeviceService, jwtSvc: JwtService, usrSvc: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, DeviceModule],
		}).compile();

		(dvcSvc = module.get(DeviceService)),
			(jwtSvc = module.get(JwtService)),
			(usrSvc = module.get(UserService));
	});

	it('be defined', () => expect(dvcSvc).toBeDefined());

	describe('getTokens', () => {
		let mtdt: UserMetadata, usr: User;
		beforeEach(async () => {
			(mtdt = UserMetadata.test), (usr = await usrSvc.save(User.test));
		});

		it('create a new device session and return tokens', async () => {
			const usrRcv = UserRecieve.test;

			jest
				.spyOn(jwtSvc, 'sign')
				.mockReturnValueOnce(usrRcv.refreshToken)
				.mockReturnValueOnce(usrRcv.accessToken);

			const result = await dvcSvc.getTokens(usr, mtdt);

			expect(jwtSvc.sign).toHaveBeenCalledTimes(2),
				expect(result).toEqual(usrRcv);
		});
	});
});
