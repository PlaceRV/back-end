import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TestModule } from 'test/test.module';
import { AuthModule } from './auth.module';

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, AuthModule],
		}).compile();

		service = module.get(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
