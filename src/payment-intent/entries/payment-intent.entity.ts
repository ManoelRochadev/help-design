export class PaymentIntent {
  id: number | string;
  order_id: number | string;
  tracking_number: string;
  payment_gateway: string;
  payment_intent_info: PaymentIntentInfo;
}

export class PaymentIntentInfo {
  client_secret?: string | null;
  redirect_url?: string | null;
  payment_id: string;
  is_redirect: boolean;
}
