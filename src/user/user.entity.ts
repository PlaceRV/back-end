import { Field, ObjectType } from '@nestjs/graphql';
import { DeviceSession } from 'src/device/device.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
}

@ObjectType()
@Entity()
export class User {
	// Sensitive infomation
	@PrimaryGeneratedColumn('uuid') id: string;
	@Column({ type: 'enum', enum: Role, array: true, default: ['USER'] }) roles: Role[];
	@Column('text', { nullable: false }) password: string;
	@OneToMany(() => DeviceSession, (deviceSessions) => deviceSessions.id) deviceSessions: DeviceSession[];

	// Basic infomation
	@Field() @Column({ length: 15, nullable: false }) firstName!: string;
	@Field() @Column({ length: 15, nullable: false }) lastName!: string;
	@Field() @Column({ length: 128, nullable: false, unique: true }) email: string;
}
