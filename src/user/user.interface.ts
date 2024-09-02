import { IDevice } from '@backend/device/device.interface';
import { IPlace } from '@backend/place/place.interface';
import { Role } from './user.enum';

export interface IUserAuthentication {
	email: string;
	password: string;
}

export interface IUserInfo {
	firstName: string;
	lastName: string;
}

export interface IUser extends IUserAuthentication, IUserInfo {
	sessions?: IDevice[];
	placesAssigned?: IPlace[];
	roles?: Role[];
}

export interface IUserRecieve {
	accessToken: string;
	refreshToken: string;
}

export interface ILogin extends IUserAuthentication {}
export interface ISignUp extends IUserAuthentication, IUserInfo {}
