import { Field, ObjectType } from '@nestjs/graphql';
import { DeviceSession } from 'src/device/device.entity';
import { Base, Str } from 'src/utils';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
}

@ObjectType()
@Entity()
export class User extends Base<User> {
	// Sensitive infomation
	@PrimaryGeneratedColumn('uuid') id?: string;
	@Column('text', { nullable: false }) password!: string;
	@OneToMany(() => DeviceSession, (deviceSessions) => deviceSessions.user)
	deviceSessions?: DeviceSession[];

	// Basic infomation
	@Field() @Column({ length: 15, nullable: false }) firstName!: string;
	@Field() @Column({ length: 15, nullable: false }) lastName!: string;
	@Field()
	@Column({ length: 128, nullable: false, unique: true })
	email!: string;
	@Field(() => [Role])
	@Column({ type: 'enum', enum: Role, array: true, default: [Role.USER] })
	roles!: Role[];

	get info() {
		return {
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.email,
			roles: this.roles,
		};
	}

	static get test() {
		return new User({
			id: uuidv4(),
			deviceSessions: null,
			email: Str.random(),
			password: Str.random(),
			firstName: Str.random(),
			lastName: Str.random(),
			roles: [Role.USER],
		});
	}
}
