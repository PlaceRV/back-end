import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { UserService } from 'user/user.service';
import { DatabaseRequests } from 'utils/typeorm.utils';
import { Place, PlaceAssign } from './place.entity';

@Injectable()
export class PlaceService extends DatabaseRequests<Place> {
	constructor(
		@InjectRepository(Place) repo: Repository<Place>,
		private usrSvc: UserService,
	) {
		super(repo);
	}

	async assign(placeAssign: PlaceAssign, usr: User) {
		try {
			return new Place(
				await this.save({ ...new Place(placeAssign), createdBy: usr }),
			);
		} catch (error) {
			throw new BadRequestException(error);
		}
	}
}
