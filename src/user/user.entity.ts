import { Device } from '@backend/device/device.entity';
import { Place } from '@backend/place/place.entity';
import { tstStr } from '@backend/utils';
import { Field, HideField, ObjectType } from '@nestjs/graphql';
import {
	IsAlpha,
	IsArray,
	IsEmail,
	IsStrongPassword,
	IsUUID,
} from 'class-validator';
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

	// Sensitive infomations
	@IsUUID()
	@HideField()
	@PrimaryGeneratedColumn('uuid')
	id?: string;

	@IsStrongPassword({
		minLength: 16,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	@Field()
	@Column()
	password: string;

	// Relationships
	@IsArray()
	@HideField()
	@OneToMany(() => Device, (_: Device) => _.owner, { eager: true })
	sessions?: Device[];

	@IsArray()
	@HideField()
	@OneToMany(() => Place, (_: Place) => _.createdBy, { eager: true })
	placesAssigned?: Place[];

	// User infomations
	@IsAlpha()
	@Field()
	@Column()
	firstName: string;

	@IsAlpha()
	@Field()
	@Column()
	lastName: string;

	@IsEmail()
	@Field()
	@Column()
	email: string;

	@IsArray()
	@Field()
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
