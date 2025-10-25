import { Injectable, Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../database/schema';
import { DATABASE_CONNECTION } from '../database/database.module';
import { CreateInquiryDto } from '../schemas/inquiry.schema';
import { createInquirySchema } from '../schemas/inquiry.schema';
import { ZodError } from 'zod';

@Injectable()
export class InquiryService {
  private readonly logger = new Logger(InquiryService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async createInquiry(inquiryData: CreateInquiryDto): Promise<schema.Inquiry> {
    try {
      // Validate the input data
      const validatedData = createInquirySchema.parse(inquiryData);

      this.logger.log(`Creating inquiry for ${validatedData.fullName}`);

      // Insert the inquiry into the database
      const [inquiry] = await this.db
        .insert(schema.inquiries)
        .values({
          fullName: validatedData.fullName,
          phone: validatedData.phone,
          email: validatedData.email,
          preferredClass: validatedData.preferredClass,
        })
        .returning();

      this.logger.log(`Inquiry created with ID: ${inquiry.id}`);

      // Create delivery records for each channel
      await this.createDeliveryRecords(inquiry.id);

      return inquiry;
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(`Validation error: ${error.message}`);
        throw new Error(
          `Invalid inquiry data: ${error.issues.map((e) => e.message).join(', ')}`,
        );
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create inquiry: ${errorMessage}`);
      throw new Error('Failed to create inquiry');
    }
  }

  private async createDeliveryRecords(inquiryId: string): Promise<void> {
    const deliveryChannels: schema.Delivery['channel'][] = [
      'EMAIL',
      'CRM_WEBHOOK',
      'STAFF_TELEGRAM',
    ];

    try {
      const deliveries = deliveryChannels.map((channel) => ({
        inquiryId,
        channel,
        status: 'PENDING' as const,
        attempts: 0,
      }));

      await this.db.insert(schema.deliveries).values(deliveries);

      this.logger.log(
        `Created ${deliveries.length} delivery records for inquiry ${inquiryId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create delivery records: ${errorMessage}`);
      throw error;
    }
  }

  async getInquiry(id: string): Promise<schema.Inquiry | null> {
    try {
      const [inquiry] = await this.db
        .select()
        .from(schema.inquiries)
        .where(eq(schema.inquiries.id, id))
        .limit(1);

      return inquiry || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get inquiry ${id}: ${errorMessage}`);
      throw new Error('Failed to retrieve inquiry');
    }
  }

  async getInquiryWithDeliveries(
    id: string,
  ): Promise<(schema.Inquiry & { deliveries: schema.Delivery[] }) | null> {
    try {
      const inquiry = await this.db.query.inquiries.findFirst({
        where: eq(schema.inquiries.id, id),
        with: {
          deliveries: true,
        },
      });

      return inquiry || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get inquiry with deliveries ${id}: ${errorMessage}`,
      );
      throw new Error('Failed to retrieve inquiry with deliveries');
    }
  }

  async getPendingDeliveries(): Promise<schema.Delivery[]> {
    try {
      return await this.db
        .select()
        .from(schema.deliveries)
        .where(eq(schema.deliveries.status, 'PENDING' as const));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get pending deliveries: ${errorMessage}`);
      throw new Error('Failed to retrieve pending deliveries');
    }
  }

  async getFailedDeliveries(): Promise<schema.Delivery[]> {
    try {
      return await this.db
        .select()
        .from(schema.deliveries)
        .where(eq(schema.deliveries.status, 'FAILED' as const));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get failed deliveries: ${errorMessage}`);
      throw new Error('Failed to retrieve failed deliveries');
    }
  }

  async updateDeliveryStatus(
    deliveryId: string,
    status: schema.Delivery['status'],
    error?: string,
  ): Promise<void> {
    try {
      await this.db
        .update(schema.deliveries)
        .set({
          status,
          lastError: error || null,
          updatedAt: new Date(),
        })
        .where(eq(schema.deliveries.id, deliveryId));

      this.logger.log(`Updated delivery ${deliveryId} status to ${status}`);
    } catch (dbError) {
      const errorMessage =
        dbError instanceof Error ? dbError.message : 'Unknown error';
      this.logger.error(`Failed to update delivery status: ${errorMessage}`);
      throw new Error('Failed to update delivery status');
    }
  }

  async incrementDeliveryAttempts(deliveryId: string): Promise<void> {
    try {
      // Get current attempts count
      const [delivery] = await this.db
        .select({ attempts: schema.deliveries.attempts })
        .from(schema.deliveries)
        .where(eq(schema.deliveries.id, deliveryId))
        .limit(1);

      if (!delivery) {
        throw new Error(`Delivery ${deliveryId} not found`);
      }

      const newAttempts = delivery.attempts + 1;
      const newStatus =
        newAttempts >= 4 ? ('GAVE_UP' as const) : ('FAILED' as const);

      await this.db
        .update(schema.deliveries)
        .set({
          attempts: newAttempts,
          status: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(schema.deliveries.id, deliveryId));

      this.logger.log(
        `Incremented delivery ${deliveryId} attempts to ${newAttempts}, status: ${newStatus}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to increment delivery attempts: ${errorMessage}`,
      );
      throw new Error('Failed to increment delivery attempts');
    }
  }
}
