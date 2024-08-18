import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Request } from 'express';
import { createRequest } from 'node-mocks-http';
import { DeviceSession } from 'src/device/device.entity';
import { DeviceService } from 'src/device/device.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { TestModule } from 'test/test.module';
import { Repository } from 'typeorm';
import UAParser from 'ua-parser-js';
import { LogInDto, SignUpDto } from './auth.dto';
import { AuthMiddleware } from './auth.middleware';
import { AuthModule } from './auth.module';
import { AuthService, UserMetadata } from './auth.service';

jest.mock('ua-parser-js');

describe('AuthService', () => {
	const ua = { test: 'test' };

	(UAParser.UAParser as unknown as jest.Mock).mockReturnValue(ua);

	let authSvc: AuthService,
		authMdw: AuthMiddleware,
		usrSvc: UserService,
		req: Request,
		dvcSvc: DeviceService,
		cfgSvc: ConfigService,
		dvcRepo: Repository<DeviceSession>,
		usrRepo: Repository<User>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
		}).compile();

		(authSvc = module.get(AuthService)),
			(cfgSvc = module.get(ConfigService)),
			(authMdw = new AuthMiddleware(authSvc, cfgSvc)),
			(usrSvc = module.get(UserService)),
			(dvcSvc = module.get(DeviceService)),
			(dvcRepo = module.get(getRepositoryToken(DeviceSession))),
			(usrRepo = module.get(getRepositoryToken(User)));

		req = createRequest();
	});

	it('should be defined', () => expect(authSvc).toBeDefined());

	describe('signup', () => {
		let dto: SignUpDto, mtdt: UserMetadata, usr: User;
		beforeEach(() => {
			(usr = User.test),
				(dto = new SignUpDto({ ...usr })),
				(mtdt = UserMetadata.test);
		});

		it('should create a new user and return tokens', async () => {
			jest.spyOn(usrSvc, 'findOne'),
				jest.spyOn(usrSvc, 'save'),
				jest.spyOn(dvcSvc, 'getTokens');
			await authSvc.signup(dto, mtdt),
				expect(usrSvc.findOne).toHaveBeenCalledWith({ email: dto.email }),
				expect(usrSvc.save).toHaveBeenCalledWith(dto),
				expect(dvcSvc.getTokens).toHaveBeenCalledWith(expect.any(String), mtdt);
		});

		it('should throw a BadRequestException if the email is already assigned', async () => {
			await authSvc.signup(dto, mtdt);
			await expect(authSvc.signup(dto, mtdt)).rejects.toThrow(
				BadRequestException,
			);
		});

		afterEach(async () => {
			usr = await usrSvc.findOne({ id: usr.id });
			usr.deviceSessions.forEach(
				async (i) => await dvcSvc.delete({ id: i.id }),
			);
			await usrSvc.delete({ id: usr.id });
		});
	});

	describe('login', () => {
		let dto: LogInDto, mtdt: UserMetadata, usr: User;
		beforeEach(async () => {
			(usr = User.test),
				(dto = new LogInDto({ ...usr })),
				(mtdt = UserMetadata.test);
			await authSvc.signup(new SignUpDto({ ...usr }), mtdt);
		});

		it('should return tokens for a valid user', async () => {
			jest.spyOn(usrSvc, 'findOne'), jest.spyOn(dvcSvc, 'getTokens');
			await authSvc.login(dto, mtdt),
				expect(usrSvc.findOne).toHaveBeenCalledWith({ email: dto.email }),
				expect(dvcSvc.getTokens).toHaveBeenCalledWith(expect.any(String), mtdt);
		});

		it('should throw a BadRequestException for an invalid user', async () => {
			dto.password += '0';
			await expect(authSvc.login(dto, mtdt)).rejects.toThrow(
				BadRequestException,
			);
		});

		afterEach(async () => {
			usr = await usrSvc.findOne({ id: usr.id });
			usr.deviceSessions.forEach(
				async (i) => await dvcSvc.delete({ id: i.id }),
			);
			await usrSvc.delete({ id: usr.id });
		});
	});

	describe('encrypt and decrypt', () => {
		it('should encrypt and decrypt a string', () => {
			const text = 'hello, world!',
				key = 'my_secret_key',
				encrypted = authSvc.encrypt(text, key),
				decrypted = authSvc.decrypt(encrypted, key);
			expect(decrypted).toEqual(text);
		});
	});
});
