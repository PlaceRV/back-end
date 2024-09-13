import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { IsAlpha, IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { Device } from 'device/device.entity';
import { IUserInfoKeys } from 'models';
import { Place } from 'place/place.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { hash } from 'utils/auth.utils';
import { SensitiveInfomations } from 'utils/typeorm.utils';
import { InterfaceCasting, tstStr } from 'utils/utils';
import { IUser, Role } from './user.model';

@ObjectType()
@Entity()
export class User extends SensitiveInfomations implements IUser {
	constructor(payload: IUser) {
		super();
		Object.assign(this, payload);
	}

	@Column()
	private _hashedPassword: string;

	get hashedPassword() {
		if (this.password || this._hashedPassword) {
			if (this._hashedPassword) return this._hashedPassword;
			return (this._hashedPassword = hash(this.password));
		}
		return this._hashedPassword;
	}

	set hashedPassword(i: any) {}

	// Relationships
	@HideField()
	@OneToMany(() => Device, (_: Device) => _.owner)
	devices?: Device[];

	@HideField()
	@OneToMany(() => Place, (_: Place) => _.createdBy)
	placesAssigned?: Place[];

	// Infomations
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

	@IsString()
	@Field()
	@Column()
	description: string;

	@Field(() => [Role])
	@Column({ type: 'enum', enum: Role, array: true, default: [Role.USER] })
	roles: Role[];

	@IsStrongPassword({
		minLength: 16,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password: string;

	// Methods
	get info() {
		return InterfaceCasting.quick(this, IUserInfoKeys);
	}

	static test(from: string) {
		const n = new User({
			email: tstStr() + '@gmail.com',
			password: 'Aa1!000000000000',
			firstName: from,
			lastName: tstStr(),
			roles: [Role.USER],
			description: new Date().toISOString(),
		});
		if (n.hashedPassword) return n;
	}
}
