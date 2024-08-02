import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, SignUpDto, UserRecieve } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthSvc {
	constructor(
		@InjectRepository(User) private userRepo: Repository<User>,
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
	) {}

	async signUp(signUpDto: SignUpDto) {
		const user = await this.userRepo.findOne({
			where: { email: signUpDto.email },
		});
		if (!user) {
			signUpDto.password = await bcrypt.hash(signUpDto.password, await bcrypt.genSalt(Number(this.cfgSvc.get('BCRYPT_SALT'))));

			const user = await this.userRepo.save(signUpDto),
				token = this.jwtSvc.sign({ id: user.id });
			return new UserRecieve(token);
		}
		throw new BadRequestException('Email already assigned');
	}

	async login(loginDto: LoginDto) {
		const user = await this.userRepo.findOne({
			where: { email: loginDto.email },
		});
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
