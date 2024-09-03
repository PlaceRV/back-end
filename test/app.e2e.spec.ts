import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'auth/auth.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';
import { TestModule } from '../src/module/test.module';

describe('AppController (e2e)', () => {
	let app: INestApplication, req: TestAgent;
	const payload = User.test;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		await app.init();
		req = request(app.getHttpServer());
	});

	it('/auth/signup (POST)', () =>
		req.post('/auth/signup').send(payload).expect(201));

	it('/auth/login (POST)', async () =>
		req.post('/auth/login').send(payload).expect(201));
});
