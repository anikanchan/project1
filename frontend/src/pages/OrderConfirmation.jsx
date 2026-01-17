import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import logger from '../services/logger';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getById(orderId);
        setOrder(response.data);
      } catch (error) {
        logger.error('Failed to fetch order: ' + error.message, { source: 'OrderConfirmation' });
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-gray-600">Order not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">
          Thank you for your purchase. Your order #{order.id} has been placed.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Order ID</p>
            <p className="font-medium">#{order.id}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium">
              <span className={`px-2 py-1 rounded-full text-xs ${
                order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{order.customerEmail}</p>
          </div>
          <div>
            <p className="text-gray-600">Date</p>
            <p className="font-medium">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        <p className="text-gray-700">
          {order.shippingAddress}<br />
          {order.shippingCity}, {order.shippingZipCode}<br />
          {order.shippingCountry}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">${item.subtotal.toFixed(2)}</p>
            </div>
          ))}
          <div className="pt-4 border-t">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-indigo-600">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to="/products"
          className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
