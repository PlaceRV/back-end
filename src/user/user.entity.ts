import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ length: 15, nullable: false })
  firstName!: string;

  @Field()
  @Column({ length: 15, nullable: false })
  lastName!: string;

  @Field()
  @Column({ length: 128, nullable: false })
  email: string;

  @Field()
  @Column('text', { nullable: false })
  password: string;
}
