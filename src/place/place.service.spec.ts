import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from 'module/test.module';
import { User } from 'user/user.entity';
import { UserService } from 'user/user.service';
import { Place } from './place.entity';
import { PlaceModule } from './place.module';
import { PlaceService } from './place.service';

const fileName = curFile(__filename);
let plcSvc: PlaceService, usrSvc: UserService;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, PlaceModule],
	}).compile();

	(plcSvc = module.get(PlaceService)), (usrSvc = module.get(UserService));
});

describe('assign', () => {
	let usr: User, plc: Place;
	beforeEach(async () => {
		(usr = await usrSvc.save(User.test(fileName))), (plc = Place.test(usr));
	});

	it('save assign place', async () => {
		jest.spyOn(plcSvc, 'save');
		const result = await plcSvc.assign(plc, usr);
		expect(result).toBeInstanceOf(Object);
	});

	it('throw error', async () => {
		await expect(plcSvc.assign(plc, null)).rejects.toThrow(BadRequestException);
	});
});
