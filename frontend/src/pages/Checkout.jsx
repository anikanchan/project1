import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { useCart } from '../context/CartContext';
import { orderAPI, paymentAPI, configAPI } from '../services/api';
import logger from '../services/logger';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotal, clearCart } = useCart();
  const [step, setStep] = useState('shipping');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  const [shippingInfo, setShippingInfo] = useState({
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingZipCode: '',
    shippingCountry: '',
  });

  useEffect(() => {
    const initStripe = async () => {
      try {
        const response = await configAPI.getStripeKey();
        const stripe = loadStripe(response.data.publishableKey);
        setStripePromise(stripe);
      } catch (err) {
        logger.error('Failed to load Stripe: ' + err.message, { source: 'Checkout' });
      }
    };
    initStripe();
  }, []);

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderData = {
        ...shippingInfo,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const orderResponse = await orderAPI.create(orderData);
      setOrderId(orderResponse.data.id);

      const paymentResponse = await paymentAPI.createIntent(orderResponse.data.id);
      setClientSecret(paymentResponse.data.clientSecret);

      setStep('payment');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  if (cartItems.length === 0 && !orderId) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center ${step === 'shipping' ? 'text-indigo-600' : 'text-green-600'}`}>
          <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
            {step === 'payment' ? '✓' : '1'}
          </span>
          <span className="font-medium">Shipping</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
        <div className={`flex items-center ${step === 'payment' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
            2
          </span>
          <span className="font-medium">Payment</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {step === 'shipping' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={shippingInfo.customerEmail}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, customerEmail: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={shippingInfo.customerPhone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, customerPhone: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                required
                value={shippingInfo.shippingAddress}
                onChange={(e) => setShippingInfo({ ...shippingInfo, shippingAddress: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.shippingCity}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, shippingCity: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.shippingZipCode}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, shippingZipCode: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.shippingCountry}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, shippingCountry: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-indigo-600">${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </form>
        </div>
      )}

      {step === 'payment' && clientSecret && stripePromise && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Payment</h2>
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total to Pay</span>
              <span className="text-indigo-600">${getTotal().toFixed(2)}</span>
            </div>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe' },
            }}
          >
            <CheckoutForm orderId={orderId} onSuccess={handlePaymentSuccess} />
          </Elements>
        </div>
      )}
    </div>
  );
}
