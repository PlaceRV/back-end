import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { TestModule } from 'test/test.module';
import { UserModule } from './user.module';
import { Role, User } from './user.entity';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';

describe('UserResolver', () => {
	let usrRsv: UserResolver, usrSvc: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, UserModule],
		}).compile();

		(usrRsv = module.get(UserResolver)), (usrSvc = module.get(UserService));
	});

	it('should be defined', () => expect(usrRsv).toBeDefined());

	describe('findOne', () => {
		it('should return a user', async () => {
			const user = User.test;
			jest.spyOn(usrSvc, 'findOne').mockResolvedValue(user);
			expect(await usrRsv.findOne('1')).toEqual(user);
			expect(usrSvc.findOne).toHaveBeenCalledWith({ id: '1' });
		});

		it('should throw a BadRequestException if user not found', async () => {
			jest.spyOn(usrSvc, 'findOne').mockResolvedValue(null);
			await expect(usrRsv.findOne('1')).rejects.toThrow(BadRequestException),
				expect(usrSvc.findOne).toHaveBeenCalledWith({ id: '1' });
		});
	});

	describe('findAll', () => {
		it('should return all users', async () => {
			const users: User[] = [User.test, User.test];
			jest.spyOn(usrSvc, 'find').mockResolvedValue(users);
			expect(await usrRsv.findAll()).toEqual(users);
			expect(usrSvc.find).toHaveBeenCalled();
		});
	});
});
