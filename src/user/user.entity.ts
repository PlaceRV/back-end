import { Device } from '@backend/device/device.entity';
import { Place } from '@backend/place/place.entity';
import { tstStr } from '@backend/utils';
import { Field, ObjectType } from '@nestjs/graphql';
import {
	BaseEntity,
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './user.enum';
import { IUser } from './user.interface';

@ObjectType()
@Entity()
export class User extends BaseEntity implements IUser {
	constructor(payload: IUser) {
		super();
		Object.assign(this, payload);
	}

	// Sensitive infomation
	@PrimaryGeneratedColumn('uuid') id?: string;
	@Column('text', { nullable: false }) password: string;

	// Relationships
	@OneToMany(() => Device, (_: Device) => _.owner, { eager: true })
	sessions?: Device[];
	@OneToMany(() => Place, (_: Place) => _.createdBy, { eager: true })
	placesAssigned?: Place[];

	// Basic infomation
	@Field()
	@Column({ length: 15, nullable: false })
	firstName: string;
	@Field() @Column({ length: 15, nullable: false }) lastName: string;
	@Field()
	@Column({ length: 128, nullable: false, unique: true })
	email: string;
	@Field(() => [Role])
	@Column({ type: 'enum', enum: Role, array: true, default: [Role.USER] })
	roles: Role[];

	// Methods
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
			email: tstStr(),
			password: tstStr(),
			firstName: tstStr(),
			lastName: tstStr(),
			roles: [Role.USER],
		});
	}
}
