import { Test, TestingModule } from '@nestjs/testing';
import { DeviceService } from './device.service';
import { TestModule } from 'test/test.module';
import { DeviceModule } from './device.module';

describe('DeviceService', () => {
	let dvcSvc: DeviceService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, DeviceModule],
		}).compile();

		dvcSvc = module.get(DeviceService);
	});

	it('should be defined', () => {
		expect(dvcSvc).toBeDefined();
	});
});
