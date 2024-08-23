import { Test, TestingModule } from '@nestjs/testing';
import { PlaceResolver } from './place.resolver';
import { PlaceModule } from './place.module';
import { TestModule } from '@backend/test';

describe('PlaceResolver', () => {
	let resolver: PlaceResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, PlaceModule],
		}).compile();

		resolver = module.get<PlaceResolver>(PlaceResolver);
	});

	it('should be defined', () => expect(resolver).toBeDefined());
});
