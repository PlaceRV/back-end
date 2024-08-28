import { User } from '@backend/user/user.entity';
import { Str } from '@backend/utils';
import { Field, ObjectType } from '@nestjs/graphql';
import { Point } from 'geojson';
import {
	BaseEntity,
	Column,
	Entity,
	Index,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomPointScalar } from './place.scalar';

export type PlaceType = 'Temple' | 'Church';

export interface IPlace {
	name: string;
	type: PlaceType;
	location: Point;
	description?: string;
	createdBy: User;
}

// ! INSTALL PostGIS required
@ObjectType()
@Entity()
export class Place extends BaseEntity implements IPlace {
	constructor(payload: IPlace) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	@ManyToOne(() => User, (_: User) => _.placesAssigned)
	createdBy: User;

	// Sensitive infomation
	@PrimaryGeneratedColumn('uuid') id?: string;

	// Basic infomation
	@Field() @Column() name: string;
	@Field() @Column() type: PlaceType;
	@Field(() => CustomPointScalar)
	@Index({ spatial: true })
	@Column({ type: 'geography', spatialFeatureType: 'Point' })
	location: Point;
	@Field() @Column({ nullable: true }) description?: string;

	// Methods
	static test(user: User) {
		return new Place({
			name: Str.random(),
			type: 'Church',
			createdBy: user,
			location: { type: 'Point', coordinates: [0, 0] },
		});
	}
}
