import { Update, Start, Help, On, Ctx, Command, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import { ContentService } from '../content/content.service';
import { InquiryService } from '../inquiry/inquiry.service';
import { RetryService } from '../retry/retry.service';
import { createInquirySchema } from '../schemas/inquiry.schema';
import { Logger } from '@nestjs/common';
import {
  helpfulMessage,
  helpMessage,
  submissionFailedMessage,
  submissionSuccessMessage,
  welcomeMessage,
} from './message';

interface SessionData {
  awaitingInquiry?: boolean;
  inquiryStep?: 'name' | 'phone' | 'email' | 'class';
  inquiryData?: {
    fullName?: string;
    phone?: string;
    email?: string;
    preferredClass?: string;
  };
}

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);
  private readonly userSessions = new Map<number, SessionData>();

  constructor(
    private readonly contentService: ContentService,
    private readonly inquiryService: InquiryService,
    private readonly retryService: RetryService,
  ) {}

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    this.logger.log(`📨 Received /start command from user ${ctx.from?.id}`);

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('💰 Membership Pricing', 'pricing')],
      [Markup.button.callback('📅 Class Timetable', 'timetable')],
      [Markup.button.callback('🏃 Personal Training', 'pt_packages')],
      [Markup.button.callback('🎉 Current Promotions', 'promotions')],
      [Markup.button.callback('📞 Contact Us', 'contact')],
    ]);

    try {
      await ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
      this.logger.log(
        `✅ Successfully sent welcome message to user ${ctx.from?.id}`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome message: ${error}`);
    }
  }

  @Help()
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  }

  @Command('pricing')
  @Action('pricing')
  async pricingCommand(@Ctx() ctx: Context) {
    try {
      const pricingMessage =
        await this.contentService.formatPricingForTelegram();

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📞 Get More Info', 'contact')],
        [Markup.button.callback('🔙 Back to Menu', 'main_menu')],
      ]);

      await ctx.reply(pricingMessage, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      this.logger.error(
        `Error fetching pricing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await ctx.reply(
        "Sorry, I couldn't fetch the pricing information right now. Please try again later.",
      );
    }
  }

  @Command('timetable')
  @Action('timetable')
  async timetableCommand(@Ctx() ctx: Context) {
    try {
      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('📅 Today', 'today'),
          Markup.button.callback('📅 Tomorrow', 'tomorrow'),
        ],
        [Markup.button.callback('📋 Full Week', 'full_timetable')],
        [Markup.button.callback('🔙 Back to Menu', 'main_menu')],
      ]);

      await ctx.reply(
        '📅 *Class Timetable*\n\nWhich schedule would you like to see?',
        {
          parse_mode: 'Markdown',
          ...keyboard,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error in timetable command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await ctx.reply(
        "Sorry, I couldn't load the timetable options. Please try again later.",
      );
    }
  }

  @Command('today')
  @Action('today')
  async todayCommand(@Ctx() ctx: Context) {
    try {
      const todayMessage = await this.contentService.formatTimetableForTelegram(
        new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      );

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📞 Book a Class', 'contact')],
        [Markup.button.callback('🔙 Back to Menu', 'main_menu')],
      ]);

      await ctx.reply(todayMessage, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      this.logger.error(
        `Error fetching today's schedule: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await ctx.reply(
        "Sorry, I couldn't fetch today's schedule. Please try again later.",
      );
    }
  }

  @Command('tomorrow')
  @Action('tomorrow')
  async tomorrowCommand(@Ctx() ctx: Context) {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDay = tomorrow.toLocaleDateString('en-US', {
        weekday: 'long',
      });

      const tomorrowMessage =
        await this.contentService.formatTimetableForTelegram(tomorrowDay);

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📞 Book a Class', 'contact')],
        [Markup.button.callback('🔙 Back to Menu', 'main_menu')],
      ]);

      await ctx.reply(tomorrowMessage, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      this.logger.error(
        `Error fetching tomorrow's schedule: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await ctx.reply(
        "Sorry, I couldn't fetch tomorrow's schedule. Please try again later.",
      );
    }
  }

  @Action('full_timetable')
  async fullTimetableAction(@Ctx() ctx: Context) {
    try {
      const fullTimetableMessage =
        await this.contentService.formatTimetableForTelegram();

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📞 Book a Class', 'contact')],
        [Markup.button.callback('🔙 Back to Menu', 'main_menu')],
      ]);

      await ctx.reply(fullTimetableMessage, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      this.logger.error(
        `Error fetching full timetable: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await ctx.reply(
        "Sorry, I couldn't fetch the full timetable. Please try again later.",
      );
    }
  }

  @Command('pt')
  @Action('pt_packages')
  async ptPackagesCommand(@Ctx() ctx: Context) {
    try {
      const ptMessage = await this.contentService.formatPtPackagesForTelegram();

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📞 Get More Info', 'contact')],
        [Markup.button.callback('🔙 Back to Menu', 'main_menu')],
      ]);

      await ctx.reply(ptMessage, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      this.logger.error(
        `Error fetching PT packages: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await ctx.reply(
        "Sorry, I couldn't fetch the personal training packages. Please try again later.",
      );
    }
  }

  @Command('promotions')
  @Action('promotions')
  async promotionsCommand(@Ctx() ctx: Context) {
    try {
      const promotionsMessage =
        await this.contentService.formatPromotionsForTelegram();

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('📞 Learn More', 'contact')],
        [Markup.button.callback('🔙 Back to Menu', 'main_menu')],
      ]);

      await ctx.reply(promotionsMessage, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      console.error('Error fetching promotions:', error);
      this.logger.error(
        `Error fetching promotions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await ctx.reply(
        "Sorry, I couldn't fetch the current promotions. Please try again later.",
      );
    }
  }

  @Command('contact')
  @Action('contact')
  async contactCommand(@Ctx() ctx: Context) {
    const contactMessage = `
📞 *Contact Forge Fitness*

Ready to start your fitness journey? Our team is here to help!

*Ways to reach us:*
📧 Email: jomaritiu16@gmail.com
📍 Visit us at our gym location
🌐 Website: https://forge-fitness-phi.vercel.app/

*Want us to contact you?*
Click the button below to provide your details and we'll get back to you within 24 hours!
    `;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📝 Request Callback', 'start_inquiry')],
      [Markup.button.callback('🔙 Back to Menu', 'main_menu')],
    ]);

    await ctx.reply(contactMessage, {
      parse_mode: 'Markdown',
      ...keyboard,
    });
  }

  @Action('start_inquiry')
  async startInquiryAction(@Ctx() ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    this.userSessions.set(userId, {
      awaitingInquiry: true,
      inquiryStep: 'name',
      inquiryData: {},
    });

    const inquiryMessage = `
📝 *Request a Callback*

Great! I'll collect some information so our team can contact you.

*Step 1 of 4:* Please enter your full name:
    `;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('❌ Cancel', 'cancel_inquiry')],
    ]);

    await ctx.reply(inquiryMessage, {
      parse_mode: 'Markdown',
      ...keyboard,
    });
  }

  @Action('cancel_inquiry')
  async cancelInquiryAction(@Ctx() ctx: Context) {
    const userId = ctx.from?.id;
    if (userId) {
      this.userSessions.delete(userId);
    }

    await ctx.reply(
      '❌ Callback request cancelled. Feel free to start again anytime!',
    );
    await this.startCommand(ctx);
  }

  @Action('main_menu')
  async mainMenuAction(@Ctx() ctx: Context) {
    await this.startCommand(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    const userId = ctx.from?.id;
    const message =
      ctx.message && 'text' in ctx.message ? (ctx.message.text ?? '') : '';

    if (!userId) return;

    const session = this.userSessions.get(userId);

    // Handle inquiry flow
    if (session?.awaitingInquiry) {
      await this.handleInquiryStep(ctx, message, session);
      return;
    }

    // Handle general questions
    await this.handleGeneralQuestion(ctx, message);
  }

  private async handleInquiryStep(
    ctx: Context,
    message: string,
    session: SessionData,
  ) {
    const userId = ctx.from?.id;
    if (!userId) return;

    try {
      switch (session.inquiryStep) {
        case 'name':
          if (message.trim().length < 2) {
            await ctx.reply(
              'Please enter a valid name (at least 2 characters):',
            );
            return;
          }
          session.inquiryData!.fullName = message.trim();
          session.inquiryStep = 'phone';
          await ctx.reply('*Step 2 of 4:* Please enter your phone number:', {
            parse_mode: 'Markdown',
          });
          break;

        case 'phone':
          if (!/^[0-9+\-\s()]+$/.test(message) || message.length < 10) {
            await ctx.reply('Please enter a valid phone number:');
            return;
          }
          session.inquiryData!.phone = message.trim();
          session.inquiryStep = 'email';
          await ctx.reply('*Step 3 of 4:* Please enter your email address:', {
            parse_mode: 'Markdown',
          });
          break;

        case 'email': {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(message)) {
            await ctx.reply('Please enter a valid email address:');
            return;
          }
          session.inquiryData!.email = message.trim();
          session.inquiryStep = 'class';
          await ctx.reply(
            '*Step 4 of 4:* What type of classes or services are you interested in?\n\n(e.g., "Weight training", "Cardio classes", "Personal training", "General fitness")',
            { parse_mode: 'Markdown' },
          );
          break;
        }

        case 'class':
          if (message.trim().length < 1) {
            await ctx.reply("Please tell us what you're interested in:");
            return;
          }
          session.inquiryData!.preferredClass = message.trim();
          await this.submitInquiry(ctx, session.inquiryData!);
          this.userSessions.delete(userId);
          break;
      }

      this.userSessions.set(userId, session);
    } catch (error) {
      this.logger.error(
        `Error handling inquiry step: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await ctx.reply(
        'Sorry, there was an error processing your information. Please try again.',
      );
      this.userSessions.delete(userId);
    }
  }

  private async submitInquiry(ctx: Context, inquiryData: any) {
    try {
      // Validate the inquiry data
      const validatedData = createInquirySchema.parse(inquiryData);

      // Create the inquiry
      const inquiry = await this.inquiryService.createInquiry(validatedData);

      // Process immediate deliveries
      await this.retryService.processImmediateDelivery(inquiry.id);

      const successMessage = submissionSuccessMessage(validatedData);

      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('💰 View Pricing', 'pricing')],
        [Markup.button.callback('📅 Class Schedule', 'timetable')],
        [Markup.button.callback('🔙 Main Menu', 'main_menu')],
      ]);

      await ctx.reply(successMessage, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    } catch (error) {
      this.logger.error(
        `Error submitting inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      await ctx.reply(submissionFailedMessage, { parse_mode: 'Markdown' });
    }
  }

  private async handleGeneralQuestion(ctx: Context, message: string) {
    const lowerMessage = message.toLowerCase();

    // Simple keyword matching for common questions
    if (
      lowerMessage.includes('price') ||
      lowerMessage.includes('cost') ||
      lowerMessage.includes('membership')
    ) {
      await this.pricingCommand(ctx);
    } else if (
      lowerMessage.includes('class') ||
      lowerMessage.includes('schedule') ||
      lowerMessage.includes('time')
    ) {
      await this.timetableCommand(ctx);
    } else if (
      lowerMessage.includes('personal training') ||
      lowerMessage.includes('pt') ||
      lowerMessage.includes('trainer')
    ) {
      await this.ptPackagesCommand(ctx);
    } else if (
      lowerMessage.includes('promotion') ||
      lowerMessage.includes('offer') ||
      lowerMessage.includes('deal')
    ) {
      await this.promotionsCommand(ctx);
    } else if (
      lowerMessage.includes('contact') ||
      lowerMessage.includes('phone') ||
      lowerMessage.includes('call')
    ) {
      await this.contactCommand(ctx);
    } else {
      // Generic helpful response

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback('💰 Pricing', 'pricing'),
          Markup.button.callback('📅 Schedule', 'timetable'),
        ],
        [
          Markup.button.callback('🏃 Personal Training', 'pt_packages'),
          Markup.button.callback('📞 Contact', 'contact'),
        ],
        [Markup.button.callback('🔙 Main Menu', 'main_menu')],
      ]);

      await ctx.reply(helpfulMessage, {
        parse_mode: 'Markdown',
        ...keyboard,
      });
    }
  }

  @Command('status')
  async status(@Ctx() ctx: Context) {
    await ctx.reply(
      '✅ Forge Fitness Bot is running smoothly! Use /start to see the main menu.',
    );
  }
}
