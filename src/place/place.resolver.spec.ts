import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from 'module/test.module';
import { User } from 'user/user.entity';
import { Place } from './place.entity';
import { PlaceModule } from './place.module';
import { PlaceResolver } from './place.resolver';
import { PlaceService } from './place.service';

describe('PlaceResolver', () => {
	let plcRsv: PlaceResolver, plcSvc: PlaceService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, PlaceModule],
		}).compile();

		(plcRsv = module.get(PlaceResolver)), (plcSvc = module.get(PlaceService));
	});

	it('be defined', () => expect(plcRsv).toBeDefined());

	describe('findAll', () => {
		it('return all places', async () => {
			const places: Place[] = [Place.test(User.test), Place.test(User.test)];
			jest.spyOn(plcSvc, 'find').mockResolvedValue(places);
			expect(await plcRsv.findAll()).toEqual(places);
			expect(plcSvc.find).toHaveBeenCalled();
		});
	});
});
