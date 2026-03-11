import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { OrderStatus } from '../../../types/order';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { status: OrderStatus; comments?: string; trackingNumber?: string }) => void;
  currentStatus: OrderStatus;
}

const statusOptions: OrderStatus[] = ['PROCESSING', 'SHIPPED', 'DELIVERED'];

export const StatusUpdateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStatus,
}) => {
  const [status, setStatus] = useState<OrderStatus>('PROCESSING');
  const [comments, setComments] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ status, comments, trackingNumber });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Update Order Status</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {status === 'SHIPPED' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter tracking number"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comments
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add any comments..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};