import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, SignUpDto, UserRecieve } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
	constructor(
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
		private usrSvc: UserService,
	) {}

	async signUp(signUpDto: SignUpDto) {
		const user = await this.usrSvc.find({
			where: { email: signUpDto.email },
		});
		if (!user) {
			signUpDto.password = await bcrypt.hash(signUpDto.password, await bcrypt.genSalt(Number(this.cfgSvc.get('BCRYPT_SALT'))));

			const user = await this.usrSvc.save(signUpDto),
				token = this.jwtSvc.sign({ id: user.id });
			return new UserRecieve(token);
		}
		throw new BadRequestException('Email already assigned');
	}

	async login(loginDto: LoginDto) {
		const user = await this.usrSvc.find({
			where: { email: loginDto.email },
		})[0];
		if (user) {
			const isPasswordMatched = await bcrypt.compare(loginDto.password, user.password);
			if (isPasswordMatched) {
				const token = this.jwtSvc.sign({ id: user.id });
				return new UserRecieve(token);
			}
		}
		throw new BadRequestException('Invalid email or password');
	}
}
