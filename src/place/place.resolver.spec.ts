import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, UserMetadata } from 'auth/auth.service';
import { TestModule } from 'module/test.module';
import { User } from 'user/user.entity';
import { Place } from './place.entity';
import { PlaceModule } from './place.module';
import { PlaceResolver } from './place.resolver';
import { PlaceService } from './place.service';

const fileName = curFile(__filename);
let plcRsv: PlaceResolver, plcSvc: PlaceService, authSvc: AuthService;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, PlaceModule],
	}).compile();

	(plcRsv = module.get(PlaceResolver)),
		(plcSvc = module.get(PlaceService)),
		(authSvc = module.get(AuthService));
});

describe('findAll', () => {
	it('return all places', async () => {
		const places: Place[] = [
			Place.test(User.test(fileName)),
			Place.test(User.test(fileName)),
		];
		jest.spyOn(plcSvc, 'find').mockResolvedValue(places);
		expect(await plcRsv.findAll()).toEqual(places);
		expect(plcSvc.find).toHaveBeenCalled();
	});
});

describe('createPlace', () => {
	let usr: User;
	beforeEach(async () => {
		// New user sign up
		usr = User.test(fileName);
		const mtdt = UserMetadata.test;
		await authSvc.signUp(usr, mtdt);
	});

	it('return success', async () => {
		const input = Place.test(usr);
		jest.spyOn(plcSvc, 'assign');
		const result = await plcRsv.createPlace(usr, input);
		expect(result).toEqual(true);
	});
});
