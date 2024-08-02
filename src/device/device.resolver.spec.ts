import { Test, TestingModule } from '@nestjs/testing';
import { DeviceResolver } from './device.resolver';
import { DeviceService } from './device.service';

describe('DeviceResolver', () => {
  let resolver: DeviceResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceResolver, DeviceService],
    }).compile();

    resolver = module.get<DeviceResolver>(DeviceResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
