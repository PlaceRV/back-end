import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ConfigModule } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Module({
	imports: [ConfigModule, TypeOrmModule.forFeature([User])],
	providers: [AuthResolver, AuthService, UserService],
})
export class AuthModule {}
