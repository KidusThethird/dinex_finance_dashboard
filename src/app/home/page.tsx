'use client';
import { apiUrl } from '@/apiConfig';
import React, { useEffect, useState } from 'react';

const Home = () => {
  const [orders, setOrders] = useState<any[]>([]);

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${apiUrl}/finance_info/new`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    // Fetch the orders immediately when the component mounts
    fetchOrders();

    // Set up an interval to fetch orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000); // 10000 milliseconds = 10 seconds

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return createdAt.toLocaleString(); // More than 1 day, show date and time
    } else if (diffHours > 0) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffMinutes} minutes ago`;
    }
  };

  return (
    <div className="p-6 mt-14">
      <h1 className="text-3xl font-bold mb-6">New Orders</h1>

      {/* Show message if there are no orders */}
      {orders.length === 0 ? (
        <p className="text-xl text-center text-gray-500 mt-6">No New Orders to show</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 mt-6">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Table Number</th>
              <th className="border border-gray-300 p-2">Waiter Name</th>
              <th className="border border-gray-300 p-2">Items and Prices</th>
              <th className="border border-gray-300 p-2">Total Price</th>
              <th className="border border-gray-300 p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const totalAmount = order.OrderItems.reduce(
                (sum: number, item: any) => sum + item.Item.price * item.quantity,
                0
              );

              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center">
                    {order.TableNumber}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {order.Waiter.firstName} {order.Waiter.lastName}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <ul>
                      {order.OrderItems.map((item: any) => (
                        <li key={item.id}>
                          {item.quantity} x {item.Item.name} (${item.Item.price})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    ${totalAmount}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {formatTime(order.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home;
