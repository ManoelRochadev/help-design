export class PaymentIntent {
  id: number | string;
  order_id: number | string;
  tracking_number: number;
  payment_gateway: string;
  payment_intent_info: PaymentIntentInfo;
}

export class PaymentIntentInfo {
  txid?: string;
  loc?: {
    id: number,
    location: string,
    tipoCob: string,
    criacao: string
  };
  client_secret?: string | null;
  redirect_url?: string | null;
  payment_id: string;
  is_redirect: boolean;
}
