export interface VideoInfo {
  name: string;
  description: string;
  cover_url: string;
  pricing: { amount: number; currency: string }[];
  access: { endpoint: string; method: string };
}

export interface LightningInvoiceQRProps {
  invoice: string;
  paymentHash: string;
  onPaymentComplete: (preimage: string) => void;
}

export interface L402Credentials {
  macaroon: string;
  invoice: string;
}

export interface VideoMetadataProps {
  metadata: {
    name: string;
    description: string;
    cover_url: string;
    pricing: { amount: number; currency: string }[];
  };
}