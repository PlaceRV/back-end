import {
	BaseEntity,
	DeepPartial,
	FindOptionsWhere,
	PrimaryGeneratedColumn,
	Repository,
	SaveOptions,
} from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata.js';

export class SensitiveInfomations extends BaseEntity {
	constructor() {
		super();
	}

	@PrimaryGeneratedColumn('uuid') id: string;
}

export class DatabaseRequests<T extends SensitiveInfomations> {
	relations: string[];

	constructor(protected repo: Repository<T>) {
		this.relations = [].concat(
			...this.repo.metadata.relations.map((i) => {
				return this.exploreEntityMetadata(i);
			}),
		);
	}

	private exploreEntityMetadata(
		input: RelationMetadata,
		parentName: string = '',
		avoidNames: string = '',
	): Array<string> {
		if (
			[input.propertyName].every(
				(i) =>
					parentName.split('.').includes(i) ||
					avoidNames.split('.').includes(i),
			)
		)
			return [];
		const currentRelationName = parentName + input.propertyName;
		return [`${currentRelationName}`].concat(
			...input.inverseEntityMetadata.relations.map((i) =>
				this.exploreEntityMetadata(
					i,
					`${currentRelationName}.`,
					`${avoidNames}.${i.inverseSidePropertyPath}`,
				),
			),
		);
	}

	protected find(options?: FindOptionsWhere<T>): Promise<T[]> {
		return this.repo.find({ where: options, relations: this.relations });
	}

	protected findOne(options?: FindOptionsWhere<T>): Promise<T> {
		return this.repo.findOne({ where: options, relations: this.relations });
	}

	protected save(entity: DeepPartial<T>, options?: SaveOptions) {
		return this.repo.save(entity, options) as Promise<T>;
	}

	protected delete(criteria: FindOptionsWhere<T>) {
		return this.repo.delete(criteria);
	}

	id(id: string) {
		return this.findOne({ id } as FindOptionsWhere<T>);
	}

	all() {
		return this.find();
	}
}
