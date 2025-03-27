"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Generate the URL for a specific page
  const createPageURL = (pageNumber: number) => {
    // Create a new URLSearchParams instance
    const params = new URLSearchParams();
    
    // Copy all current parameters
    searchParams.forEach((value, key) => {
      params.set(key, value);
    });
    
    // Set the page parameter
    params.set('page', pageNumber.toString());
    
    return `${pathname}?${params.toString()}`;
  };
  
  // Determine which page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Show ellipsis if current page is more than 3
    if (currentPage > 3) {
      pageNumbers.push('...');
    }
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Show ellipsis if there are more pages after current page + 1
    if (currentPage + 1 < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always show last page if it exists
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  // If there's only one page, don't render pagination
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <nav className="mt-8 flex justify-center">
      <ul className="inline-flex -space-x-px">
        {/* Previous page button */}
        <li>
          <Link
            href={currentPage > 1 ? createPageURL(currentPage - 1) : '#'}
            className={`
              px-3 py-2 ml-0 leading-tight border border-gray-300 rounded-l-lg 
              ${currentPage === 1 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white hover:bg-gray-100 hover:text-primary'
              }
            `}
            aria-disabled={currentPage === 1}
          >
            Previous
          </Link>
        </li>
        
        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 leading-tight border border-gray-300 text-gray-700 bg-white">
                ...
              </span>
            ) : (
              <Link
                href={createPageURL(page as number)}
                className={`
                  px-3 py-2 leading-tight border border-gray-300
                  ${currentPage === page
                    ? 'text-white bg-primary border-primary'
                    : 'text-gray-700 bg-white hover:bg-gray-100 hover:text-primary'
                  }
                `}
              >
                {page}
              </Link>
            )}
          </li>
        ))}
        
        {/* Next page button */}
        <li>
          <Link
            href={currentPage < totalPages ? createPageURL(currentPage + 1) : '#'}
            className={`
              px-3 py-2 leading-tight border border-gray-300 rounded-r-lg 
              ${currentPage === totalPages
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-white hover:bg-gray-100 hover:text-primary'
              }
            `}
            aria-disabled={currentPage === totalPages}
          >
            Next
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination; 