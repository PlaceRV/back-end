import { IUser } from 'user/user.model';

export interface IDevice {
	owner: IUser;
	hashedUserAgent: string;
	useTimeLeft: number;
}
