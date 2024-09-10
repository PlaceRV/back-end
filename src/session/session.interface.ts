import { IDevice } from 'device/device.interface';

export interface ISession {
	device: IDevice;
	useTimeLeft: number;
}
