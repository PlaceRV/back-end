import { User } from '@backend/user/user.entity';
import { tstStr } from '@backend/utils';
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
import { IPlace } from './place.interface';
import { CustomPointScalar } from './place.scalar';
import { PlaceType } from './place.type';

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
			name: tstStr(),
			type: 'Church',
			createdBy: user,
			location: { type: 'Point', coordinates: [0, 0] },
		});
	}
}
