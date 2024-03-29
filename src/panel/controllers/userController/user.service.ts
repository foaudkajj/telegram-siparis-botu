import { Injectable } from '@nestjs/common';
import { User } from 'src/db/models/user';
import { DataSourceLoadOptionsBase } from 'src/panel/dtos/devextreme-query';
import { UIResponseBase } from 'src/panel/dtos/ui-response-base';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async Get(query: DataSourceLoadOptionsBase) {
    let users: User[];
    if (query.take && query.skip) {
      users = await this.userRepository.find({
        take: query.take,
        skip: query.skip,
      });
    } else {
      users = await this.userRepository.find();
    }
    const response: UIResponseBase<User> = {
      isError: false,
      data: users,
      totalCount: users.length,
      messageKey: 'SUCCESS',
      statusCode: 200,
    };
    return response;
  }

  async Insert(user: User) {
    try {
      const response: UIResponseBase<User> = {
        isError: false,
        result: user,
        messageKey: 'SUCCESS',
        statusCode: 200,
      };
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(user.password, salt);
      user.salt = salt;
      user.password = hash;
      await this.userRepository.insert(user);
      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async Update(updateDetails: User) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: updateDetails.id },
      });
      if (updateDetails.password) {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(updateDetails.password, salt);
        updateDetails.salt = salt;
        updateDetails.password = hash;
      }
      const { id: _, ...updatedUser } = { ...user, ...updateDetails };
      await this.userRepository.update({ id: user.id }, updatedUser);
      return <UIResponseBase<User>>{
        isError: false,
        result: updatedUser,
        messageKey: 'SUCCESS',
        statusCode: 200,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async Delete(Id: number) {
    try {
      await this.userRepository.delete({ id: Id });
      return <UIResponseBase<User>>{
        isError: false,
        messageKey: 'SUCCESS',
        statusCode: 200,
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
