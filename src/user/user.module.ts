import { Module } from '@nestjs/common';
import { UserResolv } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [UserResolv],
})
export class UserModule {}
