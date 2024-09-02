import { Point } from 'geojson';
import { IUser } from 'user/user.interface';
import { PlaceType } from './place.type';

export interface IPlace {
	name: string;
	type: PlaceType;
	location: Point;
	description?: string;
	createdBy: IUser;
}
