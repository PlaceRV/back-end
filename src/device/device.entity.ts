import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DeviceSession {
	@PrimaryGeneratedColumn('uuid') id: string;
	@ManyToOne(() => User, (user: { id: string }) => user.id) userId: string;
	@Column() hashedUserAgent: string;
	@Column() useTimeLeft: number;
}
