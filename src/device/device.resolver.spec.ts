import { Test, TestingModule } from '@nestjs/testing';
import { DeviceResolver } from './device.resolver';
import { TestModule } from 'test/test.module';
import { DeviceModule } from './device.module';

describe('DeviceResolver', () => {
	let resolver: DeviceResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [TestModule, DeviceModule],
		}).compile();

		resolver = module.get(DeviceResolver);
	});

	it('should be defined', () => expect(resolver).toBeDefined());
});
