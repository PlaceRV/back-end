import {
	Field,
	HideField,
	InputType,
	ObjectType,
	PickType,
} from '@nestjs/graphql';
import {
	IsAlpha,
	IsEnum,
	IsInstance,
	IsLatitude,
	IsLongitude,
	IsString,
	IsUUID,
} from 'class-validator';
import { Point } from 'geojson';
import { IPlaceInfoKeys } from 'models';
import {
	BaseEntity,
	Column,
	Entity,
	Index,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'user/user.entity';
import { tstStr } from 'utils';
import { IPlace, PlaceType } from './place.model';

// ! INSTALL PostGIS required
@ObjectType()
@Entity()
export class Place extends BaseEntity implements IPlace {
	constructor(payload: IPlace) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	@IsInstance(User)
	@HideField()
	@ManyToOne(() => User, (_: User) => _.placesAssigned)
	createdBy: User;

	// Sensitive infomations
	@IsUUID()
	@HideField()
	@PrimaryGeneratedColumn('uuid')
	id?: string;

	// Infomations
	@IsAlpha()
	@Field()
	@Column()
	name: string;

	@IsEnum(PlaceType)
	@Field(() => PlaceType)
	@Column({ type: 'enum', enum: PlaceType, default: PlaceType.NONE })
	type: PlaceType;

	@HideField()
	@Index({ spatial: true })
	@Column({ type: 'geography', spatialFeatureType: 'Point' })
	private location: Point = { type: 'Point', coordinates: [0, 0] };

	@HideField()
	private _longitude: number;
	@IsLongitude()
	@Field()
	set longitude(i: number) {
		this.location.coordinates[0] = i;
		this._longitude = i;
	}
	get longitude() {
		if (this.location[0]) return this.location[0];
		return this._longitude;
	}

	@HideField()
	private _latitude: number;
	@IsLatitude()
	@Field()
	set latitude(i: number) {
		this.location.coordinates[1] = i;
		this._latitude = i;
	}
	get latitude() {
		if (this.location[1]) return this.location[1];
		return this._latitude;
	}

	@IsString()
	@Field()
	@Column()
	description: string;

	// Methods
	@HideField()
	static test(user: User) {
		return new Place({
			name: tstStr(),
			type: PlaceType.CHURCH,
			createdBy: user,
			longitude: (32).rd(),
			latitude: (32).rd(),
			description: '',
		});
	}
}

// DTOs
@InputType()
export class PlaceAssign extends PickType(Place, IPlaceInfoKeys) {}
