import { Basic } from '@backend/utils';
import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Point } from 'geojson';
import { IPlace, PlaceType } from './place.entity';
import { CustomPointScalar } from './place.scalar';

@InputType()
export class PlaceAssign implements Omit<Basic<IPlace>, 'createdBy'> {
	constructor(payload: IPlace) {
		Object.assign(this, payload);
	}

	@IsString() @Field({ nullable: false }) name: string;
	@Field({ nullable: false }) type: PlaceType;
	@Field(() => CustomPointScalar) location: Point;
	@IsString() @Field() description?: string;
}
