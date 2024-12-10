'use client';
import ApproveConfirmationDialog from '@/components/custom_components/approve_confirmation_dialog';
import React, { useEffect, useState } from 'react';
import useStore from '../../lib/store';
import { useRouter } from 'next/navigation'; // For navigation
import { CircleCheck, Check, Ellipsis } from 'lucide-react';
import { apiUrl } from '@/apiConfig';
import { setAccessToken, getAccessToken, clearAccessToken } from "../../lib/tokenManager";
import { toast } from 'sonner';

const Orders: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);

  const { update_pending_page, increment_for_pending_page } = useStore();

  const accessToken = getAccessToken();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/finance_info/pending');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [update_pending_page]);

  const updatedData = {
    "Seen": "true",
  };

  const updateSeen = async (orderId: any) => {
    try {
      const response = await fetch(`${apiUrl}/finance_info/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      if (response.ok) {
        increment_for_pending_page();
      } else {
        console.error("Failed to update file");
      }
    } catch (error) {
      console.error("Error updating file", error);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return createdAt.toLocaleString();
    } else if (diffHours > 0) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffMinutes} minutes ago`;
    }
  };

  return (
    <div className="p-6 mt-14">
      <h1 className="text-3xl font-bold mb-6">Pending Orders</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Details</th>
            <th className="border border-gray-300 p-2">Table Number</th>
            <th className="border border-gray-300 p-2">Waiter Name</th>
            <th className="border border-gray-300 p-2">Order Details</th>
            <th className="border border-gray-300 p-2">Total Amount</th>
            <th className="border border-gray-300 p-2">Time</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const totalAmount = order.OrderItems.reduce(
              (sum: number, item: any) => sum + item.Item.price * item.quantity,
              0
            );

            // Determine the background color based on the 'Seen' attribute
            const rowClass = order.Seen === 'true' ? 'bg-white' : 'bg-primaryColor bg-opacity-50 ';

            return (
              <tr key={order.id} className={rowClass}>
                <td className="border border-gray-300 p-2 text-center">
                  <button
                    onClick={() => {
                      router.push(`/order_details/${order.id}`);
                      updateSeen(order.id); // Calling the second function
                    }}
                    className="text-primaryColor px-1 py-1 rounded hover:bg-primaryColor hover:text-white transition"
                  >
                    <Ellipsis />
                  </button>
                </td>
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
                <td className="border border-gray-300 p-2 text-center">
                  <ApproveConfirmationDialog
                    apiLink="finance_info"
                    backTo=""
                    buttonTitle="Approve"
                    changeTo="approved"
                    description="Are you sure to approve this order?"
                    field="OrderStatus"
                    id={order?.id}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
