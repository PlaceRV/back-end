import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from './auth.guard';
import { TestModule } from 'test/test.module';
import { AccessStrategy } from './strategies/access.stategy';
import { UserModule } from 'src/user/user.module';

describe('AuthGuard', () => {
	let roleGrd: RoleGuard;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, UserModule],
			providers: [AccessStrategy],
		}).compile();

		roleGrd = module.get(RoleGuard);
	});

	it('should be defined', () => {
		expect(roleGrd).toBeDefined();
	});
});
