import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { TestModule } from 'test/test.module';
import { UserModule } from './user.module';

describe('UserResolver', () => {
	let usrRsv: UserResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, UserModule],
		}).compile();

		usrRsv = module.get(UserResolver);
	});

	it('should be defined', () => {
		expect(usrRsv).toBeDefined();
	});
});
