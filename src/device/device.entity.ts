import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class DeviceSession {
	@PrimaryColumn('varchar', { length: 128 }) id: string;
	@Column() ipAddress: string;
	@Column() userAgent: string;
	@ManyToOne(() => User, (user: { id: string }) => user.id) user: string;
	@Column() secretKey: string;
	@Column() refreshToken: string;
	@Column() expiredAt: Date;
}
