import { IDevice } from '@backend/device/device.interface';
import { IPlace } from '@backend/place/place.interface';
import { Role } from './user.enum';

export interface IUser {
	sessions?: IDevice[];
	placesAssigned?: IPlace[];
	roles?: Role[];

	firstName: string;
	lastName: string;
	email: string;
	password?: string;
}

export interface IUserRecieve {
	accessToken: string;
	refreshToken: string;
}
