import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync } from 'bcrypt';
import { validate, ValidatorOptions } from 'class-validator';
import { DeviceService } from 'device/device.service';
import { User } from 'user/user.entity';
import { ILogin, ISignUp } from 'user/user.model';
import { UserService } from 'user/user.service';

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

	async signUp(input: ISignUp, mtdt: string) {
		const user = await this.usrSvc.email(input.email);
		if (!user) {
			const newUser = new User(input);
			const inputErrors = await validate(newUser, {
				stopAtFirstError: true,
			} as ValidatorOptions);
			if (newUser.hashedPassword && !inputErrors.length) {
				await this.usrSvc.assign(newUser);
				return this.dvcSvc.getTokens(newUser, mtdt);
			}
			throw new BadRequestException(String(inputErrors));
		}
		throw new BadRequestException('Email already assigned');
	}

	async login(input: ILogin, mtdt: string) {
		const user = await this.usrSvc.email(input.email);
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
