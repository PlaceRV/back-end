import {
	BaseEntity,
	DeepPartial,
	FindOptionsWhere,
	PrimaryGeneratedColumn,
	Repository,
	SaveOptions,
} from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata.js';

function exploreEntityMetadata(
	input: RelationMetadata,
	parentName: string = '',
): Array<string> {
	if (
		[input.propertyName, input.inverseSidePropertyPath].every((i) =>
			parentName.split('.').includes(i),
		)
	)
		return [];
	const currentRelationName = parentName + input.propertyName;
	return [`${currentRelationName}`].concat(
		...input.inverseEntityMetadata.relations.map((i) =>
			exploreEntityMetadata(i, `${currentRelationName}.`),
		),
	);
}

export class SensitiveInfomations extends BaseEntity {
	constructor() {
		super();
	}

	@PrimaryGeneratedColumn('uuid') id: string;
}

export class DatabaseRequests<T extends SensitiveInfomations> {
	constructor(protected repo: Repository<T>) {}

	protected find(options?: FindOptionsWhere<T>): Promise<T[]> {
		const relations = [].concat(
			...this.repo.metadata.relations.map((i) => {
				return exploreEntityMetadata(i);
			}),
		);
		return this.repo.find({ where: options, relations });
	}

	protected findOne(options?: FindOptionsWhere<T>): Promise<T> {
		const relations = [].concat(
			...this.repo.metadata.relations.map((i) => {
				return exploreEntityMetadata(i);
			}),
		);
		return this.repo.findOne({ where: options, relations });
	}

	protected save(entities: DeepPartial<T>, options?: SaveOptions) {
		return this.repo.save(entities, options) as Promise<T>;
	}

	protected delete(criteria: FindOptionsWhere<T>) {
		return this.repo.delete(criteria);
	}

	id(id: string) {
		return this.findOne({ id } as FindOptionsWhere<T>);
	}
}
