import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InquiryService } from '../inquiry/inquiry.service';
import { DeliveryService } from '../delivery/delivery.service';
import * as schema from '../database/schema';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly retryDelays = [2000, 4000, 8000]; // 2s, 4s, 8s in milliseconds

  constructor(
    private readonly inquiryService: InquiryService,
    private readonly deliveryService: DeliveryService,
  ) {}

  // Run every minute to check for failed deliveries that need retry
  @Cron(CronExpression.EVERY_MINUTE)
  async processFailedDeliveries(): Promise<void> {
    try {
      this.logger.log('Processing failed deliveries...');

      const failedDeliveries = await this.inquiryService.getFailedDeliveries();

      if (failedDeliveries.length === 0) {
        this.logger.log('No failed deliveries to process');
        return;
      }

      this.logger.log(
        `Found ${failedDeliveries.length} failed deliveries to retry`,
      );

      for (const delivery of failedDeliveries) {
        await this.processDeliveryRetry(delivery);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing failed deliveries: ${errorMessage}`);
    }
  }

  private async processDeliveryRetry(delivery: schema.Delivery): Promise<void> {
    try {
      // Check if we should retry based on attempts and time
      if (delivery.attempts >= 3) {
        // Max retries reached, mark as gave up
        await this.inquiryService.updateDeliveryStatus(
          delivery.id,
          'GAVE_UP' as const,
          'Maximum retry attempts reached',
        );
        this.logger.warn(
          `Delivery ${delivery.id} gave up after ${delivery.attempts} attempts`,
        );
        return;
      }

      // Calculate delay based on attempt number
      const delayMs =
        this.retryDelays[delivery.attempts] ||
        this.retryDelays[this.retryDelays.length - 1];

      // Check if enough time has passed since last attempt
      const timeSinceLastAttempt =
        Date.now() - new Date(delivery.updatedAt).getTime();
      if (timeSinceLastAttempt < delayMs) {
        // Not enough time has passed, skip this delivery for now
        return;
      }

      this.logger.log(
        `Retrying delivery ${delivery.id} (attempt ${delivery.attempts + 1}/${3})`,
      );

      // Get the inquiry data for this delivery
      const inquiry = await this.inquiryService.getInquiry(delivery.inquiryId);
      if (!inquiry) {
        this.logger.error(
          `Inquiry ${delivery.inquiryId} not found for delivery ${delivery.id}`,
        );
        await this.inquiryService.updateDeliveryStatus(
          delivery.id,
          'FAILED' as const,
          'Associated inquiry not found',
        );
        return;
      }

      // Attempt the delivery based on channel
      let result: { success: boolean; error?: string };

      switch (delivery.channel) {
        case 'EMAIL':
          result = await this.deliveryService.sendEmailNotification({
            fullName: inquiry.fullName,
            phone: inquiry.phone,
            email: inquiry.email,
            preferredClass: inquiry.preferredClass,
          });
          break;

        case 'CRM_WEBHOOK':
          result = await this.deliveryService.sendCrmWebhook({
            fullName: inquiry.fullName,
            phone: inquiry.phone,
            email: inquiry.email,
            preferredClass: inquiry.preferredClass,
          });
          break;

        case 'STAFF_TELEGRAM':
          result = await this.deliveryService.sendStaffTelegramNotification({
            fullName: inquiry.fullName,
            phone: inquiry.phone,
            email: inquiry.email,
            preferredClass: inquiry.preferredClass,
          });
          break;

        default:
          this.logger.error(
            `Unknown delivery channel: ${String(delivery.channel)}`,
          );
          await this.inquiryService.updateDeliveryStatus(
            delivery.id,
            'FAILED' as const,
            'Unknown delivery channel',
          );
          return;
      }

      // Update delivery status based on result
      if (result.success) {
        await this.inquiryService.updateDeliveryStatus(
          delivery.id,
          'SUCCESS' as const,
        );
        this.logger.log(
          `Delivery ${delivery.id} succeeded on retry attempt ${delivery.attempts + 1}`,
        );
      } else {
        await this.inquiryService.incrementDeliveryAttempts(delivery.id);
        await this.inquiryService.updateDeliveryStatus(
          delivery.id,
          'FAILED' as const,
          result.error,
        );
        this.logger.warn(
          `Delivery ${delivery.id} failed on retry attempt ${delivery.attempts + 1}: ${result.error}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error processing delivery retry ${delivery.id}: ${errorMessage}`,
      );

      // Increment attempts and mark as failed
      try {
        await this.inquiryService.incrementDeliveryAttempts(delivery.id);
        await this.inquiryService.updateDeliveryStatus(
          delivery.id,
          'FAILED' as const,
          errorMessage,
        );
      } catch (updateError) {
        const updateErrorMessage =
          updateError instanceof Error ? updateError.message : 'Unknown error';
        this.logger.error(
          `Failed to update delivery status after error: ${updateErrorMessage}`,
        );
      }
    }
  }

  // Manual retry method for specific delivery
  async retryDelivery(
    deliveryId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const deliveryWithInquiry =
        await this.inquiryService.getInquiryWithDeliveries(deliveryId);

      if (!deliveryWithInquiry) {
        return { success: false, message: 'Delivery not found' };
      }

      const delivery = deliveryWithInquiry.deliveries.find(
        (d) => d.id === deliveryId,
      );
      if (!delivery) {
        return { success: false, message: 'Delivery not found in inquiry' };
      }

      if (delivery.status === ('SUCCESS' as const)) {
        return { success: false, message: 'Delivery already succeeded' };
      }

      if (delivery.attempts >= 3) {
        return { success: false, message: 'Maximum retry attempts reached' };
      }

      await this.processDeliveryRetry(delivery);
      return { success: true, message: 'Retry initiated' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Manual retry failed for delivery ${deliveryId}: ${errorMessage}`,
      );
      return { success: false, message: errorMessage };
    }
  }

  // Get retry statistics
  getRetryStatistics(): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    gaveUpDeliveries: number;
    pendingDeliveries: number;
  }> {
    try {
      // This would need to be implemented in InquiryService
      // For now, return placeholder data
      return Promise.resolve({
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        gaveUpDeliveries: 0,
        pendingDeliveries: 0,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get retry statistics: ${errorMessage}`);
      throw error;
    }
  }

  // Process immediate delivery (for new inquiries)
  async processImmediateDelivery(inquiryId: string): Promise<void> {
    try {
      this.logger.log(`Processing immediate delivery for inquiry ${inquiryId}`);

      const inquiryWithDeliveries =
        await this.inquiryService.getInquiryWithDeliveries(inquiryId);

      if (!inquiryWithDeliveries) {
        throw new Error(`Inquiry ${inquiryId} not found`);
      }

      const pendingDeliveries = inquiryWithDeliveries.deliveries.filter(
        (d) => d.status === ('PENDING' as const),
      );

      for (const delivery of pendingDeliveries) {
        await this.attemptDelivery(delivery, inquiryWithDeliveries);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to process immediate delivery for inquiry ${inquiryId}: ${errorMessage}`,
      );
      throw error;
    }
  }

  private async attemptDelivery(
    delivery: schema.Delivery,
    inquiry: schema.Inquiry,
  ): Promise<void> {
    try {
      let result: { success: boolean; error?: string };

      const inquiryDto = {
        fullName: inquiry.fullName,
        phone: inquiry.phone,
        email: inquiry.email,
        preferredClass: inquiry.preferredClass,
      };

      switch (delivery.channel) {
        case 'EMAIL':
          result = await this.deliveryService.sendEmailNotification(inquiryDto);
          break;
        case 'CRM_WEBHOOK':
          result = await this.deliveryService.sendCrmWebhook(inquiryDto);
          break;
        case 'STAFF_TELEGRAM':
          result =
            await this.deliveryService.sendStaffTelegramNotification(
              inquiryDto,
            );
          break;
        default:
          throw new Error(
            `Unknown delivery channel: ${String(delivery.channel)}`,
          );
      }

      if (result.success) {
        await this.inquiryService.updateDeliveryStatus(
          delivery.id,
          'SUCCESS' as const,
        );
        this.logger.log(
          `Immediate delivery ${delivery.id} (${delivery.channel}) succeeded`,
        );
      } else {
        await this.inquiryService.incrementDeliveryAttempts(delivery.id);
        await this.inquiryService.updateDeliveryStatus(
          delivery.id,
          'FAILED' as const,
          result.error,
        );
        this.logger.warn(
          `Immediate delivery ${delivery.id} (${delivery.channel}) failed: ${result.error}`,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Attempt delivery failed for ${delivery.id}: ${errorMessage}`,
      );

      try {
        await this.inquiryService.incrementDeliveryAttempts(delivery.id);
        await this.inquiryService.updateDeliveryStatus(
          delivery.id,
          'FAILED' as const,
          errorMessage,
        );
      } catch (updateError) {
        const updateErrorMessage =
          updateError instanceof Error ? updateError.message : 'Unknown error';
        this.logger.error(
          `Failed to update delivery status: ${updateErrorMessage}`,
        );
      }
    }
  }
}
