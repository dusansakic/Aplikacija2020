import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRegistrationDto } from 'src/dtos/user/user.registration.dto';
import { ApiResponse } from 'src/misc/api.response.class';
import * as crypto from 'crypto';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User)
    private readonly user: Repository<User>,
  ) {
    super(user);
  }

  async register(data: UserRegistrationDto): Promise<User | ApiResponse> {
    const passwordHash = crypto.createHash('sha512');
    passwordHash.update(data.password);
    const passwordHashString = passwordHash.digest('hex').toUpperCase();

    const newUser: User = new User();
    newUser.email = data.email;
    newUser.passwordHash = passwordHashString;
    newUser.surname = data.surname;
    newUser.forename = data.forename;
    newUser.phoneNumber = data.phoneNumber;
    newUser.postalAddress = data.postalAddress;

    try {
      const savedUser = await this.user.save(newUser);
      if (!savedUser) {
        throw new Error('');
      }
      return savedUser;
    } catch (e) {
      return new ApiResponse(
        'error',
        -6001,
        'This user account can not be created',
      );
    }
  }
}
