import { useState, useCallback } from 'react';
import { VideoInfo } from '../types';
import { generateKeysAndSignature } from '../utils/signature';
import { parseL402Header, extractPaymentHash, fetchL402Video } from '../utils/l402';

export function useVideoFlow() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [invoice, setInvoice] = useState<string>("");
  const [macaroon, setMacaroon] = useState<string>("");
  const [paymentHash, setPaymentHash] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleUriSubmit = useCallback(async (uri: string) => {
    try {
      const modifiedUri = uri.replace('l402://', uri.includes('localhost') ? 'http://' : 'https://');
      const response = await fetch(modifiedUri);
      const data = await response.json();
      setVideoInfo(data);

      const { access: { endpoint } } = data;
      if (endpoint) {
        const domain = new URL(endpoint).host;
        const timestamp = Math.floor(Date.now() / 1000);

        const { pubKeyHex, signatureHex } = await generateKeysAndSignature(domain, timestamp);

        const streamVideoRequest = {
          pub_key: pubKeyHex,
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
        if (wwwAuthenticateHeader) {
          const { invoice, macaroon } = parseL402Header(wwwAuthenticateHeader);

          setInvoice(invoice);
          setMacaroon(macaroon);
          console.log('invoice', invoice)
          setPaymentHash(extractPaymentHash(invoice));
        }
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
    }
  }, []);

  const handlePaymentComplete = useCallback(async (preimage: string) => {
    if (videoInfo && paymentHash) {
      const { access: { endpoint } } = videoInfo;
      const response = await fetchL402Video(endpoint, preimage, macaroon);
      const data = await response.json();
      console.log('L402 video response', data);
      setVideoUrl(data.hls_url);
    }
  }, [videoInfo, paymentHash, macaroon]);

  return {
    videoInfo,
    invoice,
    paymentHash,
    videoUrl,
    handleUriSubmit,
    handlePaymentComplete
  };
}