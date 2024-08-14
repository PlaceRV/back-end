import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, UserMetadata } from './auth.service';
import { TestModule } from 'test/test.module';
import { AuthModule } from './auth.module';
import { Request } from 'express';
import { LogInDto, SignUpDto } from './auth.dto';
import { getClientIp } from 'request-ip';
import { lookup } from 'geoip-lite';
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

jest.mock('request-ip');
jest.mock('ua-parser-js');
jest.mock('geoip-lite');

describe('AuthService', () => {
	const firstName = 'dsaphfijpadhf',
		lastName = 'ewrohqpewor',
		password = 'sdfoewqropiur',
		email = 'oieuwpqoru@gmail.com',
		ip = '10.0.0.1',
		ua = { test: 'test' },
		geo = { country: 'VN' };

	(getClientIp as jest.Mock).mockReturnValue(ip),
		(UAParser.UAParser as unknown as jest.Mock).mockReturnValue(ua),
		(lookup as jest.Mock).mockReturnValue(geo);

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
				(mtdt = new UserMetadata({
					fingerprint: authMdw.generateFingerprint(req),
				} as unknown as Request));
		});

		it('should create a new user and return tokens', async () => {
			jest.spyOn(usrSvc, 'findOne');
			jest.spyOn(usrSvc, 'save');
			jest.spyOn(dvcSvc, 'getTokens');

			await authSvc.signup(dto, mtdt);
			const user = await usrRepo.findOne({ where: { email: dto.email } });

			expect(usrSvc.findOne).toHaveBeenCalledWith({
				where: { email: dto.email },
			});
			expect(usrSvc.save).toHaveBeenCalledWith(dto);
			expect(dvcSvc.getTokens).toHaveBeenCalledWith(user.id, mtdt);
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
			(dto = { email, password }),
				(mtdt = new UserMetadata({
					fingerprint: authMdw.generateFingerprint(req),
				} as unknown as Request));
		});

		it('should return tokens for a valid user', async () => {
			jest.spyOn(usrSvc, 'findOne');
			jest.spyOn(dvcSvc, 'getTokens');

			await authSvc.login(dto, mtdt);
			const user = await usrRepo.findOne({ where: { email: dto.email } });

			expect(usrSvc.findOne).toHaveBeenCalledWith({
				where: { email: dto.email },
			});
			expect(dvcSvc.getTokens).toHaveBeenCalledWith(user.id, mtdt);
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
			const text = 'hello, world!';
			const key = 'my_secret_key';

			const encrypted = authSvc.encrypt(text, key);
			const decrypted = authSvc.decrypt(encrypted, key);

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
