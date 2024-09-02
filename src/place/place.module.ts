import { AuthModule } from '@backend/auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './place.entity';
import { PlaceResolver } from './place.resolver';
import { PlaceService } from './place.service';

@Module({
	imports: [TypeOrmModule.forFeature([Place]), forwardRef(() => AuthModule)],
	providers: [PlaceResolver, PlaceService],
	exports: [PlaceService],
})
export class PlaceModule {}
