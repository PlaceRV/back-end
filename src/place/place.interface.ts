import { IUser } from '@backend/user/user.interface';
import { Point } from 'geojson';
import { PlaceType } from './place.type';

export interface IPlace {
	name: string;
	type: PlaceType;
	location: Point;
	description?: string;
	createdBy: IUser;
}
