import { Test, TestingModule } from '@nestjs/testing';
import { PlaceService } from './place.service';
import { PlaceModule } from './place.module';
import { TestModule } from '@backend/test';

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
