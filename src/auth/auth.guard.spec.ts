import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from './auth.guard';
import { TestModule } from 'test/SQLModule';
import { AccessStrategy } from './strategies/access.stategy';
import { UserModule } from 'src/user/user.module';
import { DeviceModule } from 'src/device/device.module';

describe('AuthGuard', () => {
	let roleGrd: RoleGuard;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [...TestModule, UserModule, DeviceModule],
			providers: [AccessStrategy],
		}).compile();

		roleGrd = module.get(RoleGuard);
	});

	it('should be defined', () => {
		expect(roleGrd).toBeDefined();
	});
});
