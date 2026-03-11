import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';
import type { Order, OrderStats, OrderFilters } from '../types/order';

export const useOrders = (wholesalerId: number) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 0,
    size: 10,
    sortBy: 'orderDate',
    sortDir: 'desc',
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const fetchOrders = useCallback(async () => {
    if (!wholesalerId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrders(wholesalerId, filters);
      setOrders(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [wholesalerId, filters]);

  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 0, 
    }));
  }, []);

  const fetchStats = useCallback(async () => {
    if (!wholesalerId) return;
    try {
      const data = await orderService.getStats(wholesalerId);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [wholesalerId]);

  const approveOrder = async (orderId: number): Promise<boolean> => {
    try {
      await orderService.approveOrder(wholesalerId, orderId);
      await fetchOrders();
      await fetchStats();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to approve order');
      return false;
    }
  };

  const rejectOrder = async (orderId: number, reason: string): Promise<boolean> => {
    try {
      await orderService.rejectOrder(wholesalerId, orderId, { 
        reason, 
        notifySeller: true 
      });
      await fetchOrders();
      await fetchStats();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to reject order');
      return false;
    }
  };

  const updateStatus = async (orderId: number, statusUpdate: any): Promise<boolean> => {
    try {
      await orderService.updateStatus(wholesalerId, orderId, statusUpdate);
      await fetchOrders();
      await fetchStats();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      return false;
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]);

  return {
    orders,
    loading,
    error,
    stats,
    filters,
    pagination,
    updateFilters, 
    fetchOrders,
    approveOrder,
    rejectOrder,
    updateStatus,
  };
};