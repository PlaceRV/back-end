import { User } from '@backend/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { IDevice } from './device.interface';

@Entity()
export class Device extends BaseEntity implements IDevice {
	constructor(payload: IDevice) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	@ManyToOne(() => User, (_: User) => _.sessions)
	owner: User;

	// Sensitive infomation
	@PrimaryGeneratedColumn('uuid') id: string;
	@Column() hashedUserAgent: string;
	@Column() useTimeLeft: number;
}
