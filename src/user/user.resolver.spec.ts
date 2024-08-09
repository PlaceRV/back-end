import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { TestModule } from 'test/SQLModule';

describe('UserResolver', () => {
	let resolver: UserResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: TestModule,
			providers: [UserResolver, UserService],
		}).compile();

		resolver = module.get<UserResolver>(UserResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
