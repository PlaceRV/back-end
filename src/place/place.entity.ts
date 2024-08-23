import { User } from '@backend/user/user.entity';
import { InitClass } from '@backend/utils';
import { Field, ObjectType } from '@nestjs/graphql';
import {
	BaseEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	Point,
	PrimaryGeneratedColumn,
} from 'typeorm';

export type PlaceType = 'Temple' | 'Church';

// ! INSTALL PostGIS required 
@ObjectType()
@Entity()
export class Place extends BaseEntity {
	constructor(payload: InitClass<Place>) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	@ManyToOne(() => User, (_: User) => _.placesAssigned)
	@JoinColumn({ name: 'Writer' })
	createdBy: User;

	// Sensitive infomation
	@PrimaryGeneratedColumn('uuid') id: string;

	// Basic infomation
	@Field() @Column() name: string;
	@Field() @Column() type: PlaceType;
	@Field() @Column({ type: 'geometry' }) location!: Point;
	@Field() @Column() description?: string;
}
