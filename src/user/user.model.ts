import { IDevice } from 'device/device.interface';
import { IPlace } from 'place/place.model';

// Interfaces
export interface IUserAuthentication {
	email: string;
	password: string;
}

export interface IUserInfo {
	firstName: string;
	lastName: string;
	description: string;
	roles?: Role[];
	email: string;
}

export interface IUser extends IUserAuthentication, IUserInfo {
	devices?: IDevice[];
	placesAssigned?: IPlace[];
}

export interface IUserRecieve {
	accessToken: string;
	refreshToken: string;
}

export interface ILogin extends IUserAuthentication {}
export interface ISignUp extends IUserAuthentication, IUserInfo {}

// Enums
export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
	STAFF = 'STAFF',
}
