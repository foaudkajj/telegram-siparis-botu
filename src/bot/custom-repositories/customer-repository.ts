import {Customer} from 'src/db/models/customer';
import {EntityRepository, Repository} from 'typeorm';
import {BotContext} from '../interfaces/bot-context';

@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {
  async getCustomerByTelegramId(ctx: BotContext, relations: string[] = []) {
    const userInfo = ctx.from.is_bot ? ctx.callbackQuery.from : ctx.from;

    if (!relations.includes('merchant')) {
      relations.push('merchant');
    }
    if (relations && relations.length > 0) {
      return await this.findOne({
        where: {
          telegramId: userInfo.id,
          merchant: {botUserName: ctx.botInfo.username},
        },
        relations: relations,
      });
    } else {
      return await this.findOne({
        where: {
          telegramId: userInfo.id,
          merchant: {botUserName: ctx.botInfo.username},
        },
        relations: ['merchant'],
      });
    }
  }

  async getCustomerOrdersInBasket(ctx: BotContext) {
    const userInfo = ctx.from.is_bot ? ctx.callbackQuery.from : ctx.from;
    return await this.findOne({
      where: {
        telegramId: userInfo.id,
        merchant: {botUserName: ctx.botInfo.username},
      },
      relations: ['orders', 'orders.orderItems', 'merchant'],
    });
  }
}
