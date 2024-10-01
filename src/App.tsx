import React from 'react';
import UriInput from './components/UriInput';
import VideoMetadata from './components/VideoMetadata';
import LightningInvoiceQR from './components/LightningInvoiceQR';
import VideoPlayer from './components/VideoPlayer';
import { useVideoFlow } from './hooks/useVideoFlow';

const App: React.FC = () => {
  const {
    videoInfo,
    invoice,
    paymentHash,
    videoUrl,
    handleUriSubmit,
    handlePaymentComplete
  } = useVideoFlow();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Blockbuster Video Demo</h1>
      <UriInput onUriSubmit={handleUriSubmit} />
      {videoInfo && !videoUrl && <VideoMetadata metadata={videoInfo} />}
      {invoice && paymentHash && (
        <LightningInvoiceQR
          key={invoice}
          invoice={invoice}
          paymentHash={paymentHash}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      {videoUrl && <VideoPlayer url={videoUrl} />}
    </div>
  );
};

export default App;