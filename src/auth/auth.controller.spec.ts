import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { DeviceService } from 'device/device.service';
import { TestModule } from 'module/test.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { execute } from 'test.utils';
import { User } from 'user/user.entity';
import { UserService } from 'user/user.service';
import { tstStr } from 'utils';
import { AuthModule } from './auth.module';

const fileName = curFile(__filename);

let dvcSvc: DeviceService,
	usrSvc: UserService,
	req: TestAgent,
	usr: User,
	app: INestApplication,
	rfsTms: number;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
			imports: [AuthModule, TestModule],
		}).compile(),
		cfgSvc = module.get(ConfigService);

	(dvcSvc = module.get(DeviceService)),
		(usrSvc = module.get(UserService)),
		(app = module.createNestApplication()),
		(rfsTms = cfgSvc.get('REFRESH_USE'));

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (usr = User.test(fileName));
});

describe('signup', () => {
	it('success', async () => {
		await execute(() => req.post('/auth/signup').send(usr), {}, [
			{
				type: 'toHaveProperty',
				params: [
					'headers.set-cookie',
					expect.arrayContaining([expect.anything(), expect.anything()]),
				],
			},
			{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
		]);

		await execute(() => usrSvc.findOne({ email: usr.email }), {}, [
			{ type: 'toBeInstanceOf', params: [User] },
		]);
	});

	it('fail due to email already exist', async () => {
		await req.post('/auth/signup').send(usr);

		await execute(() => req.post('/auth/signup').send(usr), {}, [
			{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
		]);
	});
});

describe('login', () => {
	beforeEach(async () => await req.post('/auth/signup').send(usr));

	it('success', async () => {
		await execute(() => req.post('/auth/login').send(usr), {}, [
			{
				type: 'toHaveProperty',
				params: [
					'headers.set-cookie',
					expect.arrayContaining([expect.anything(), expect.anything()]),
				],
			},
			{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
		]);

		await execute(() => dvcSvc.find({ owner: { email: usr.email } }), {}, [
			{ type: 'toHaveLength', params: [2] },
		]);
	});

	it('fail due to wrong password', async () => {
		usr = new User({ ...usr, password: tstStr() });

		await execute(() => req.post('/auth/login').send(usr), {}, [
			{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
		]);
	});
});

describe('logout', () => {
	let headers: object;

	beforeEach(
		async () => ({ headers } = await req.post('/auth/signup').send(usr)),
	);

	it('success', async () => {
		await execute(
			() => req.post('/auth/logout').set('Cookie', [...headers['set-cookie']]),
			{},
			[
				{
					type: 'toHaveProperty',
					params: ['headers.set-cookie', expect.arrayContaining([])],
				},
				{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
			],
		);

		await execute(() => dvcSvc.find({ owner: { email: usr.email } }), {}, [
			{ type: 'toHaveLength', params: [0] },
		]);
	});

	it('faild due to not have valid cookies', async () => {
		await execute(req.post, { params: ['/auth/logout'] }, [
			{ type: 'toHaveProperty', params: ['status', HttpStatus.UNAUTHORIZED] },
		]);
	});
});

describe('refresh', () => {
	let headers: object;

	beforeEach(
		async () => ({ headers } = await req.post('/auth/signup').send(usr)),
	);

	it('success', async () => {
		await execute(
			() => req.post('/auth/refresh').set('Cookie', [...headers['set-cookie']]),
			{},
			[
				{
					type: 'toHaveProperty',
					not: true,
					params: [
						'headers.set-cookie',
						expect.arrayContaining([...headers['set-cookie']]),
					],
				},
				{
					type: 'toHaveProperty',
					params: [
						'headers.set-cookie',
						expect.arrayContaining([expect.anything(), expect.anything()]),
					],
				},
				{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
			],
		);
	});

	it('faild due to not have valid cookies', async () => {
		await execute(req.post, { params: ['/auth/refresh'] }, [
			{ type: 'toHaveProperty', params: ['status', HttpStatus.UNAUTHORIZED] },
		]);
	});

	it('success in generate new key', async () => {
		await execute(
			async (headers: object) =>
				({ headers } = await req
					.post('/auth/refresh')
					.set('Cookie', [...headers['set-cookie']])),
			{ numOfRun: rfsTms * 1.2, params: [headers] },
			[
				{
					type: 'toHaveProperty',
					not: true,
					params: [
						'headers.set-cookie',
						expect.arrayContaining([...headers['set-cookie']]),
					],
				},
				{
					type: 'toHaveProperty',
					params: [
						'headers.set-cookie',
						expect.arrayContaining([expect.anything(), expect.anything()]),
					],
				},
				{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
			],
		);
	});
});
