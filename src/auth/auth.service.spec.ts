import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, UserMetadata } from './auth.service';
import { TestModule } from 'test/test.module';
import { AuthModule } from './auth.module';
import { Request } from 'express';
import { LogInDto, SignUpDto } from './auth.dto';
import UAParser from 'ua-parser-js';
import { AuthMiddleware } from './auth.middleware';
import { createRequest } from 'node-mocks-http';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { DeviceService } from 'src/device/device.service';
import { ConfigService } from '@nestjs/config';
import { DeviceSession } from 'src/device/device.entity';

jest.mock('ua-parser-js');

describe('AuthService', () => {
	const { firstName, lastName, password, email } = User.test,
		ua = { test: 'test' };

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
		let dto: SignUpDto, mtdt: UserMetadata;
		beforeAll(() => {
			(dto = { firstName, lastName, email, password }),
				(mtdt = UserMetadata.test);
		});

		it('should create a new user and return tokens', async () => {
			jest.spyOn(usrSvc, 'findOne'),
				jest.spyOn(usrSvc, 'save'),
				jest.spyOn(dvcSvc, 'getTokens');
			await authSvc.signup(dto, mtdt),
				expect(usrSvc.findOne).toHaveBeenCalledWith({
					where: { email: dto.email },
				}),
				expect(usrSvc.save).toHaveBeenCalledWith(dto),
				expect(dvcSvc.getTokens).toHaveBeenCalledWith(expect.any(String), mtdt);
		});

		it('should throw a BadRequestException if the email is already assigned', async () => {
			await expect(authSvc.signup(dto, mtdt)).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe('login', () => {
		let dto: LogInDto, mtdt: UserMetadata;
		beforeAll(() => {
			(dto = { email, password }), (mtdt = UserMetadata.test);
		});

		it('should return tokens for a valid user', async () => {
			jest.spyOn(usrSvc, 'findOne'), jest.spyOn(dvcSvc, 'getTokens');
			await authSvc.login(dto, mtdt),
				expect(usrSvc.findOne).toHaveBeenCalledWith({
					where: { email: dto.email },
				}),
				expect(dvcSvc.getTokens).toHaveBeenCalledWith(expect.any(String), mtdt);
		});

		it('should throw a BadRequestException for an invalid user', async () => {
			dto.password += '0';
			await expect(authSvc.login(dto, mtdt)).rejects.toThrow(
				BadRequestException,
			);
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

	afterAll(async () => {
		const usrs = await usrRepo.find(),
			dvcs = await dvcRepo.find();
		for (const dvc of dvcs) await dvcRepo.delete(dvc);
		for (const usr of usrs) await usrRepo.delete({ id: usr.id });
	});
});
