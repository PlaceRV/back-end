import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SignUpDto } from 'src/auth/auth.dto';
import { TestModule } from './test.module';
import { AuthModule } from 'src/auth/auth.module';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { DeviceSession } from 'src/device/device.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AppController (e2e)', () => {
	let app: INestApplication,
		usrRepo: Repository<User>,
		dvcRepo: Repository<DeviceSession>;
	const payload: SignUpDto = {
		firstName: 'a',
		lastName: 'a',
		email: 'a@a.gmail.com',
		password: 'a',
	};

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
		}).compile();

		(app = moduleFixture.createNestApplication()),
			(usrRepo = moduleFixture.get(getRepositoryToken(User))),
			(dvcRepo = moduleFixture.get(getRepositoryToken(DeviceSession)));
		await app.init();
	});

	it('/auth/signup (POST)', () =>
		request(app.getHttpServer())
			.post('/auth/signup')
			.send(payload)
			.expect(201));

	it('/auth/login (POST)', () =>
		request(app.getHttpServer()).post('/auth/login').send(payload).expect(201));

	afterAll(async () => {
		const usrs = await usrRepo.find(),
			dvcs = await dvcRepo.find();
		for (const dvc of dvcs) await dvcRepo.delete(dvc);
		for (const usr of usrs) await usrRepo.delete({ id: usr.id });
	});
});
