'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomerLayout from '@/components/CustomerLayout';
import { CreditCardIcon } from '@heroicons/react/24/outline';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      if (parsedCart.length > 0) {
        setCart(parsedCart);
      } else {
        router.push('/customer');
      }
    } else {
      router.push('/customer');
    }
  }, [router]);

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deliveryAddress.trim()) {
      setStep(2);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryAddress,
          totalAmount: getTotal(),
          paymentStatus: 'paid',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      localStorage.removeItem('cart');
      router.push(`/customer/orders/${data.orderId}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts:string[] = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  if (cart.length === 0) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-0">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify border-2 ${
                step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Delivery</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify border-2 ${
                step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {step === 1 ? (
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Delivery Address</h2>
              
              <form onSubmit={handleAddressSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your complete delivery address"
                  />
                </div>

                <div className="border-t pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Payment Details</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Order Summary</h3>
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm py-1">
                    <span>{item.name} x {item.quantity}</span>
                    <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>Rs. {getTotal().toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({
                          ...cardDetails,
                          cardNumber: formatCardNumber(e.target.value)
                        })}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 pl-10 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1234 5678 9012 3456"
                      />
                      <CreditCardIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cardDetails.cardName}
                      onChange={(e) => setCardDetails({...cardDetails, cardName: e.target.value})}
                      className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardDetails.expiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0,2) + '/' + value.slice(2,4);
                          }
                          setCardDetails({...cardDetails, expiry: value});
                        }}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={3}
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({
                          ...cardDetails,
                          cvv: e.target.value.replace(/\D/g, '')
                        })}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 text-red-500 p-3 rounded text-sm">
                    {error}
                  </div>
                )}

                <div className="border-t mt-6 pt-4 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Processing Payment...' : `Pay Rs. ${getTotal().toLocaleString()}`}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-gray-600 py-2 px-4 rounded-md hover:text-gray-800 transition-colors"
                  >
                    Back to Delivery
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}