import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { TestModule } from 'module/test.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { Repository } from 'typeorm';
import { execute } from 'utils/test.utils';
import { User } from './user.entity';
import { UserModule } from './user.module';

const fileName = curFile(__filename);
let app: INestApplication,
	usr: User,
	req: TestAgent,
	usrRepo: Repository<User>,
	headers: object,
	usrId: string;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [UserModule, TestModule],
	}).compile();

	(app = module.createNestApplication()),
		(usrRepo = module.get(getRepositoryToken(User)));

	await app.use(cookieParser()).init();
});

beforeEach(async () => {
	(req = request(app.getHttpServer())),
		(usr = User.test(fileName)),
		({ headers } = await req.post('/auth/signup').send(usr)),
		(usrId = (await usrRepo.findOne({ where: { email: usr.email } })).id);
});

describe('findOne', () => {
	it('return a user', async () => {
		await execute(
			() =>
				req
					.post('/graphql')
					.set('Cookie', headers['set-cookie'])
					.send({
						query: `
							query FindOne($findOneId: String!) {
								findOne(id: $findOneId) {
									description
									email
									firstName
									lastName
									roles
								}
							}`,
						variables: { findOneId: usrId },
					}),
			{},
			[
				{
					type: 'toHaveProperty',
					debug: true,
					params: ['text', JSON.stringify({ data: { findOne: usr.info } })],
				},
			],
		);
	});

	it('throw a BadRequestException if user not found', async () => {});
});

describe('findAll', () => {
	it('return all users', async () => {});
});
