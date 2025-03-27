"use client";

import React, { ReactNode } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterPanelProps {
  children?: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  title?: string;
}

export default function FilterPanel({ children, onSubmit, title = "Filters and Search" }: FilterPanelProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      {title && <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>}
      <form onSubmit={onSubmit || (e => e.preventDefault())}>
        <div className="flex flex-col md:flex-row gap-4">
          {children}
        </div>
      </form>
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
}

export function FilterSelect({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "All" 
}: FilterSelectProps) {
  return (
    <div className="md:w-1/3 lg:w-1/4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FilterSearchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export function FilterSearch({ 
  label, 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Search..." 
}: FilterSearchProps) {
  return (
    <div className="md:w-1/3 lg:w-1/4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 border border-gray-300 rounded-l"
        />
        <button
          type="button"
          onClick={onSearch}
          className="bg-gray-200 hover:bg-gray-300 px-4 rounded-r"
        >
          🔍
        </button>
      </div>
    </div>
  );
} 