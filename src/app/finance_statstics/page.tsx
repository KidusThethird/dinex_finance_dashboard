'use client';
import React, { useEffect, useState } from 'react';

// Types for the fetched data
interface Item {
  id: number;
  name: string;
  description: string;
  type: string;
  itemType: string;
  price: number;
  duration: number;
  status: string;
  deleted: boolean;
  createdAt: string;
}

interface OrderItem {
  id: number;
  OrderId: string;
  ItemId: number;
  quantity: number;
  createdAt: string;
  Item: Item;
}

interface Waiter {
  id: number;
  firstName: string;
  lastName: string;
  type: string;
  status: string;
  email: string;
  password: string;
  phoneNumber: string;
  deleted: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  WaiterId: number;
  SpecialDescription: string | null;
  OrderStatus: string;
  TableNumber: string;
  Seen: string;
  createdAt: string;
  Waiter: Waiter;
  OrderItems: OrderItem[];
}

// Type for statistics
interface Statistics {
  totalOrders: number;
  ordersByStatus: { [status: string]: number };
  totalAmount: number;
  ordersByTable: { [table: string]: number };
  ordersByWaiter: { [waiter: string]: number };
  mostOrderedItem: { name: string; count: number };
}

type TimePeriod = 'last24' | 'thisWeek' | 'thisMonth' | 'last3Months' | 'last6Months' | 'lastYear' | 'allTime';

export default function Statstics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('last24');

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/finance_info/');
      const data: Order[] = await response.json();
      setOrders(data);
      setFilteredOrders(filterOrdersByTime(data, timePeriod)); // Filter orders when fetched
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Filter orders based on the selected time range
  const filterOrdersByTime = (orders: Order[], timePeriod: TimePeriod): Order[] => {
    const now = new Date();
    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      switch (timePeriod) {
        case 'last24':
          return now.getTime() - orderDate.getTime() <= 24 * 60 * 60 * 1000; // 24 hours
        case 'thisWeek':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Set to the start of the current week
          return orderDate >= startOfWeek;
        case 'thisMonth':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
          return orderDate >= startOfMonth;
        case 'last3Months':
          const startOf3MonthsAgo = new Date(now);
          startOf3MonthsAgo.setMonth(now.getMonth() - 3); // 3 months ago
          return orderDate >= startOf3MonthsAgo;
          case 'last6Months':
            const startOf6MonthsAgo = new Date(now);
            startOf6MonthsAgo.setMonth(now.getMonth() - 6); // 6 months ago
            return orderDate >= startOf6MonthsAgo;
          case 'lastYear':
            const startOfYearAgo = new Date(now);
            startOfYearAgo.setFullYear(now.getFullYear() - 1); // 1 year ago
            return orderDate >= startOfYearAgo;
          case 'allTime':
            return true;
        default:
          return true;
      }
    });

    return filtered;
  };

  // Calculate statistics based on the filtered orders
  const calculateStatistics = (orders: Order[]): Statistics => {
    const totalOrders = orders.length;

    const ordersByStatus = orders.reduce(
      (acc: { [status: string]: number }, order) => {
        acc[order.OrderStatus] = (acc[order.OrderStatus] || 0) + 1;
        return acc;
      },
      {}
    );

    const totalAmount = orders.reduce((sum: number, order) => {
      return sum + order.OrderItems.reduce(
        (itemSum: number, item: OrderItem) => itemSum + item.Item.price * item.quantity,
        0
      );
    }, 0);

    const ordersByTable = orders.reduce((acc: { [table: string]: number }, order) => {
      acc[order.TableNumber] = (acc[order.TableNumber] || 0) + 1;
      return acc;
    }, {});

    const ordersByWaiter = orders.reduce((acc: { [waiter: string]: number }, order) => {
      const waiterName = `${order.Waiter.firstName} ${order.Waiter.lastName}`;
      acc[waiterName] = (acc[waiterName] || 0) + 1;
      return acc;
    }, {});

    // Find the most ordered item
    const itemFrequency: { [itemName: string]: number } = {};
    orders.forEach((order) => {
      order.OrderItems.forEach((item) => {
        itemFrequency[item.Item.name] = (itemFrequency[item.Item.name] || 0) + 1;
      });
    });

    const mostOrderedItem = Object.entries(itemFrequency).reduce(
      (maxItem: { name: string; count: number }, [itemName, count]) =>
        count > maxItem.count ? { name: itemName, count } : maxItem,
      { name: '', count: 0 }
    );

    return {
      totalOrders,
      ordersByStatus,
      totalAmount,
      ordersByTable,
      ordersByWaiter,
      mostOrderedItem,
    };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle time period change
  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    setFilteredOrders(filterOrdersByTime(orders, period)); // Re-filter orders
  };

  const {
    totalOrders,
    ordersByStatus,
    totalAmount,
    ordersByTable,
    ordersByWaiter,
    mostOrderedItem,
  } = calculateStatistics(filteredOrders);

  return (
    <div className="p-6 mt-14">
      <h1 className="text-3xl font-bold mb-6">Statistics</h1>

      <div className="mb-6">
        <button
          onClick={() => handleTimePeriodChange('last24')}
          className={`mr-4 p-2 ${timePeriod === 'last24' ? 'bg-primaryColor text-white' : 'bg-gray-200'}`}
        >
          Last 24 hours
        </button>
        <button
          onClick={() => handleTimePeriodChange('thisWeek')}
          className={`mr-4 p-2 ${timePeriod === 'thisWeek' ? 'bg-primaryColor text-white' : 'bg-gray-200'}`}
        >
          This Week
        </button>
        <button
          onClick={() => handleTimePeriodChange('thisMonth')}
          className={`mr-4 p-2 ${timePeriod === 'thisMonth' ? 'bg-primaryColor text-white' : 'bg-gray-200'}`}
        >
          This Month
        </button>
        <button
          onClick={() => handleTimePeriodChange('last3Months')}
          className={`mr-4 p-2 ${timePeriod === 'last3Months' ? 'bg-primaryColor text-white' : 'bg-gray-200'}`}
        >
          Last 3 Months
        </button>
        <button
          onClick={() => handleTimePeriodChange('last6Months')}
          className={`mr-4 p-2 ${timePeriod === 'last6Months' ? 'bg-primaryColor text-white' : 'bg-gray-200'}`}
        >
          Last 6 Months
        </button>
        <button
          onClick={() => handleTimePeriodChange('lastYear')}
          className={`mr-4 p-2 ${timePeriod === 'lastYear' ? 'bg-primaryColor text-white' : 'bg-gray-200'}`}
        >
          Last Year
        </button>
        <button
          onClick={() => handleTimePeriodChange('allTime')}
          className={`mr-4 p-2 ${timePeriod === 'allTime' ? 'bg-primaryColor text-white' : 'bg-gray-200'}`}
        >
          All Time
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="border p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg">Total Orders</h2>
          <p className="text-xl">{totalOrders}</p>
        </div>

        <div className="border p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg">Total Amount</h2>
          <p className="text-xl">${totalAmount.toFixed(2)}</p>
        </div>

        <div className="border p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg">Orders by Status</h2>
          <ul>
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <li key={status} className="text-lg">
                {status}: {count}
              </li>
            ))}
          </ul>
        </div>

        <div className="border p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg">Most Ordered Item</h2>
          <p className="text-lg">
            {mostOrderedItem.name} ({mostOrderedItem.count} times)
          </p>
        </div>

        <div className="border p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg">Orders by Table</h2>
          <ul>
            {Object.entries(ordersByTable).map(([table, count]) => (
              <li key={table} className="text-lg">
                Table {table}: {count} orders
              </li>
            ))}
          </ul>
        </div>

        <div className="border p-4 rounded-lg shadow-md">
          <h2 className="font-semibold text-lg">Orders by Waiter</h2>
          <ul>
            {Object.entries(ordersByWaiter).map(([waiter, count]) => (
              <li key={waiter} className="text-lg">
                {waiter}: {count} orders
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
