import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { Feature } from './feature.entity';

@Index('fk_category_parent_category_id', ['parentCategoryId'], {})
@Index('uq_category_image_path', ['imagePath'], { unique: true })
@Index('uq_category_name', ['name'], { unique: true })
@Entity('category')
export class Category {
  @PrimaryGeneratedColumn({ type: 'int', name: 'category_id', unsigned: true })
  categoryId: number;

  @Column({
    type: 'varchar',
    name: 'name',
    unique: true,
    length: 32,
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'image_path',
    unique: true,
    length: 128,
    default: () => "'0'",
  })
  imagePath: string;

  @Column({
    type: 'int',
    name: 'parent_category_id',
    nullable: true,
    unsigned: true,
  })
  parentCategoryId: number | null;

  @OneToMany(
    () => Article,
    article => article.category,
  )
  articles: Article[];

  @OneToMany(
    () => Feature,
    feature => feature.category,
  )
  features: Feature[];
}
