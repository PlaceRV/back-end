import { TestModule } from '@backend/test';
import { Test, TestingModule } from '@nestjs/testing';
import { PlaceModule } from './place.module';
import { PlaceService } from './place.service';

describe('PlaceService', () => {
	let service: PlaceService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [PlaceModule, TestModule],
		}).compile();

		service = module.get<PlaceService>(PlaceService);
	});

	it('should be defined', () => expect(service).toBeDefined());
});
