import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(createUserInput: CreateUserInput) {
    const newUser = this.userRepo.create(createUserInput);
    await this.userRepo.save(createUserInput);
    return newUser;
  }

  findAll() {
    return this.userRepo.find();
  }

  findOne(id: string) {
    return this.userRepo.findOneBy({ id: id });
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (user) return this.userRepo.remove(user);
    throw new BadRequestException('User not found');
  }
}
