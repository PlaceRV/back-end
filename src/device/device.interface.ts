import { IUser } from '@backend/user/user.interface';

export interface IDevice {
	owner: IUser;
	hashedUserAgent: string;
	useTimeLeft: number;
}
