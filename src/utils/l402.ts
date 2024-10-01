import { L402Credentials } from "../types";
import { decode } from 'light-bolt11-decoder';

export function parseL402Header(header: string): L402Credentials {
  if (!header.startsWith('L402 ')) {
    throw new Error("Invalid L402 challenge");
  }

  const parts = header.slice(5).split(',');
  const credentials: Partial<L402Credentials> = {};

  for (const part of parts) {
    const [key, value] = part.trim().split('=');
    const cleanValue = value.trim().replace(/"/g, '');
    if (key === 'macaroon') credentials.macaroon = cleanValue;
    else if (key === 'invoice') credentials.invoice = cleanValue;
  }

  if (!credentials.macaroon || !credentials.invoice) {
    throw new Error("Missing macaroon or invoice in L402 challenge");
  }

  return credentials as L402Credentials;
}

export function decodeInvoice(invoice: string): ReturnType<typeof decode> {
  try {
    console.log('invoice', invoice)
    return decode(invoice);
  } catch (error) {
    console.error('Error decoding invoice:', error);
    throw new Error('Invalid invoice format');
  }
}

export function extractPaymentHash(invoice: string): string | null {
  try {
    const decoded = decodeInvoice(invoice);
    const paymentHashSection = decoded.sections.find(section => section.name === 'payment_hash');
    if (paymentHashSection && 'value' in paymentHashSection) {
      return paymentHashSection.value;
    }
    return null;
  } catch (error) {
    console.error('Error extracting payment hash:', error);
    return null;
  }
}

export async function checkPaymentStatus(paymentHash: string): Promise<{settled: boolean, preimage: string}> {
  try {
    const response = await fetch(`http://localhost:8080/auth/check-invoice/${paymentHash}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const { status } = await response.json();
    console.log('status', status)
    return {settled: status.settled, preimage: status.preimage};
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {settled: false, preimage: ''};
  }
}

export async function fetchL402Video(endpoint: string, preimage: string, macaroon: string) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `L402 ${macaroon}:${preimage}`
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response;
  } catch (error) {
    console.error('Error fetching video with preimage:', error);
    throw error;
  }
}