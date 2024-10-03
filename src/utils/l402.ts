import { L402Credentials } from "../types";
import { decode } from 'light-bolt11-decoder';
import { VideoInfo } from '../types';
import { generateKeys, signMessage } from "./signature";

export async function handleL402URIScheme(uri: string): Promise<VideoInfo> {
    // replace l402:// with http:// or https://
    const modifiedUri = uri.replace('l402://', uri.includes('localhost') ? 'http://' : 'https://');
    const response = await fetch(modifiedUri);
    const data = await response.json();
    return data;
}


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
        const response = await fetch(`https://blockbuster.fewsats.com/auth/check-invoice/${paymentHash}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const { status } = await response.json();
        return {settled: status.settled, preimage: status.preimage};
    } catch (error) {
        console.error('Error checking payment status:', error);
        return {settled: false, preimage: ''};
    }
}

export async function makeStreamVideoRequest(endpoint: string): Promise<L402Credentials> {
    // The user has not bought the video yet, so we need to make a signed L402 purchase
    // with our pubkey

    const { pubKey, secretKey } = generateKeys()

    // We sign a message of the domain & timestamp prevent attackers from using either
    // old signatures, or the wrong domainz
    const domain = new URL(endpoint).host;
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${domain}:${timestamp}`
    const signatureHex  = await signMessage(secretKey, message);
    
    const streamVideoRequest = {
        pub_key: pubKey,
        domain: domain,
        timestamp: timestamp,
        signature: signatureHex
    };
    
    const endpointResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(streamVideoRequest),
    });

    const wwwAuthenticateHeader = endpointResponse.headers.get('Www-Authenticate');
    if (!wwwAuthenticateHeader) {
        throw new Error('Missing www authenticate header');
    }

    const { invoice, macaroon } = parseL402Header(wwwAuthenticateHeader);
    if (!invoice || !macaroon) {
        throw new Error('Missing macaroon or invoice in L402 challenge');
    }

    return { invoice, macaroon };
}


export async function fetchL402Video(endpoint: string, authHeader: string): Promise<string> {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const { hls_url } = await response.json();
        return hls_url;
    } catch (error) {
        console.error('Error fetching video with preimage:', error);
        throw error;
    }
}
