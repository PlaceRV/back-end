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
	IsLatitude,
	IsLongitude,
	IsString,
} from 'class-validator';
import { Point } from 'geojson';
import { IPlaceInfoKeys } from 'models';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { SensitiveInfomations } from 'utils/typeorm.utils';
import { InterfaceCasting, tstStr } from 'utils/utils';
import { IPlace, PlaceType } from './place.model';

// ! INSTALL PostGIS required
@ObjectType()
@Entity()
export class Place extends SensitiveInfomations implements IPlace {
	constructor(payload: IPlace) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	@ManyToOne(() => User, (_: User) => _.placesAssigned)
	createdBy?: User;

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
	static get test() {
		return new Place({
			name: tstStr(),
			type: PlaceType.CHURCH,
			longitude: (32).rd(),
			latitude: (32).rd(),
			description: '',
		});
	}

	get info() {
		return InterfaceCasting.quick(this, IPlaceInfoKeys);
	}
}

// DTOs
@InputType()
export class PlaceAssign extends PickType(Place, IPlaceInfoKeys, InputType) {}
