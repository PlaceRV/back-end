import { Test, TestingModule } from '@nestjs/testing';
import { DeviceResolver } from './device.resolver';
import { DeviceService } from './device.service';
import { TestModule } from 'test/SQLModule';
import { AuthModule } from 'src/auth/auth.module';

describe('DeviceResolver', () => {
	let resolver: DeviceResolver;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [...TestModule, AuthModule],
			providers: [DeviceResolver, DeviceService],
		}).compile();

		resolver = module.get(DeviceResolver);
	});

	it('should be defined', () => {
		expect(resolver).toBeDefined();
	});
});
