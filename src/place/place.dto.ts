import { Base } from '@backend/utils';
import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { PlaceType } from './place.entity';
import { Point } from 'typeorm';

@InputType()
export class PlaceAssign extends Base<PlaceAssign> {
	@IsString() @Field({ nullable: false }) name: string;
	@Field({ nullable: false }) type: PlaceType;
	@Field({ nullable: false }) location: Point;
	@IsString() @Field() description: string;
}
