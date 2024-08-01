import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, SignUpDto } from './auth.input';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtSvc: JwtService,
    private cfgSvc: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    signUpDto.password = await bcrypt.hash(
      signUpDto.password,
      await bcrypt.genSalt(Number(this.cfgSvc.get('BCRYPT_SALT'))),
    );

    const user = await this.userRepo.save(signUpDto),
      token = this.jwtSvc.sign({ id: user.id });
    return { token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: loginDto.email },
    });
    if (user) {
      const isPasswordMatched = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (isPasswordMatched) {
        const token = this.jwtSvc.sign({ id: user.id });
        return { token };
      }
    }
    throw new BadRequestException('Invalid email or password');
  }
}
