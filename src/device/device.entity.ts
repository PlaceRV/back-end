import { User } from '@backend/user/user.entity';
import {
	BaseEntity,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

export interface IDevice {
	owner: User;
	hashedUserAgent: string;
	useTimeLeft: number;
}

@Entity()
export class Device extends BaseEntity {
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
