import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class DeviceSession {
	@PrimaryColumn('uuid') id: string;
	@Column({ unique: true }) deviceId: string;
	@Column() name: string;
	@Column() ua: string;
	@Column() secretKey: string;
	@Column() refreshToken: string;
	@Column() expiredAt: Date;
	@Column() ipAddress: string;
	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) createdAt: Date;
	@UpdateDateColumn() updatedAt: Date;
	@ManyToOne(() => User, (user: { id: string }) => user.id) user: string;
}
