import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DeviceSession {
	@PrimaryGeneratedColumn('uuid') id: string;
	@ManyToOne(() => User, (user: { id: string }) => user.id) user: string;
	@Column() hashedUserAgent: string;
	@Column() useTimeLeft: string;
}
