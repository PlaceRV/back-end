import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginDto, SignUpDto } from './auth.dto';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { DeviceService } from 'src/device/device.service';
import { DeepPartial } from 'typeorm';
import { IncomingMessage } from 'http';
import { compare, hash } from 'bcrypt';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class GqlContext {
	req: IncomingMessage;
}

export class PayLoad {
	constructor(usrId: string) {
		this.usrId = usrId;
	}

	usrId!: string;

	toPlainObj(): DeepPartial<PayLoad> {
		return Object.assign({}, this);
	}
}

export class UserMetadata {
	constructor(req: IncomingMessage) {
		const fp = req['fp'];
		this.deviceId = fp.id;
		this.userAgent = fp.userAgent;
		this.ipAddress = fp.ipAddress.value;
	}

	ipAddress!: string;
	userAgent!: object;
	deviceId!: string;

	toString(obj: object = this) {
		if (typeof obj === 'object') {
			return `{${Object.keys(obj)
				.map((key) => `"${key}":${this.toString(obj[key])}`)
				.join(',')}}`;
		} else return JSON.stringify(obj);
	}
}

@Injectable()
export class AuthService {
	constructor(
		private cfgSvc: ConfigService,
		private usrSvc: UserService,
		private dvcSvc: DeviceService,
	) {}

	async signUp(signUpDto: SignUpDto, mtdt: UserMetadata) {
		const user = await this.usrSvc.findOne({ where: { email: signUpDto.email } });
		if (!user) {
			signUpDto.password = await hash(
				signUpDto.password,
				Number(this.cfgSvc.get('BCRYPT_SALT')),
			);

			const user = await this.usrSvc.save(signUpDto);
			return this.dvcSvc.handleDeviceSession(user.id, mtdt);
		}
		throw new BadRequestException('Email already assigned');
	}

	async login(loginDto: LoginDto, mtdt: UserMetadata) {
		const user = await this.usrSvc.findOne({ where: { email: loginDto.email } });
		if (user) {
			const isPasswordMatched = await compare(
				await hash(loginDto.password, Number(this.cfgSvc.get('BCRYPT_SALT'))),
				user.password,
			);
			if (isPasswordMatched) return this.dvcSvc.handleDeviceSession(user.id, mtdt);
		}
		throw new BadRequestException('Invalid email or password');
	}
}

@Injectable()
export class EncryptionService {
	private readonly algorithm = 'aes-256-ctr';

	sigToKey(str: string): string {
		const first32Chars = str.substring(0, 32);
		return first32Chars.padStart(32, '0');
	}

	encrypt(text: string, key: string) {
		const iv = randomBytes(16),
			cipher = createCipheriv(this.algorithm, this.sigToKey(key), iv),
			encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
		return iv.toString('hex') + encrypted.toString('hex');
	}

	decrypt(encryptedText: string, key: string) {
		const iv = Buffer.from(encryptedText.substring(0, 32), 'hex'),
			encrypted = Buffer.from(encryptedText.substring(32), 'hex'),
			decipher = createDecipheriv(this.algorithm, this.sigToKey(key), iv),
			decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
		return decrypted.toString();
	}
}
