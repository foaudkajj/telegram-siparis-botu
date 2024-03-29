import {Category} from 'src/db/models';
import {OrderStatus} from 'src/db/models/enums';
import {InlineKeyboardButton} from 'telegraf/typings/core/types/typegram';
import {getRepository} from 'typeorm';
import {BotContext} from '../interfaces/bot-context';
import {CallBackQueryResult} from '../models/enums';
import {OrdersInBasketCb} from './get-orders-in-basket-CB-handler';

export abstract class StartOrderingCb {
  public static async StartOrdering(ctx: BotContext) {
    try {
      // const customerRepository = getCustomRepository(CustomerRepository);
      // let cutsomer = await customerRepository.getCustomer(ctx);
      // user.SelectedProducts = null;
      // await customerRepository.update({ TelegramId: cutsomer.TelegramId }, cutsomer);
      const orderDetails = await OrdersInBasketCb.GetOrdersInBasketByStatus(
        ctx,
        OrderStatus.New,
      );
      await this.ShowProductCategories(ctx, orderDetails);
    } catch (e) {
      console.log(e);
    }
  }

  static async ShowProductCategories(ctx: BotContext, orderDetails: string) {
    try {
      const orders =
        orderDetails === null ? 'Lütfen bir ürün seçiniz' : orderDetails;
      const categories: Category[] = await getRepository(Category).find();
      await ctx.editMessageText(orders, {
        parse_mode: 'HTML',
        reply_markup: {
          // one_time_keyboard: true,
          inline_keyboard: [
            ...categories.map(
              mp =>
                <InlineKeyboardButton[]>[
                  {
                    text: mp.name,
                    switch_inline_query_current_chat: mp.categoryKey,
                  },
                ],
            ),
            [
              {
                text: '◀️ Ana Menüye Dön ◀️',
                callback_data: CallBackQueryResult.MainMenu,
              },
            ],
          ],
        },
      });
    } catch (error) {
      // Loglama
      console.log(error);
    }
  }
}
