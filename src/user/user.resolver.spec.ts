import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from 'module/test.module';
import { User } from './user.entity';
import { UserModule } from './user.module';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

const fileName = curFile(__filename);
let usrRsv: UserResolver, usrSvc: UserService;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, UserModule],
	}).compile();

	(usrRsv = module.get(UserResolver)), (usrSvc = module.get(UserService));
});

describe('findOne', () => {
	it('return a user', async () => {
		const user = User.test(fileName);
		jest.spyOn(usrSvc, 'findOne').mockResolvedValue(user);
		expect(await usrRsv.findOne('1')).toEqual(user);
	});

	it('throw a BadRequestException if user not found', async () => {
		jest.spyOn(usrSvc, 'findOne').mockResolvedValue(null);
		await expect(usrRsv.findOne('1')).rejects.toThrow(BadRequestException);
	});
});

describe('findAll', () => {
	it('return all users', async () => {
		const users: User[] = [User.test(fileName), User.test(fileName)];
		jest.spyOn(usrSvc, 'find').mockResolvedValue(users);
		expect(await usrRsv.findAll()).toEqual(users);
		expect(usrSvc.find).toHaveBeenCalled();
	});
});
