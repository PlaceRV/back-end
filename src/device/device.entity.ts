import { User } from '@backend/user/user.entity';
import { ClassProperties } from '@backend/utils';
import {
	BaseEntity,
	Column,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Device extends BaseEntity {
	constructor(payload: ClassProperties<Device>) {
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
