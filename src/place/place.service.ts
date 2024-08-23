import { BadRequestException, Injectable } from '@nestjs/common';
import { Place } from './place.entity';
import {
	DeepPartial,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PlaceAssign } from './place.dto';
import { User } from '@backend/user/user.entity';

@Injectable()
export class PlaceService {
	constructor(@InjectRepository(Place) private repo: Repository<Place>) {}

	async assign(placeAssign: PlaceAssign, user: User) {
		if (user) {
			return await this.save({ ...placeAssign, createdBy: user });
		}
		throw new BadRequestException('Invalid user');
	}

	// Database requests
	find(options?: FindOptionsWhere<Place>): Promise<Place[]> {
		return this.repo.find({ where: options, relations: ['deviceSessions'] });
	}

	findOne(options?: FindOptionsWhere<Place>) {
		return this.repo.findOne({ where: options, relations: ['deviceSessions'] });
	}

	save(
		entities: DeepPartial<Place>,
		options?: SaveOptions & { reload: false },
	): Promise<DeepPartial<Place>> {
		return this.repo.save(entities, options);
	}

	delete(criteria: FindOptionsWhere<Place>) {
		return this.repo.delete(criteria);
	}
}
