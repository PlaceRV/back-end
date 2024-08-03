import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DeviceSession {
	@PrimaryGeneratedColumn('uuid') id: string;
	@Column() deviceId: string;
	@Column() ipAddress: string;
	@Column() userAgent: string;
	@ManyToOne(() => User, (user: { id: string }) => user.id) user: string;
	@Column() secretKey: string;
	@Column() refreshToken: string;
	@Column() expiredAt: Date;
}
