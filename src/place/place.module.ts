import { forwardRef, Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import { UserModule } from 'user/user.module';
import { Place } from './place.entity';
import { PlaceType } from './place.model';
import { PlaceResolver } from './place.resolver';
import { PlaceService } from './place.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Place]),
		forwardRef(() => AuthModule),
		forwardRef(() => UserModule),
	],
	providers: [PlaceResolver, PlaceService],
	exports: [PlaceService],
})
export class PlaceModule {
	constructor() {
		registerEnumType(PlaceType, { name: 'PlaceType' });
	}
}
