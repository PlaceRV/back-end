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
			expect(usrSvc.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
		});

		it('should throw a BadRequestException if user not found', async () => {
			jest.spyOn(usrSvc, 'findOne').mockResolvedValue(null);
			await expect(usrRsv.findOne('1')).rejects.toThrow(BadRequestException);
			expect(usrSvc.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
		});
	});

	describe('findAll', () => {
		it('should return all users', async () => {
			const users: User[] = [
				{
					id: '1',
					firstName: 'a',
					roles: [Role.USER],
					password: 'a',
					deviceSessions: [],
					lastName: 'a',
					email: 'a',
					info: undefined,
				},
				{
					id: '2',
					firstName: 'b',
					roles: [Role.ADMIN],
					password: 'b',
					deviceSessions: [],
					lastName: 'b',
					email: 'b',
					info: undefined,
				},
			];
			jest.spyOn(usrSvc, 'find').mockResolvedValue(users);
			expect(await usrRsv.findAll()).toEqual(users);
			expect(usrSvc.find).toHaveBeenCalled();
		});
	});
});
