import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from 'src/entities/photo.entity';
import { Repository, DeleteResult } from 'typeorm';

@Injectable()
export class PhotoService extends TypeOrmCrudService<Photo> {
  constructor(
    @InjectRepository(Photo)
    private readonly photo: Repository<Photo>,
  ) {
    super(photo);
  }

  add(newPhoto: Photo): Promise<Photo> {
    return this.photo.save(newPhoto);
  }

  async deleteById(id: number): Promise<DeleteResult> {
    return await this.photo.delete(id);
  }
}
