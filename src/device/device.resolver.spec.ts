import { TestModule } from '@backend/test';
import { Test, TestingModule } from '@nestjs/testing';
import { DeviceModule } from './device.module';
import { DeviceResolver } from './device.resolver';

describe('DeviceResolver', () => {
	let resolver: DeviceResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, DeviceModule],
		}).compile();

		resolver = module.get(DeviceResolver);
	});

	it('be defined', () => expect(resolver).toBeDefined());
});
