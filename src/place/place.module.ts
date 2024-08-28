import { AuthMiddleware } from '@backend/auth/auth.middleware';
import { AuthModule } from '@backend/auth/auth.module';
import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaceController } from './place.controller';
import { Place } from './place.entity';
import { PlaceResolver } from './place.resolver';
import { PlaceService } from './place.service';

@Module({
	imports: [TypeOrmModule.forFeature([Place]), forwardRef(() => AuthModule)],
	providers: [PlaceResolver, PlaceService],
	exports: [PlaceService],
	controllers: [PlaceController],
})
export class PlaceModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes(PlaceController);
	}
}
