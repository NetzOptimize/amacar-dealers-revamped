import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const MyReverseBidsSkeleton = () => {
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
      className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="px-4 md:px-6">
        {/* Header Section Skeleton */}
        <motion.div 
          className="mb-8"
          variants={headerVariants}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-96" />
        </motion.div>

        {/* Filter Buttons Skeleton */}
        <motion.div 
          className="mb-6 flex flex-wrap gap-3"
          variants={itemVariants}
        >
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-2xl" />
          ))}
        </motion.div>

        {/* Bids List Skeleton */}
        <motion.div 
          className="space-y-4"
          variants={itemVariants}
        >
          {[...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl border border-neutral-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-5 w-20 ml-auto" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination Skeleton */}
        <motion.div 
          className="flex justify-center mt-8"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MyReverseBidsSkeleton;

