import { Test, TestingModule } from '@nestjs/testing';
import { DeviceService } from './device.service';
import { TestModule } from 'test/SQLModule';
import { AuthModule } from 'src/auth/auth.module';

describe('DeviceService', () => {
	let dvcSvc: DeviceService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [...TestModule, AuthModule],
			providers: [DeviceService],
		}).compile();

		dvcSvc = module.get<DeviceService>(DeviceService);
	});

	it('should be defined', () => {
		expect(dvcSvc).toBeDefined();
	});
});
