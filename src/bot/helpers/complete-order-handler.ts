import {getCustomRepository} from 'typeorm';
import {OrderRepository} from '../custom-repositories/order-repository';
import {BotContext} from '../interfaces/bot-context';
import {CallBackQueryResult} from '../models/enums';

export abstract class CompleteOrderHandler {
  static async CompleteOrder(ctx: BotContext) {
    const orderRepository = getCustomRepository(OrderRepository);
    try {
      const ordersInBasket = await orderRepository.getOrderInBasketByTelegramId(
        ctx,
        ['customer'],
      );
      if (ordersInBasket) {
        const customer = ordersInBasket.customer;
        if (ctx.updateType === 'callback_query') await ctx.answerCbQuery();
        if (customer.address) {
          if (customer.location) {
            const location = JSON.parse(customer.location);
            await ctx.replyWithLocation(location.latitude, location.longitude);
          }

          await ctx.replyWithMarkdown(
            `<i>${customer.address}</i> \n \n` +
              '<b>Kayıtlı olan adres ve konumunuz mu kullanalım?</b> \n \n' +
              '<b>Note:</b> Açık adres ile konum uyuşmadığı tadirde, açık adres kullanılacaktır.',
            {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Evet',
                      callback_data: CallBackQueryResult.ConfirmOrder,
                    },
                    {
                      text: 'Hayır',
                      callback_data: CallBackQueryResult.EnterAddress,
                    },
                  ],
                ],
              },
            },
          );
        } else {
          await ctx.scene.enter(
            'address',
            // ctx.reply(
            //   'Lütfen Açık Adresinizi Giriniz. \n Tekrar Ana Menüye dönmek için bu komutu çalıştırınız /iptal',
            // ),
          );
        }
      } else {
        await ctx.answerCbQuery('Sepetiniz Boştur. Lütfen Ürün Seçiniz');
      }
    } catch (error) {
      // Loglama
      console.log(error);
      await ctx.answerCbQuery(
        'Bir hata oluştu. Lütfen tekrar deneyiniz. /start',
      );
    }
  }
}
