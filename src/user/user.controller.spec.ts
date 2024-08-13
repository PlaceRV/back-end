import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { createRequest } from 'node-mocks-http';
import { User } from './user.entity';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
	let usrCon: UserController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
		}).compile();

		usrCon = module.get<UserController>(UserController);
	});

	it('should be defined', () => expect(usrCon).toBeDefined());

	describe('getUser', () => {
		it("should return user's infomation", () => {
			const user = { firstName: 'a', lastName: 'a', email: 'a' } as User,
				req = createRequest({ user });
			expect(usrCon.getUser(req)).toEqual(user);
		});

		it('should return error', () => {
			const req = createRequest();
			expect(usrCon.getUser(req)).toThrow(BadRequestException);
		});
	});
});
