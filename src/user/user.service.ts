import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeepPartial, FindManyOptions, Repository, SaveOptions } from 'typeorm';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private usrRepo: Repository<User>,
	) {}

	async find(options?: FindManyOptions<User>): Promise<User[]> {
		return await this.usrRepo.find(options);
	}

	async save<T extends DeepPartial<User>>(entities: T, options?: SaveOptions & { reload: false }): Promise<User> {
		return (await this.usrRepo.save(entities, options)) as User;
	}
}
