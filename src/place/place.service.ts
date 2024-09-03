import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DeepPartial,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';
import { User } from 'user/user.entity';
import { Place, PlaceAssign } from './place.entity';

@Injectable()
export class PlaceService {
	constructor(@InjectRepository(Place) private repo: Repository<Place>) {}

	async assign(placeAssign: PlaceAssign, user: User) {
		if (user) {
			return await this.save({ ...placeAssign, createdBy: user });
		}
		throw new BadRequestException('Invalid input');
	}

	// Database requests
	find(options?: FindOptionsWhere<Place>): Promise<Place[]> {
		return this.repo.find({ where: options, relations: ['createdBy'] });
	}

	findOne(options?: FindOptionsWhere<Place>) {
		return this.repo.findOne({ where: options, relations: ['createdBy'] });
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
