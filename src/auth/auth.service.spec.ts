import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeviceService } from 'device/device.service';
import { TestModule } from 'module/test.module';
import UAParser from 'ua-parser-js';
import { User } from 'user/user.entity';
import { UserService } from 'user/user.service';
import { AuthModule } from './auth.module';
import { AuthService, UserMetadata } from './auth.service';

jest.mock('ua-parser-js');

describe('AuthService', () => {
	const ua = { test: 'test' };

	(UAParser.UAParser as unknown as jest.Mock).mockReturnValue(ua);

	let authSvc: AuthService, usrSvc: UserService, dvcSvc: DeviceService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
		}).compile();

		(authSvc = module.get(AuthService)),
			(usrSvc = module.get(UserService)),
			(dvcSvc = module.get(DeviceService));
	});

	it('be defined', () => expect(authSvc).toBeDefined());

	describe('signup', () => {
		let mtdt: UserMetadata, usr: User;
		beforeEach(() => {
			(usr = User.test), (mtdt = UserMetadata.test);
		});

		it('create a new user and return tokens', async () => {
			jest.spyOn(usrSvc, 'findOne'),
				jest.spyOn(usrSvc, 'save'),
				jest.spyOn(dvcSvc, 'getTokens');
			await authSvc.signUp(usr, mtdt),
				expect(usrSvc.findOne).toHaveBeenCalledWith({ email: usr.email }),
				expect(usrSvc.save).toHaveBeenCalledWith(expect.objectContaining(usr)),
				expect(dvcSvc.getTokens).toHaveBeenCalledWith(
					expect.objectContaining(usr.info),
					mtdt,
				);
		});

		it('throw a BadRequestException if the email is already assigned', async () => {
			await authSvc.signUp(usr, mtdt);
			await expect(authSvc.signUp(usr, mtdt)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe('login', () => {
		let mtdt: UserMetadata, usr: User;
		beforeEach(async () => {
			(usr = User.test), (mtdt = UserMetadata.test);
			await authSvc.signUp(usr, mtdt);
		});

		it('return tokens for a valid user', async () => {
			jest.spyOn(usrSvc, 'findOne'), jest.spyOn(dvcSvc, 'getTokens');
			await authSvc.login(usr, mtdt),
				expect(usrSvc.findOne).toHaveBeenCalledWith({ email: usr.email }),
				expect(dvcSvc.getTokens).toHaveBeenCalledWith(
					expect.objectContaining(usr.info),
					mtdt,
				);
		});

		it('throw a BadRequestException for an invalid user', async () => {
			usr.password += '0';
			await expect(authSvc.login(usr, mtdt)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe('encrypt and decrypt', () => {
		it('encrypt and decrypt a string', () => {
			const text = 'hello, world!',
				key = 'my_secret_key',
				encrypted = authSvc.encrypt(text, key),
				decrypted = authSvc.decrypt(encrypted, key);
			expect(decrypted).toEqual(text);
		});
	});
});
