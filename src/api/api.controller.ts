import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
} from '@nestjs/common';
import { InquiryService } from '../inquiry/inquiry.service';
import { RetryService } from '../retry/retry.service';
import { DeliveryService } from '../delivery/delivery.service';
import {
  CreateInquiryDto,
  createInquirySchema,
} from '../schemas/inquiry.schema';
import { ZodError } from 'zod';

@Controller('api')
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

  constructor(
    private readonly inquiryService: InquiryService,
    private readonly retryService: RetryService,
    private readonly deliveryService: DeliveryService,
  ) {}

  @Post('inquiries')
  @HttpCode(HttpStatus.OK)
  async createInquiry(
    @Body() body: any,
  ): Promise<{ message: string; inquiryId?: string }> {
    try {
      this.logger.log('Received inquiry via API endpoint');

      // Validate the request body
      const validatedData = createInquirySchema.parse(body);

      // Create the inquiry
      const inquiry = await this.inquiryService.createInquiry(validatedData);

      // Process immediate deliveries
      await this.retryService.processImmediateDelivery(inquiry.id);

      this.logger.log(`Inquiry created successfully with ID: ${inquiry.id}`);

      return {
        message: '✅ Message sent successfully',
        inquiryId: inquiry.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create inquiry via API: ${errorMessage}`);

      if (error instanceof ZodError) {
        return {
          message: `⚠️ Invalid data: ${error.issues.map((e) => e.message).join(', ')}`,
        };
      }

      return {
        message: '⚠️ Unable to reach system',
      };
    }
  }

  @Get('health')
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    services: any;
  }> {
    const timestamp = new Date().toISOString();

    try {
      // Test all services
      const [emailTest, crmTest, telegramTest] = await Promise.allSettled([
        this.deliveryService.testEmailConfiguration(),
        this.deliveryService.testCrmWebhook(),
        this.deliveryService.testStaffTelegramNotification(),
      ]);

      const services = {
        email: emailTest.status === 'fulfilled' ? emailTest.value : false,
        crm: crmTest.status === 'fulfilled' ? crmTest.value : false,
        telegram:
          telegramTest.status === 'fulfilled' ? telegramTest.value : false,
      };

      const allHealthy = Object.values(services).every(
        (status) => status === true,
      );

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp,
        services,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Health check failed: ${errorMessage}`);

      return {
        status: 'unhealthy',
        timestamp,
        services: {
          email: false,
          crm: false,
          telegram: false,
        },
      };
    }
  }

  @Get('stats')
  async getStats(): Promise<any> {
    try {
      const stats = await this.retryService.getRetryStatistics();

      return {
        status: 'success',
        data: stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get stats: ${errorMessage}`);

      return {
        status: 'error',
        message: 'Failed to retrieve statistics',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('test-delivery')
  @HttpCode(HttpStatus.OK)
  async testDelivery(
    @Body() body: { channel: 'EMAIL' | 'CRM_WEBHOOK' | 'STAFF_TELEGRAM' },
  ): Promise<{ message: string; success: boolean }> {
    try {
      const testInquiry: CreateInquiryDto = {
        fullName: 'Test User',
        phone: '1234567890',
        email: 'test@example.com',
        preferredClass: 'Test Class',
      };

      let result: { success: boolean; error?: string };

      switch (body.channel) {
        case 'EMAIL':
          result =
            await this.deliveryService.sendEmailNotification(testInquiry);
          break;
        case 'CRM_WEBHOOK':
          result = await this.deliveryService.sendCrmWebhook(testInquiry);
          break;
        case 'STAFF_TELEGRAM':
          result =
            await this.deliveryService.sendStaffTelegramNotification(
              testInquiry,
            );
          break;
        default:
          return {
            message: 'Invalid channel specified',
            success: false,
          };
      }

      return {
        message: result.success
          ? `${body.channel} test successful`
          : `${body.channel} test failed: ${result.error}`,
        success: result.success,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Test delivery failed: ${errorMessage}`);

      return {
        message: `Test failed: ${errorMessage}`,
        success: false,
      };
    }
  }
}
