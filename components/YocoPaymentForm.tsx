"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, Lock } from 'lucide-react';

interface YocoPaymentFormProps {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  isProcessing: boolean;
  onError: (error: string) => void;
  onCheckoutCreated?: (checkoutId: string) => void;
  returnPath?: string;
}

export function YocoPaymentForm({
  amount,
  email,
  firstName,
  lastName,
  isProcessing,
  onError,
  onCheckoutCreated,
  returnPath,
}: YocoPaymentFormProps) {
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [yocoError, setYocoError] = useState<string | null>(null);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setYocoError(null);
    setStartingCheckout(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          email,
          firstName,
          lastName,
          bookingData: {
            bookingReference: `BK-${Date.now()}`,
          },
          returnPath,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to start secure checkout');
      }

      if (!data?.redirectUrl || !data?.checkoutId) {
        throw new Error('Invalid checkout response from payment provider');
      }

      if (onCheckoutCreated) {
        onCheckoutCreated(data.checkoutId);
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start payment checkout';
      setYocoError(errorMsg);
      onError(errorMsg);
      setStartingCheckout(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-4">
      <div className="space-y-4">
      </div>

      {yocoError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Payment Error</p>
            <p className="text-sm text-red-800">{yocoError}</p>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span className="text-amber-900 font-medium">Total Amount to Pay</span>
          </div>
          <span className="text-2xl font-bold text-amber-600">R{amount.toFixed(2)}</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isProcessing || startingCheckout}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {startingCheckout || isProcessing ? 'Redirecting to secure checkout...' : 'Complete Payment'}
      </Button>

      <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Your payment is secured by Yoco. We accept all major cards.
      </p>
    </form>
  );
}
