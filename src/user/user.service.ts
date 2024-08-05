import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import {
	DeepPartial,
	FindManyOptions,
	FindOneOptions,
	Repository,
	SaveOptions,
} from 'typeorm';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	find(options?: FindManyOptions<User>): Promise<User[]> {
		return this.repo.find(options);
	}

	findOne(options?: FindOneOptions<User>): Promise<User> {
		return this.repo.findOne(options);
	}

	save(
		entities: DeepPartial<User>,
		options?: SaveOptions & { reload: false },
	): Promise<DeepPartial<User>> {
		return this.repo.save(entities, options);
	}
}
