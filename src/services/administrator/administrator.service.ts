import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'entities/administrator.entity';
import { Repository } from 'typeorm';
import { AddAdministratorDto } from 'src/dtos/administrator/add.administrator.dto';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';

@Injectable()
export class AdministratorService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administrator: Repository<Administrator>,
  ) {}

  getAll(): Promise<Administrator[]> {
    return this.administrator.find();
  }

  getById(id: number): Promise<Administrator> {
    return this.administrator.findOne(id);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  add(data: AddAdministratorDto): Promise<Administrator> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').topUpperCase();

    const newAdmin: Administrator = new Administrator();
    newAdmin.username = data.username;
    newAdmin.passwordHash = passwordHashString;
    return this.administrator.save(newAdmin);
  }

  async editById(
    id: number,
    data: EditAdministratorDto,
  ): Promise<Administrator> {
    const admin: Administrator = await this.administrator.findOne(id);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');
    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').topUpperCase();

    admin.passwordHash = passwordHashString;

    return this.administrator.save(admin);
  }
}
