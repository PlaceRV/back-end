import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { DeviceService } from '@backend/device/device.service';
import { User } from '@backend/user/user.entity';
import { ILogin, ISignUp } from '@backend/user/user.interface';
import { UserService } from '@backend/user/user.service';
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync } from 'bcrypt';
import { Request } from 'express';
import { generateFingerprint } from './auth.middleware';

export class PayLoad {
	constructor(id: string) {
		this.id = id;
	}

	id!: string;

	toPlainObj() {
		return Object.assign({}, this);
	}
}

export class UserMetadata {
	constructor(req: Request) {
		const fp = req['fingerprint'];
		this.userAgent = { ...fp.userAgent, ...fp.maxmindData };
		this.ipAddress = fp.ipAddress;
	}

	ipAddress!: string;
	userAgent!: object;

	toString(obj: object = this.userAgent) {
		if (typeof obj === 'object') {
			return `{${Object.keys(obj)
				.map((key) => `${key}:${obj[key] ? this.toString(obj[key]) : '~'}`)
				.join(',')}}`;
		} else return JSON.stringify(obj);
	}

	static get test() {
		return new UserMetadata({
			fingerprint: generateFingerprint(),
		} as unknown as Request);
	}
}

@Injectable()
export class AuthService {
	constructor(
		private cfgSvc: ConfigService,
		private usrSvc: UserService,
		@Inject(forwardRef(() => DeviceService))
		private dvcSvc: DeviceService,
	) {}
	private readonly algorithm = this.cfgSvc.get('AES_ALGO');
	private readonly svrScr = this.cfgSvc.get('SERVER_SECRET');

	async signUp(input: ISignUp, mtdt: UserMetadata) {
		const user = await this.usrSvc.findOne({ email: input.email });
		if (!user) {
			const newUser = new User(input);
			if (newUser.hashedPassword) {
				await this.usrSvc.save(newUser);
				return this.dvcSvc.getTokens(newUser, mtdt);
			}
		}
		throw new BadRequestException('Email already assigned');
	}

	async login(input: ILogin, mtdt: UserMetadata) {
		const user = await this.usrSvc.findOne({ email: input.email });
		if (user) {
			const isPasswordMatched = compareSync(
				input.password,
				user.hashedPassword,
			);
			if (isPasswordMatched) return this.dvcSvc.getTokens(user, mtdt);
		}
		throw new BadRequestException('Invalid email or password');
	}

	sigToKey(str: string): string {
		const first32Chars = str.substring(0, 32);
		return first32Chars.padStart(32, '0');
	}

	encrypt(text: string, key = this.svrScr) {
		const iv = randomBytes(16),
			cipher = createCipheriv(this.algorithm, this.sigToKey(key), iv),
			encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
		return iv.toString('hex') + encrypted.toString('hex');
	}

	decrypt(encryptedText: string, key = this.svrScr) {
		if (!encryptedText) return '';
		const iv = Buffer.from(encryptedText.substring(0, 32), 'hex'),
			encrypted = Buffer.from(encryptedText.substring(32), 'hex'),
			decipher = createDecipheriv(this.algorithm, this.sigToKey(key), iv),
			decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
		return decrypted.toString();
	}
}
