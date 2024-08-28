import { AuthModule } from '@backend/auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { DeviceResolver } from './device.resolver';
import { DeviceService } from './device.service';

@Module({
	imports: [TypeOrmModule.forFeature([Device]), forwardRef(() => AuthModule)],
	providers: [DeviceResolver, DeviceService],
	exports: [DeviceService],
})
export class DeviceModule {}
