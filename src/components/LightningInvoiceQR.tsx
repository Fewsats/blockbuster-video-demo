import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { extractPaymentHash, checkPaymentStatus } from '../utils/l402';
import { LightningInvoiceQRProps } from '../types';

const LightningInvoiceQR: React.FC<LightningInvoiceQRProps> = ({ invoice }) => {
  const [isPaid, setIsPaid] = useState(false);
  const [paymentHash, setPaymentHash] = useState<string | null>(null);

  useEffect(() => {
    const hash = extractPaymentHash(invoice);
    setPaymentHash(hash);
  }, [invoice]);

  useEffect(() => {
    if (!paymentHash) return;

    const pollPaymentStatus = async () => {
      const paid = await checkPaymentStatus(paymentHash);
      if (paid) {
        setIsPaid(true);
        return true; // Stop polling if paid
      }
      return false;
    };

    const pollInterval = setInterval(async () => {
      const shouldStop = await pollPaymentStatus();
      if (shouldStop) {
        clearInterval(pollInterval);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [paymentHash]);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Lightning Invoice</h2>
      <div className="flex justify-center">
        <QRCode value={invoice} size={256} />
      </div>
      <p className="mt-2 break-all text-sm">{invoice}</p>
      {isPaid ? (
        <p className="mt-2 text-green-600 font-bold">Payment received!</p>
      ) : (
        <p className="mt-2 text-yellow-600">Waiting for payment...</p>
      )}
    </div>
  );
};

export default LightningInvoiceQR;