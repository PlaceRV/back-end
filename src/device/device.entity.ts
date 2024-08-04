import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class DeviceSession {
	@PrimaryColumn() deviceId: string;
	@ManyToOne(() => User, (user: { id: string }) => user.id) user: string;
	@Column() refreshToken: string;
}
