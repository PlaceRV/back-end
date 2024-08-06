import { Module } from '@nestjs/common';
import { UserResolv } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User } from './user.entity';
import { registerEnumType } from '@nestjs/graphql';
import { UserService } from './user.service';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [UserResolv, UserService],
	exports: [UserService],
})
export class UserModule {
	constructor() {
		registerEnumType(Role, { name: 'Role' });
	}
}
