import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeviceService } from 'device/device.service';
import { Request, Response } from 'express';
import { TestModule } from 'module/test.module';
import { createMocks } from 'node-mocks-http';
import { execute } from 'test.utils';
import { User } from 'user/user.entity';
import { UserService } from 'user/user.service';
import { tstStr } from 'utils';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';

const fileName = curFile(__filename);

let authCon: AuthController,
	dvcSvc: DeviceService,
	usrSvc: UserService,
	req: Request,
	res: Response,
	usr: User;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [AuthModule, TestModule],
	}).compile();

	(authCon = module.get(AuthController)),
		(dvcSvc = module.get(DeviceService)),
		(usrSvc = module.get(UserService));
});

beforeEach(() => {
	({ req, res } = createMocks({})), (usr = User.test(fileName));
});

describe('signup', () => {
	it('success', async () => {
		(await execute(authCon.signUp(req, usr, res, ''))).toEqual(true);
		(await execute(usrSvc.findOne({ email: usr.email }))).toBeInstanceOf(User);
	});

	it('fail due to email already exist', async () => {
		await authCon.signUp(req, usr, res, '');
		(await execute(authCon.signUp(req, usr, res, ''), true)).toThrow(
			BadRequestException,
		);
	});
});

describe('login', () => {
	it('success', async () => {
		await authCon.signUp(req, usr, res, '');

		(await execute(authCon.login(req, usr, res, ''))).toEqual(true);
		(await execute(dvcSvc.find({ owner: { email: usr.email } }))).toHaveLength(
			2,
		);
	});

	it('fail due to wrong password', async () => {
		await authCon.signUp(req, usr, res, '');
		usr = new User({ ...usr, password: tstStr() });

		(await execute(authCon.login(req, usr, res, ''), true)).toThrow(
			BadRequestException,
		);
	});
});
