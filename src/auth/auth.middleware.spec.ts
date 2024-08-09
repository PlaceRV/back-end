import { Test, TestingModule } from '@nestjs/testing';
import { AuthMiddleware } from './auth.middleware';
import { TestModule } from 'test/test.module';
import { AuthModule } from './auth.module';

describe('AuthMiddleware', () => {
	let authMdl: AuthMiddleware;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
			providers: [AuthMiddleware],
		}).compile();

		authMdl = module.get(AuthMiddleware);
	});

	it('should be defined', () => {
		expect(authMdl).toBeDefined();
	});
});
