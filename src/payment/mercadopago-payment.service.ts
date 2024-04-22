import { Injectable } from "@nestjs/common";
import { MercadoPagoConfig, Payment } from 'mercadopago';

@Injectable()
export class MercadoPagoPaymentService {
  // Step 2: Initialize the client object
  constructor(
    private readonly mercadoPagoConfig: MercadoPagoConfig,
    private readonly payment: Payment,
  ) {
   

  }


  async createCustomer() {
    return 'createCustomer';
  }

  async retrieveCustomer() {
    return 'retrieveCustomer';
  }
};