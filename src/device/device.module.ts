import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceResolver } from './device.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSession } from './device.entity';

@Module({
	imports: [TypeOrmModule.forFeature([DeviceSession])],
	providers: [DeviceResolver, DeviceService],
})
export class DeviceModule {}
