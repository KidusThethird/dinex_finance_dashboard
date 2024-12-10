'use client'

import React, { useEffect, useState } from 'react';

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

type TimeFilter =
  | '24hrs'
  | '3days'
  | 'week'
  | 'month'
  | '3months'
  | '6months'
  | 'year'
  | 'allTime';

const timeFilters = [
  { label: 'Last 24 Hours', value: '24hrs' },
  { label: 'Last 3 Days', value: '3days' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'Last Year', value: 'year' },
  { label: 'All Time', value: 'allTime' }
];

// Define a primary color
const primaryColor = '#3498db'; // Blue, adjust as needed

const FinanceTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('allTime');
  const [totalIncome, setTotalIncome] = useState<number>(0);

  // Fetching data
  useEffect(() => {
    const fetchOrders = async () => {
      const response = await fetch('http://localhost:5000/finance_info/');
      const data: Order[] = await response.json();
      setOrders(data);
      setFilteredOrders(data);
      calculateTotalIncome(data);
    };
    fetchOrders();
  }, []);

  // Filter orders based on time range
  const filterOrdersByTime = (orders: Order[], filter: TimeFilter): Order[] => {
    const now = new Date();
    let filteredData: Order[] = [];

    switch (filter) {
      case '24hrs':
        filteredData = orders.filter(order => {
          const orderTime = new Date(order.createdAt);
          return (now.getTime() - orderTime.getTime()) <= 24 * 60 * 60 * 1000;
        });
        break;
      case '3days':
        filteredData = orders.filter(order => {
          const orderTime = new Date(order.createdAt);
          return (now.getTime() - orderTime.getTime()) <= 3 * 24 * 60 * 60 * 1000;
        });
        break;
      case 'week':
        filteredData = orders.filter(order => {
          const orderTime = new Date(order.createdAt);
          return (now.getTime() - orderTime.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        });
        break;
      case 'month':
        filteredData = orders.filter(order => {
          const orderTime = new Date(order.createdAt);
          return (now.getTime() - orderTime.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        });
        break;
      case '3months':
        filteredData = orders.filter(order => {
          const orderTime = new Date(order.createdAt);
          return (now.getTime() - orderTime.getTime()) <= 90 * 24 * 60 * 60 * 1000;
        });
        break;
      case '6months':
        filteredData = orders.filter(order => {
          const orderTime = new Date(order.createdAt);
          return (now.getTime() - orderTime.getTime()) <= 180 * 24 * 60 * 60 * 1000;
        });
        break;
      case 'year':
        filteredData = orders.filter(order => {
          const orderTime = new Date(order.createdAt);
          return (now.getTime() - orderTime.getTime()) <= 365 * 24 * 60 * 60 * 1000;
        });
        break;
      case 'allTime':
      default:
        filteredData = orders;
        break;
    }

    return filteredData;
  };

  // Calculate total income for the filtered orders
  const calculateTotalIncome = (orders: Order[]) => {
    const income = orders.reduce((acc, order) => {
      const totalOrderAmount = order.OrderItems.reduce((sum, item) => {
        const price = item.Item.price ?? 0;
        const quantity = item.quantity ?? 0;
        return sum + price * quantity;
      }, 0);
      return acc + totalOrderAmount;
    }, 0);
    setTotalIncome(income);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle items per page change
  const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(event.target.value));
    setPage(1); // Reset to page 1 when perPage changes
  };

  // Filtered data based on selected time and pagination
  useEffect(() => {
    const filtered = filterOrdersByTime(orders, timeFilter);
    setFilteredOrders(filtered);
    calculateTotalIncome(filtered);
  }, [timeFilter, orders]);

  // Paginated data
  const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6">Finance Table</h2>

      {/* Time Filter */}
      <div className="mb-4 flex justify-center">
        <select
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          value={timeFilter}
          className="px-4 py-2 border rounded-lg shadow-md"
        >
          {timeFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className="min-w-full border-collapse mt-6 bg-white shadow-md rounded-lg">
        <thead className="bg-primaryColor text-white">
          <tr>
            <th className="py-3 px-6 text-left">Number of Items Ordered</th>
            <th className="py-3 px-6 text-left">Waiter</th>
            <th className="py-3 px-6 text-left">Table Number</th>
            <th className="py-3 px-6 text-left">Status</th>
            <th className="py-3 px-6 text-left">Total Income</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order) => {
            // Calculate number of items ordered
            const totalItems = order.OrderItems.reduce((sum, item) => sum + item.quantity, 0);

            const totalOrderAmount = order.OrderItems.reduce((sum, item) => {
              const price = item.Item.price ?? 0;
              const quantity = item.quantity ?? 0;
              return sum + price * quantity;
            }, 0);

            return (
              <tr key={order.id} className="border-b hover:bg-gray-100">
                <td className="py-3 px-6">{totalItems}</td>
                <td className="py-3 px-6">
                  {order.Waiter.firstName} {order.Waiter.lastName}
                </td>
                <td className="py-3 px-6">{order.TableNumber}</td>
                <td className="py-3 px-6">{order.OrderStatus}</td>
                <td className="py-3 px-6">${totalOrderAmount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Total Income */}
      <div className="mt-4 text-center">
        <p className="text-xl font-semibold">Total Income: ${totalIncome.toFixed(2)}</p>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div>
          <label htmlFor="perPage" className="mr-2">Items per page:</label>
          <select
            id="perPage"
            onChange={handlePerPageChange}
            value={perPage}
            className="px-4 py-2 border rounded-lg"
          >
            {[5, 10, 15, 20].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4">{page}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page * perPage >= filteredOrders.length}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceTable;
