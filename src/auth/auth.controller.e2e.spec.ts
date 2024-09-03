import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from 'auth/auth.module';
import { TestModule } from 'module/test.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';

const fileName = curFile(__filename, 3),
	payload = User.test(fileName);
let app: INestApplication, req: TestAgent;

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
