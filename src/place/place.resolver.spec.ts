import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { IPlaceInfoKeys } from 'models';
import { TestModule } from 'module/test.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { Role } from 'user/user.model';
import { execute } from 'utils/test.utils';
import { InterfaceCasting } from 'utils/utils';
import { Place } from './place.entity';
import { PlaceModule } from './place.module';

const fileName = curFile(__filename);

let app: INestApplication,
	headers: object,
	usr: User,
	usrRaw: User,
	usrRepo: Repository<User>,
	req: TestAgent,
	plc: Place;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, PlaceModule],
	}).compile();

	(app = module.createNestApplication()),
		(usrRepo = module.get(getRepositoryToken(User)));

	await app.use(cookieParser()).init();
});

beforeEach(async () => {
	(req = request(app.getHttpServer())),
		(usr = User.test(fileName)),
		({ headers } = await req.post('/auth/signup').send(usr)),
		(usrRaw = await usrRepo.findOne({ where: { email: usr.email } })),
		(plc = Place.test);
});

describe('placeCreate', () => {
	it('success', async () => {
		await usrRepo.save([{ id: usrRaw.id, roles: [Role.STAFF] }]);

		await execute(
			() =>
				req
					.post('/graphql')
					.set('Cookie', headers['set-cookie'])
					.send({
						query: `
							mutation PlaceCreate($placeAssign: PlaceAssign!) {
								placeCreate(placeAssign: $placeAssign) {
									description
									latitude
									longitude
									name
									type
								}
							}`,
						variables: {
							placeAssign: InterfaceCasting.quick(plc, IPlaceInfoKeys),
						},
					}),
			{},
			[
				{
					type: 'toHaveProperty',
					params: ['text', expect.stringContaining(JSON.stringify(plc.info))],
				},
				{ type: 'toHaveProperty', params: ['status', HttpStatus.OK] },
			],
		);
	});
});

describe('placeAll', () => {
	it('success', async () => {
		await execute(
			() =>
				req.post('/graphql').send({
					query: `
						query PlaceAll {
							placeAll {
								description
								latitude
								longitude
								name
								type
							}
						}`,
				}),
			{},
			[{ type: 'toHaveProperty', params: ['status', HttpStatus.OK] }],
		);
	});
});
