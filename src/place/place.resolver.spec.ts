import { TestModule } from '@backend/test';
import { Test, TestingModule } from '@nestjs/testing';
import { PlaceModule } from './place.module';
import { PlaceResolver } from './place.resolver';

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
