import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const CustomersSkeleton = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mb-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <div className="w-full min-w-[1000px]">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 pb-3 border-b border-neutral-200 mb-4">
            {[...Array(7)].map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>

          {/* Table Rows */}
          <div className="space-y-3">
            {[...Array(10)].map((_, rowIndex) => (
              <motion.div
                key={rowIndex}
                variants={itemVariants}
                className="grid grid-cols-7 gap-4 py-3 border-b border-neutral-100"
              >
                {[...Array(7)].map((_, colIndex) => (
                  <Skeleton key={colIndex} className="h-4 w-full" />
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomersSkeleton;

