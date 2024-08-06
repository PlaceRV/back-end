import { forwardRef, Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceResolver } from './device.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSession } from './device.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [TypeOrmModule.forFeature([DeviceSession]), forwardRef(() => AuthModule)],
	providers: [DeviceResolver, DeviceService],
	exports: [DeviceService],
})
export class DeviceModule {}
