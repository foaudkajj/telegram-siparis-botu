import { OrderStatus } from "src/DB/enums/OrderStatus";
import { Order } from "src/DB/models/Order";
import { TelegramUser } from "src/DB/models/TelegramUser";
import { getCustomRepository, getRepository, Repository } from "typeorm";
import { UserRepository } from "../custom-repositories/UserRepository";
import { BotContext } from "../interfaces/BotContext";
import { CallBackQueryResult } from "../models/CallBackQueryResult";

export abstract class CompleteOrderHandler {

    static async CompleteOrder(ctx: BotContext) {
        const orderRepository: Repository<Order> = getRepository(Order);
        try {
            const userInfo = ctx.from.is_bot ? ctx.callbackQuery.from : ctx.from;

            const ordersInBasket = await orderRepository.find({ where: { userId: userInfo.id, Status: OrderStatus.InBasket, }, relations: ["user"] });
            if (ordersInBasket.length > 0) {
                const user = ordersInBasket[0].user;
                await ctx.answerCbQuery();
                if (user.Address) {


                    if (user.Location) {
                        const location = JSON.parse(user.Location);
                        await ctx.replyWithLocation(
                            location.latitude,
                            location.longitude
                        );
                    }


                    await ctx.replyWithMarkdown(`<i>${user.Address}</i> \n \n`
                        + '<b>Kayıtlı olan adres ve konumunuz mu kullanalım?</b> \n \n'
                        + '<b>Note:</b> Açık adres ile konumun uyuşmadığı tadirde, açık adres kullanılacaktır.',
                        {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard:
                                    [
                                        [
                                            { text: 'Evet', callback_data: CallBackQueryResult.ConfirmOrder },
                                            { text: 'Hayır', callback_data: CallBackQueryResult.EnterAddress }
                                        ]
                                    ]
                            }
                        });
                } else {
                    await ctx.scene.enter('address', ctx.reply('Lütfen Açık Adresinizi Giriniz. \n Tekrar Ana Menüye dönmek için bu komutu çalıştırınız /iptal'));
                }
            } else {
                await ctx.answerCbQuery("Sepetiniz Boştur. Lütfen Ürün Seçiniz");
            }
        } catch (error) {
            //Loglama
            console.log(error);
            await ctx.answerCbQuery("Bir hata oluştu. Lütfen tekrar deneyiniz. /start")
        }

    }

}