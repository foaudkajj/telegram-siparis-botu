import { Injectable, OnModuleInit } from '@nestjs/common';
import { OrderStatus } from 'src/DB/enums/OrderStatus';
import { Order } from 'src/DB/models/Order';
import { Scenes } from 'telegraf';
import { getRepository, Repository } from 'typeorm';
import { ConfirmOrderHandler } from '../helpers/confirm-order.handler';
import { FirstMessageHandler } from '../helpers/first-message-handler';
import { StartOrderingCb } from '../helpers/start-ordering-CB-handler';
import { BotContext } from '../interfaces/BotContext';

@Injectable()
export class AddnoteToOrderWizardService {
    orderRepository: Repository<Order> = getRepository(Order);
    constructor() {

    }
    InitilizeAddnoteToOrderWizard() {

        const AddnoteToOrderWizard = new Scenes.WizardScene('AddNoteToOrder',
            async (ctx: BotContext) => {
                if (ctx.updateType === 'callback_query')
                    ctx.answerCbQuery();


                if (ctx.message && "text" in ctx.message) {
                    await ctx.reply("Kaydedilmiştir...");
                    console.log(ctx.message.text);
                    const userInfo = ctx.from.is_bot ? ctx.callbackQuery.from : ctx.from;
                    await this.orderRepository.update({ userId: userInfo.id, Status: OrderStatus.InBasket }, { Description: ctx.message.text });
                    await ConfirmOrderHandler.ConfirmOrder(ctx);
                    await ctx.scene.leave();
                } else {
                    await ctx.reply('Lütfen Eklemek İstediğiniz notu giriniz.... \n Tekrar Ana Menüye dönmek için bu komutu çalıştırınız /iptal')
                }
            }
        );
        return AddnoteToOrderWizard;
    }

}
