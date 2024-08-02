import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class User {
	// Sensitive infomation
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 15, default: 'user' })
	type: string;

	@Column('text', { nullable: false })
	password: string;

	// Basic infomation
	@Field()
	@Column({ length: 15, nullable: false })
	firstName!: string;

	@Field()
	@Column({ length: 15, nullable: false })
	lastName!: string;

	@Field()
	@Column({ length: 128, nullable: false, unique: true })
	email: string;
}
