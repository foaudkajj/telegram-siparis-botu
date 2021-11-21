import { Injectable } from '@nestjs/common';
import { Scenes } from 'telegraf';
import { getCustomRepository } from 'typeorm';
import { BotContext } from '../interfaces/BotContext';
import { CallBackQueryResult } from '../models/CallBackQueryResult';
import { CustomerRepository } from '../custom-repositories/CustomerRepository';
import { OrderRepository } from '../custom-repositories/OrderRepository';

@Injectable()
export class AddressWizardService {
  customerRepository: CustomerRepository = getCustomRepository(
    CustomerRepository
  );

  orderRepository = getCustomRepository(OrderRepository);
  constructor () {}
  InitilizeAdressWizard () {
    const address = new Scenes.WizardScene(
      'address',
      async (ctx: BotContext) => {
        if (ctx.updateType === 'callback_query') ctx.answerCbQuery();

        if (ctx.message && 'text' in ctx.message) {
          await ctx.reply(
            'Lütfen konumunuzu gönderiniz. Göndermek istemiyorsanız, <b>istemiyorum</b> yazınız. \n Tekrar Ana Menüye dönmek için bu komutu çalıştırınız /iptal',
            {
              parse_mode: 'HTML'
            }
          );
          ctx.scene.session.address = ctx.message.text;
          return ctx.wizard.next();
        } else {
          await ctx.reply(
            'Lütfen Açık Adresinizi Giriniz. \n Tekrar Ana Menüye dönmek için bu komutu çalıştırınız /iptal'
          );
        }
      },
      async (ctx: BotContext) => {
        if (
          ctx?.message &&
          'text' in ctx.message &&
          ctx.message.text?.toLowerCase() == 'istemiyorum'
        ) {
          ctx.scene.session.isLocation = false;
          await this.SaveAddressToDBAndLeaveWizard(ctx);
        } else {
          if (
            ctx?.message &&
            'location' in ctx.message &&
            ctx.message.location
          ) {
            ctx.scene.session.isLocation = true;
            ctx.scene.session.latitude = ctx.message.location.latitude;
            ctx.scene.session.longitude = ctx.message.location.longitude;
            await this.SaveAddressToDBAndLeaveWizard(ctx);
          } else {
            ctx.scene.session.isLocation = false;
            if (ctx.updateType === 'callback_query') ctx.answerCbQuery();
            await ctx.reply(
              'Lütfen konumunuzu gönderiniz. Göndermek istemiyorsanız, <b>istemiyorum</b> yazınız. \n Tekrar Ana Menüye dönmek için bu komutu çalıştırınız /iptal',
              {
                parse_mode: 'HTML'
              }
            );
          }
        }
      }
    );
    return address;
  }

  async SaveAddressToDBAndLeaveWizard (ctx: BotContext) {
    const order = await this.orderRepository.getOrderInBasketByTelegramId(ctx, [
      'TelegramOrder'
    ]);
    if (order) {
      order.TelegramOrder.Address = ctx.scene.session?.address;
      if (ctx.scene.session.isLocation) {
        order.TelegramOrder.Location = JSON.stringify({
          latitude: ctx.scene.session.latitude,
          longitude: ctx.scene.session.longitude
        });
      }
      await this.orderRepository.save(order);
    }
    await ctx.scene.leave();
    await this.AskIfUserWantsToAddNote(ctx);
  }

  async AskIfUserWantsToAddNote (ctx: BotContext) {
    await ctx.replyWithMarkdown(
      '<b>Siparişinize bir not eklemek ister misiniz?</b> \n \n',
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Evet', callback_data: CallBackQueryResult.AddNoteToOrder },
              { text: 'Hayır', callback_data: CallBackQueryResult.ConfirmOrder }
            ]
          ]
        }
      }
    );
  }
}
