import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SignUpDto } from 'src/auth/auth.dto';
import { AuthModule } from 'src/auth/auth.module';
import { DeviceSession } from 'src/device/device.entity';
import { User } from 'src/user/user.entity';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { Repository } from 'typeorm';
import { TestModule } from './test.module';

describe('AppController (e2e)', () => {
	let app: INestApplication,
		usrRepo: Repository<User>,
		dvcRepo: Repository<DeviceSession>,
		req: TestAgent;
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
		req = request(app.getHttpServer());
	});

	it('/auth/signup (POST)', () =>
		req.post('/auth/signup').send(payload).expect(201));

	it('/auth/login (POST)', async () =>
		req.post('/auth/login').send(payload).expect(201));

	afterAll(async () => {
		const usrs = await usrRepo.find(),
			dvcs = await dvcRepo.find();
		for (const dvc of dvcs) await dvcRepo.delete(dvc);
		for (const usr of usrs) await usrRepo.delete({ id: usr.id });
	});
});
