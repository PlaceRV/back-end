import { TestModule } from '@backend/test';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from './user.module';
import { UserService } from './user.service';

describe('UserService', () => {
	let usrSvc: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, UserModule],
		}).compile();

		usrSvc = module.get(UserService);
	});

	it('be defined', () => expect(usrSvc).toBeDefined());
});
