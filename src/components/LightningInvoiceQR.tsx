import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { checkPaymentStatus } from '../utils/l402';
import { LightningInvoiceQRProps } from '../types';

const LightningInvoiceQR: React.FC<LightningInvoiceQRProps> = ({ invoice, paymentHash, onPaymentComplete }) => {
  const [isPaid, setIsPaid] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!paymentHash) return;

    const pollPaymentStatus = async () => {
      const { settled, preimage } = await checkPaymentStatus(paymentHash);
      if (settled) {
        setIsPaid(true);
        onPaymentComplete(preimage);
        return true;
      }
      return false;
    };

    const pollInterval = setInterval(async () => {
      const shouldStop = await pollPaymentStatus();
      if (shouldStop) {
        clearInterval(pollInterval);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [paymentHash, onPaymentComplete]);

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(invoice).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <div className="mt-6 bg-white shadow-md rounded-lg">
    {isPaid ? (
        <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded" role="alert">
          <p className="font-bold">Payment received!</p>
          <p>Your video will start playing shortly.</p>
        </div>
      ) : (
        <>
        <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
          <p className="font-bold">Waiting for payment...</p>
          <p>Please scan the QR code or copy the invoice to your Lightning wallet.</p>
        </div>
      <div className="flex flex-col items-center">
        <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
          <QRCode value={invoice} size={256} />
        </div>
        <div className="w-full max-w-md mb-4">
          <div className="relative">
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10"
              value={invoice}
              readOnly
            />
            <button
              onClick={handleCopyInvoice}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-500 hover:bg-gray-100 rounded-lg p-2 inline-flex items-center justify-center"
            >
              {copySuccess ? (
                <svg className="w-5 h-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      </>
    )}
    </div>
  );
};

export default LightningInvoiceQR;