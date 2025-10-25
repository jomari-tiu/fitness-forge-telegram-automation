import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../database/schema';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);
  private pricingCache: schema.Pricing[] = [];
  private timetableCache: schema.Timetable[] = [];
  private ptPackagesCache: schema.PtPackage[] = [];
  private promotionsCache: schema.Promotion[] = [];
  private lastCacheUpdate = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  private async refreshCache(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate < this.CACHE_DURATION) {
      return; // Cache is still fresh
    }

    try {
      this.logger.log('Refreshing content cache...');

      const [pricing, timetable, ptPackages, promotions] = await Promise.all([
        this.db
          .select()
          .from(schema.pricing)
          .where(eq(schema.pricing.isActive, 1)),
        this.db
          .select()
          .from(schema.timetable)
          .where(eq(schema.timetable.isActive, 1)),
        this.db
          .select()
          .from(schema.ptPackages)
          .where(eq(schema.ptPackages.isActive, 1)),
        this.db
          .select()
          .from(schema.promotions)
          .where(eq(schema.promotions.isActive, 1)),
      ]);

      this.pricingCache = pricing;
      this.timetableCache = timetable;
      this.ptPackagesCache = ptPackages;
      this.promotionsCache = promotions.filter(
        (p) => new Date(p.validUntil) > new Date(),
      );

      this.lastCacheUpdate = now;
      this.logger.log('Content cache refreshed successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to refresh cache: ${errorMessage}`);
      throw new Error('Failed to refresh content cache');
    }
  }

  async getPricing(): Promise<schema.Pricing[]> {
    await this.refreshCache();
    return this.pricingCache;
  }

  async getTimetable(day?: string): Promise<schema.Timetable[]> {
    await this.refreshCache();

    if (day) {
      return this.timetableCache.filter(
        (t) => t.day.toLowerCase() === day.toLowerCase(),
      );
    }

    return this.timetableCache;
  }

  async getTodaysTimetable(): Promise<schema.Timetable[]> {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return this.getTimetable(today);
  }

  async getTomorrowsTimetable(): Promise<schema.Timetable[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', {
      weekday: 'long',
    });
    return this.getTimetable(tomorrowDay);
  }

  async getPtPackages(): Promise<schema.PtPackage[]> {
    await this.refreshCache();
    return this.ptPackagesCache;
  }

  async getPromotions(): Promise<schema.Promotion[]> {
    await this.refreshCache();
    return this.promotionsCache;
  }

  async getActivePromotions(): Promise<schema.Promotion[]> {
    await this.refreshCache();
    const now = new Date();
    return this.promotionsCache.filter((p) => new Date(p.validUntil) > now);
  }

  // Format methods for Telegram display
  formatPricingForTelegram(): Promise<string> {
    return this.getPricing().then((pricing) => {
      if (pricing.length === 0) {
        return '💰 *Membership Pricing*\n\nNo pricing information available at the moment. Please contact us for current rates!';
      }

      let message = '💰 *Membership Pricing*\n\n';
      pricing.forEach((p) => {
        message += `🏋️ *${p.title}*\n`;
        message += `💵 $${p.price}\n`;
        message += `📝 ${p.description}\n\n`;
      });

      return message.trim();
    });
  }

  formatTimetableForTelegram(day?: string): Promise<string> {
    return this.getTimetable(day).then((timetable) => {
      if (timetable.length === 0) {
        const dayText = day ? ` for ${day}` : '';
        return `📅 *Class Timetable${dayText}*\n\nNo classes scheduled${dayText}. Please check back later!`;
      }

      const dayText = day ? ` - ${day}` : '';
      let message = `📅 *Class Timetable${dayText}*\n\n`;

      // Group by day if showing all days
      if (!day) {
        const groupedByDay = timetable.reduce(
          (acc, t) => {
            if (!acc[t.day]) acc[t.day] = [];
            acc[t.day].push(t);
            return acc;
          },
          {} as Record<string, schema.Timetable[]>,
        );

        Object.entries(groupedByDay).forEach(([dayName, classes]) => {
          message += `*${dayName}*\n`;
          classes.forEach((c) => {
            message += `🕐 ${c.startTime} - ${c.endTime}: ${c.className}`;
            if (c.instructor) message += ` (${c.instructor})`;
            message += `\n`;
          });
          message += '\n';
        });
      } else {
        timetable.forEach((c) => {
          message += `🕐 ${c.startTime} - ${c.endTime}: ${c.className}`;
          if (c.instructor) message += ` (${c.instructor})`;
          if (c.capacity) message += ` [${c.capacity} spots]`;
          message += `\n`;
        });
      }

      return message.trim();
    });
  }

  formatPtPackagesForTelegram(): Promise<string> {
    return this.getPtPackages().then((packages) => {
      if (packages.length === 0) {
        return '🏃 *Personal Training Packages*\n\nNo PT packages available at the moment. Please contact us for personalized training options!';
      }

      let message = '🏃 *Personal Training Packages*\n\n';
      packages.forEach((p) => {
        message += `💪 *${p.name}*\n`;
        message += `📊 ${p.sessions} sessions\n`;
        message += `💵 $${p.price}\n`;
        if (p.duration) message += `⏱️ ${p.duration}\n`;
        message += `📝 ${p.description}\n\n`;
      });

      return message.trim();
    });
  }

  formatPromotionsForTelegram(): Promise<string> {
    return this.getActivePromotions().then((promotions) => {
      if (promotions.length === 0) {
        return '🎉 *Current Promotions*\n\nNo active promotions at the moment. Check back soon for exciting offers!';
      }

      let message = '🎉 *Current Promotions*\n\n';
      promotions.forEach((p) => {
        const validUntil = new Date(p.validUntil).toLocaleDateString();
        message += `🔥 *${p.title}*\n`;
        message += `${p.content}\n`;
        message += `⏰ Valid until: ${validUntil}\n\n`;
      });

      return message.trim();
    });
  }

  // Clear cache manually (useful for admin operations)
  clearCache(): void {
    this.lastCacheUpdate = 0;
    this.logger.log('Content cache cleared');
  }
}
