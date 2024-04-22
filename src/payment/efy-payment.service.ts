require('dotenv').config();
import { HttpStatus, Injectable } from "@nestjs/common";
import EfiPay from 'sdk-typescript-apis-efi';
import options from '../../credentials'
import { Request } from "express";

export interface CustomerPix {
  devedor?: {
    cpf: string;
    nome: string;
  },
  valor: {
    original: string;
  },
  infoAdicionais: {
    nome: string;
    valor: string;
  }[];

}

@Injectable()
export class EfyPaymentService {

  // private readonly ;
  constructor() {
  }

  generateTxid(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 10) + 26; // entre 26 e 35 caracteres
    let txid = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      txid += characters[randomIndex];
    }
    return txid;
  }

  async createCustomer({  valor, infoAdicionais }: CustomerPix): Promise<any> {
    const efiPay = new EfiPay(options);

    const body = {
      calendario: {
        expiracao: 3600,
      },
      valor,
      chave: process.env.EFI_PIX_KEY,
      infoAdicionais: infoAdicionais,
    };

    const params = {
      txid: this.generateTxid(),
    };

    try {
      const response = await efiPay.pixCreateCharge(params, body);
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async pixGenerateQrCode(id: string) {
    const efiPay = new EfiPay(options);
    const params = {
      id,
    };

    try {
      const response = await efiPay.pixGenerateQRCode(params);
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async configWebhook(url: string) {
    const efiPay = new EfiPay(options);
    const body = {
      webhookUrl: url,
    };

    const params = {
      chave: process.env.EFI_PIX_KEY,
    };

    try {
      const response = await efiPay.pixConfigWebhook(params,body);
      console.log(response)
      return response;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async webhookAuthorization(req: Request) {
    // verificar se a requisição vem do ip da efi 34.193.116.226
    if (req.ip !== "34.193.116.226") {
      return HttpStatus.FORBIDDEN;
    } else {
      return HttpStatus.OK;
    }
  }

  async webhookPix(req: Request) {
    console.log("webhook pix")
    console.log(req.body)
    return HttpStatus.OK;
  }
}