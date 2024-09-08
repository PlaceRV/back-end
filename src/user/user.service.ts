import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DeepPartial,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	// Database requests
	find(options?: FindOptionsWhere<User>) {
		return this.repo.find({ where: options });
	}

	findOne(options?: FindOptionsWhere<User>) {
		return this.repo.findOne({ where: options });
	}

	save(entities: DeepPartial<User>, options?: SaveOptions) {
		return this.repo.save(entities, options) as Promise<User>;
	}

	delete(criteria: FindOptionsWhere<User>) {
		return this.repo.delete(criteria);
	}
}
