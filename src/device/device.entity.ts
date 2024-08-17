import { User } from 'src/user/user.entity';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class DeviceSession {
	@PrimaryGeneratedColumn('uuid') id: string;
	@ManyToOne(() => User, (user) => user.deviceSessions)
	@JoinColumn({ name: 'userId' })
	user: User;
	@Column() userId: string;
	@Column() hashedUserAgent: string;
	@Column() useTimeLeft: number;
}
