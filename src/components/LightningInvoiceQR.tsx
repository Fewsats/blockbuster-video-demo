import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { checkPaymentStatus } from '../utils/l402';
import { LightningInvoiceQRProps } from '../types';

const LightningInvoiceQR: React.FC<LightningInvoiceQRProps> = ({ invoice, paymentHash, onPaymentComplete }) => {
  const [isPaid, setIsPaid] = useState(false);

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
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [paymentHash, onPaymentComplete]);

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