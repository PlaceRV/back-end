import { Module } from '@nestjs/common';
import { PlaceController } from './place.controller';
import { PlaceResolver } from './place.resolver';
import { PlaceService } from './place.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './place.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Place])],
	controllers: [PlaceController],
	providers: [PlaceResolver, PlaceService],
	exports: [PlaceService],
})
export class PlaceModule {}
