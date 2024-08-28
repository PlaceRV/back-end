import { TestModule } from '@backend/test';
import { User } from '@backend/user/user.entity';
import { UserService } from '@backend/user/user.service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PlaceAssign } from './place.dto';
import { Place } from './place.entity';
import { PlaceModule } from './place.module';
import { PlaceService } from './place.service';

describe('PlaceService', () => {
	let plcSvc: PlaceService, usrSvc: UserService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, PlaceModule],
		}).compile();

		(plcSvc = module.get(PlaceService)), (usrSvc = module.get(UserService));
	});

	it('be defined', () => expect(plcSvc).toBeDefined());

	describe('assign', () => {
		let usr: User, plc: Place;
		beforeEach(async () => {
			(usr = await usrSvc.save(User.test)), (plc = Place.test(usr));
		});

		it('save assign place', async () => {
			const plcAss = new PlaceAssign({ ...plc });

			jest.spyOn(plcSvc, 'save');

			await plcSvc.assign(plcAss, usr);

			expect(plcSvc.save).toHaveBeenCalledWith(
				expect.objectContaining({ ...plcAss, createdBy: usr }),
			);
		});

		it('throw error', async () => {
			const plcAss = new PlaceAssign({ ...plc });

			await expect(plcSvc.assign(plcAss, null)).rejects.toThrow(
				BadRequestException,
			);
		});
	});
});
