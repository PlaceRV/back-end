import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IncomingMessage } from 'http';
import { DeepPartial } from 'typeorm';

@InputType()
export class SignUpDto {
	@IsString() @Field({ nullable: false }) firstName!: string;
	@IsString() @Field({ nullable: false }) lastName!: string;
	@IsEmail() @Field({ nullable: false }) email!: string;
	@IsNotEmpty() @Field({ nullable: false }) password!: string;
}

@InputType()
export class LoginDto {
	@IsEmail() @Field({ nullable: false }) email!: string;
	@IsNotEmpty() @Field({ nullable: false }) password!: string;
}

@ObjectType()
export class UserRecieve {
	constructor(token: string) {
		this.token = token!;
	}
	@Field() token: string;
	@Field() refreshToken: string;
}

export class UserMetadata {
	constructor(ctx: GqlContext) {
		const fp = ctx.req['fp'];
		this.deviceId = fp.id;
		this.userAgent = this.objectToString(fp.userAgent);
		this.ipAddress = fp.ipAddress.value;
	}

	ipAddress!: string;
	userAgent!: string;
	deviceId!: string;

	objectToString(obj: object) {
		if (typeof obj === 'object') {
			return `{${Object.keys(obj)
				.map((key) => `"${key}":${this.objectToString(obj[key])}`)
				.join(',')}}`;
		} else return JSON.stringify(obj);
	}
}

export class GqlContext {
	req: IncomingMessage;
}

export class PayLoad {
	constructor(id: string, deviceId: string) {
		this.id = id;
		this.deviceId = deviceId;
	}

	id!: string;
	deviceId!: string;

	toPlainObj(): DeepPartial<PayLoad> {
		return Object.assign({}, this);
	}
}
