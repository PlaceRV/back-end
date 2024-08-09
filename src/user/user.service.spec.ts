import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { TestModule } from 'test/SQLModule';

describe('UserService', () => {
	let usrSvc: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: TestModule,
			providers: [UserService],
		}).compile();

		usrSvc = module.get(UserService);
	});

	it('should be defined', () => {
		expect(usrSvc).toBeDefined();
	});
});
