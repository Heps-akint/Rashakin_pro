"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import supabase from '@/app/lib/supabase';
import { Order } from '@/app/lib/types';
import { fetchOrdersWithFilters, formatDate, getStatusBadgeClass } from '@/app/lib/admin-utils';
import AdminDataTable from '@/app/components/ui/AdminDataTable';
import FilterPanel, { FilterSelect, FilterSearch } from '@/app/components/ui/FilterPanel';

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    filterParam === 'pending' ? 'Pending' : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Pagination
  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, [filterParam, selectedStatus, currentPage]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      let fromDate = null;
      if (filterParam === 'recent') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        fromDate = sevenDaysAgo;
      }

      const { orders, totalPages } = await fetchOrdersWithFilters({
        page: currentPage,
        perPage: itemsPerPage,
        status: selectedStatus,
        fromDate,
        search: searchQuery || null
      });
      
      setOrders(orders);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadOrders();
  };

  // Prepare table columns
  const columns = [
    { 
      header: 'Order ID', 
      accessor: (order: Order) => `#${order.id}`
    },
    { 
      header: 'Customer', 
      accessor: (order: Order) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {order.customer_name || 'Guest'}
          </div>
          <div className="text-sm text-gray-500">
            {order.customer_email || 'No email'}
          </div>
        </div>
      )
    },
    { 
      header: 'Date', 
      accessor: (order: Order) => formatDate(order.created_at)
    },
    { 
      header: 'Total', 
      accessor: (order: Order) => `$${order.total_amount.toFixed(2)}`
    },
    { 
      header: 'Status', 
      accessor: (order: Order) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
          {order.status}
        </span>
      )
    },
    { 
      header: 'Actions', 
      accessor: (order: Order) => (
        <Link
          href={`/admin/orders/${order.id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View Details
        </Link>
      )
    },
  ];

  // Status options for filter
  const statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];

  // Time options for filter
  const timeOptions = [
    { label: 'Last 7 Days', value: 'recent' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {filterParam === 'recent'
            ? 'Recent Orders (Last 7 Days)'
            : filterParam === 'pending'
              ? 'Pending Orders'
              : 'Order Management'}
        </h1>
      </div>
      
      {/* Filters and Search */}
      <FilterPanel onSubmit={handleSearch}>
        {/* Status Filter */}
        <FilterSelect
          label="Filter by Status"
          value={selectedStatus || ''}
          onChange={(value) => {
            setSelectedStatus(value || null);
            setCurrentPage(1);
            
            // Update URL if needed
            if (value.toLowerCase() === 'pending') {
              router.push('/admin/orders?filter=pending');
            } else if (value) {
              router.push(`/admin/orders?status=${value.toLowerCase()}`);
            } else {
              router.push('/admin/orders');
            }
          }}
          options={statusOptions}
          placeholder="All Statuses"
        />
        
        {/* Time Filter */}
        <FilterSelect
          label="Filter by Time"
          value={filterParam === 'recent' ? 'recent' : ''}
          onChange={(value) => {
            if (value) {
              router.push(`/admin/orders?filter=${value}`);
            } else {
              router.push('/admin/orders');
            }
            setCurrentPage(1);
          }}
          options={timeOptions}
          placeholder="All Time"
        />
        
        {/* Search */}
        <FilterSearch
          label="Search Orders"
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={() => {
            setCurrentPage(1);
            loadOrders();
          }}
          placeholder="Search by order ID or customer"
        />
      </FilterPanel>
      
      {/* Orders Table */}
      <AdminDataTable
        columns={columns}
        data={orders}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No orders found"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
} 