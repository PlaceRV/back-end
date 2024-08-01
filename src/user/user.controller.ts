import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { CreateUserDto } from './user.input';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('users')
export class UserController {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  @Get()
  async getAllUsers(): Promise<User[]> {
    return await this.userRepo.find();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return await this.userRepo.findOneBy({ id: id });
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userRepo.save(createUserDto);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<User> {
    return this.userRepo.remove(await this.getUserById(id));
  }
}
