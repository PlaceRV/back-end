import { IUser } from 'user/user.model';

// Interfaces
export interface IDevice {
	owner: IUser;
	hashedUserAgent: string;
	valid: boolean;
}
