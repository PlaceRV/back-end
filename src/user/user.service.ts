import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DeepPartial, FindManyOptions, FindOneOptions, Repository, SaveOptions } from 'typeorm';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	async find(options?: FindManyOptions<User>): Promise<User[]> {
		return await this.repo.find(options);
	}

	async findOne(options?: FindOneOptions<User>): Promise<User> {
		return await this.repo.findOne(options);
	}

	async save<T extends DeepPartial<User>>(entities: T, options?: SaveOptions & { reload: false }): Promise<User> {
		return (await this.repo.save(entities, options)) as User;
	}
}
