import React, { useState } from 'react';
import { generateKeysAndSignature } from './utils/signature';
import { parseL402Header } from './utils/l402';
import UriInput from './components/UriInput';
import VideoMetadata from './components/VideoMetadata';
import LightningInvoiceQR from './components/LightningInvoiceQR';
import { VideoInfo } from './types';

const App: React.FC = () => {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [invoice, setInvoice] = useState<string | null>(null);

  const handleUriSubmit = async (uri: string) => {
    try {
      const modifiedUri = uri.replace('l402://', uri.includes('localhost') ? 'http://' : 'https://');
      const response = await fetch(modifiedUri);
      const data = await response.json();
      setVideoInfo(data);

      // Log headers from the first response
      const headers = Object.fromEntries(response.headers.entries());
      console.log('L402 URI info response headers:', headers);

      const { access: { endpoint } } = data;
      // New API call to the endpoint
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

        const endpointData = await endpointResponse.json();
        console.log('Endpoint response data:', endpointData);

        // Log headers from the endpoint response
        const endpointHeaders = Object.fromEntries(endpointResponse.headers.entries());
        console.log('Endpoint response headers:', endpointHeaders);

        // Parse the Www-Authenticate header
        const wwwAuthenticateHeader = endpointResponse.headers.get('Www-Authenticate');
        if (wwwAuthenticateHeader) {
          try {
            const { invoice } = parseL402Header(wwwAuthenticateHeader);
            console.log('Lightning Invoice:', invoice);
            setInvoice(invoice);
          } catch (error: any) {
            console.error('Error parsing L402 header:', error);
          }
        } else {
          console.log('No Www-Authenticate header found');
        }
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Blockbuster Video Demo</h1>
      <UriInput onUriSubmit={handleUriSubmit} />
      {videoInfo && <VideoMetadata metadata={videoInfo} />}
      {invoice && <LightningInvoiceQR key={invoice} invoice={invoice} />}
    </div>
  );
};

export default App;