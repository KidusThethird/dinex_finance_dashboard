'use client';

import React, { useEffect, useState, useRef } from 'react';
import { setAccessToken, getAccessToken, clearAccessToken } from '../../../lib/tokenManager';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ApproveConfirmationDialog from '@/components/custom_components/approve_confirmation_dialog';
import useStore from '../../../lib/store';
import { apiUrl } from '@/apiConfig';

export default function OrderDetails({ params: rawParams }: any) {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [params, setParams] = useState<any>(null); // To unwrap `params` promise
  const accessToken = getAccessToken();
  const { update_pending_page, increment_for_pending_page } = useStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false); // Track printing state

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await rawParams;
      setParams(resolvedParams);
    };

    unwrapParams();
  }, [rawParams]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!params) return; // Wait until params are resolved

      try {
        const response = await fetch(`${apiUrl}/orderitem/${params.order_id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch order details');
        const data = await response.json();
        setOrderDetails(data);
      } catch (err) {
        setError(true);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [params, accessToken, update_pending_page]);

  const handlePrint = () => {
    const printableContent = printRef.current;
    if (printableContent) {
      setIsPrinting(true); // Set printing state to true
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
          <head>
            <title>Receipt</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .receipt-header {
                text-align: center;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              table th, table td {
                border: 1px solid #ddd;
                padding: 8px;
              }
              table th {
                background-color: #f4f4f4;
                text-align: left;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .total {
                font-weight: bold;
                font-size: 18px;
              }

              /* Hide buttons during printing */
              @media print {
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            ${printableContent.innerHTML}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        setIsPrinting(false); // Reset printing state after printing
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading order details...</div>;
  }

  if (error || !orderDetails) {
    return <div className="p-6 text-center text-red-600">Failed to load order details. Please try again later.</div>;
  }

  const totalAmount = orderDetails.OrderItems.reduce(
    (sum: number, item: any) => sum + item.Item.price * item.quantity,
    0
  );

  return (
    <div className="p-6">
      <Breadcrumb className="my-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/history">History</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Order Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold text-primaryColor mb-6">Order Details</h1>
      <div className="bg-white shadow rounded-lg p-6" ref={printRef}>
        <h2 className="receipt-header">Order Receipt</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="font-semibold">Order ID:</div>
          <div>{orderDetails.id}</div>

          <div className="font-semibold">Waiter Name:</div>
          <div>
            {orderDetails.Waiter.firstName} {orderDetails.Waiter.lastName}
          </div>

          <div className="font-semibold">Order Status:</div>
          <div className="capitalize">{orderDetails.OrderStatus}</div>

          <div className="font-semibold">Table Number:</div>
          <div>{orderDetails.TableNumber || 'Not assigned'}</div>

          <div className="font-semibold">Created At:</div>
          <div>{new Date(orderDetails.createdAt).toLocaleString()}</div>

          <div className="font-semibold text-primaryColor">Total Amount:</div>
          <div className="text-primaryColor font-bold">${totalAmount.toFixed(2)}</div>
        </div>

        <div className="my-4">
          {orderDetails.OrderStatus == "pending" ? (
            <div className="bg-green-600 rounded w-fit p-1 text-white">
              <ApproveConfirmationDialog
                apiLink="finance_info"
                backTo=""
                buttonTitle="Approve"
                changeTo="approved"
                description="Are you sure to approve this order?"
                field="OrderStatus"
                id={orderDetails?.id}
              />
            </div>
          ) : (
            <button
              onClick={handlePrint}
              className="no-print mt-4 bg-primaryColor text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Print Receipt
            </button>
          )}
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Order Items</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-primaryColor text-white">
              <th className="border border-gray-300 p-2 text-left">Item</th>
              <th className="border border-gray-300 p-2 text-left">Description</th>
              <th className="border border-gray-300 p-2 text-right">Price</th>
              <th className="border border-gray-300 p-2 text-center">Quantity</th>
              <th className="border border-gray-300 p-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.OrderItems.map((item: any) => (
              <tr key={item.id}>
                <td className="border border-gray-300 p-2">{item.Item.name}</td>
                <td className="border border-gray-300 p-2">{item.Item.description}</td>
                <td className="border border-gray-300 p-2 text-right">${item.Item.price}</td>
                <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 p-2 text-right">
                  ${(item.Item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="my-5 no-print">
          <div className="bg-red-600 rounded w-fit p-1 text-white">
            <ApproveConfirmationDialog
              apiLink="finance_info"
              backTo=""
              buttonTitle="Remove"
              changeTo="removed"
              description="Are you sure to remove this order?"
              field="OrderStatus"
              id={orderDetails?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
