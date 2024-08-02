import { Module } from '@nestjs/common';
import { UserResolv } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User } from './user.entity';
import { registerEnumType } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';

@Module({
	imports: [TypeOrmModule.forFeature([User]), ConfigModule],
	providers: [UserResolv, UserService],
})
export class UserModule {
	constructor() {
		registerEnumType(Role, { name: 'Role' });
	}
}
