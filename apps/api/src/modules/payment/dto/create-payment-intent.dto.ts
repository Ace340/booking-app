/**
 * Create Payment Intent DTO
 *
 * Validates the incoming request for creating a payment intent.
 * Amount is determined server-side from the service price — never trusted from the client.
 */

import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentIntentDto {
  /** ID of the appointment to link this payment to */
  @IsString()
  @IsNotEmpty()
  appointmentId: string;
}
