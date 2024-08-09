import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TestModule } from 'test/SQLModule';
import { UserModule } from 'src/user/user.module';
import { DeviceModule } from 'src/device/device.module';

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [...TestModule, UserModule, DeviceModule],
			providers: [AuthService],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
