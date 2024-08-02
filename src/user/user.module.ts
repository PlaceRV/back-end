import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolv } from './user.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserResolv, UserService],
  controllers: [],
})
export class UserModule {}
