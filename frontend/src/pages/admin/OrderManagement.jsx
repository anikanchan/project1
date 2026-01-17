import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import logger from '../../services/logger';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      logger.error('Failed to fetch orders: ' + error.message, { source: 'OrderManagement' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      logger.error('Failed to update order status: ' + error.message, { source: 'OrderManagement' });
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Order ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Items</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">#{order.id}</td>
                  <td className="py-3 px-4">
                    <p>{order.customerEmail}</p>
                    {order.customerPhone && (
                      <p className="text-sm text-gray-500">{order.customerPhone}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm">
                        {item.productName} x {item.quantity}
                      </p>
                    ))}
                  </td>
                  <td className="py-3 px-4 font-medium">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {order.payment ? (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.payment.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' :
                        order.payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.payment.status}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Update Order #{selectedOrder.id}
            </h2>
            <p className="text-gray-600 mb-4">
              Current Status: <span className="font-medium">{selectedOrder.status}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                className="w-full border rounded-md px-3 py-2"
                defaultValue={selectedOrder.status}
                onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                disabled={updating}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h3>
              <p className="text-sm text-gray-600">
                {selectedOrder.shippingAddress}<br />
                {selectedOrder.shippingCity}, {selectedOrder.shippingZipCode}<br />
                {selectedOrder.shippingCountry}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                disabled={updating}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
