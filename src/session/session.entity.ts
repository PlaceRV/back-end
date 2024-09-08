import { Device } from 'device/device.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { SensitiveInfomations } from 'utils/typeorm.utils';
import { ISession } from './session.interface';

@Entity()
export class Session extends SensitiveInfomations implements ISession {
	constructor(input: ISession) {
		super();
		Object.assign(this, input);
	}

	// Relationships
	@ManyToOne(() => Device, (_: Device) => _.sessions)
	device: Device;

	// Infomations
	@Column() useTimeLeft: number;
}
