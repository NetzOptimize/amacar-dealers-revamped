import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const AdminSessionsSkeleton = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="px-4 md:px-6">
        {/* Header Skeleton */}
        <motion.div 
          className="mb-8"
          variants={headerVariants}
        >
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </motion.div>

        {/* Filters Skeleton */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            {[...Array(3)].map((_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-64 rounded-lg" />
          </div>
        </motion.div>

        {/* Table Skeleton */}
        <motion.div
          className="bg-white rounded-lg shadow-sm overflow-hidden"
          variants={itemVariants}
        >
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-8 gap-4">
              {[...Array(8)].map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, rowIndex) => (
              <div key={rowIndex} className="px-6 py-4">
                <div className="grid grid-cols-8 gap-4">
                  {[...Array(8)].map((_, colIndex) => (
                    <Skeleton key={colIndex} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-20 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminSessionsSkeleton;

