import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../../../typeorm/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export default class UserService {
  @InjectRepository(User)
  private User: Repository<User>;

  async register() {}
}
