import React, { useEffect, useState } from 'react';
import UriInput from './components/UriInput';
import VideoMetadata from './components/VideoMetadata';
import LightningInvoiceQR from './components/LightningInvoiceQR';
import { useVideoFlow } from './hooks/useVideoFlow';

const App: React.FC = () => {
  const [initialUri, setInitialUri] = useState('');
  const {
    videoInfo,
    invoice,
    paymentHash,
    videoUrl,
    handleUriSubmit,
    handlePaymentComplete,
  } = useVideoFlow();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uriParam = urlParams.get('uri');
    if (uriParam) {
      setInitialUri(uriParam);
      handleUriSubmit(uriParam);
    }
  }, [handleUriSubmit]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Blockbuster Video Demo</h1>
      <UriInput onUriSubmit={handleUriSubmit} initialUri={initialUri} />
      {videoInfo && (
        <VideoMetadata
          key={videoUrl}
          metadata={videoInfo}
          videoUrl={videoUrl}
        />
      )}
      {invoice && paymentHash && (
        <LightningInvoiceQR
          key={invoice}
          invoice={invoice}
          paymentHash={paymentHash}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default App;