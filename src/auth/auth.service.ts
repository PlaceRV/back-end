import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './auth.input';
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
      this.cfgSvc.get('JWT_SECRET'),
    );

    const user = await this.userRepo.save(signUpDto),
      token = this.jwtSvc.sign({ id: user.id });
    return { token };
  }
}
