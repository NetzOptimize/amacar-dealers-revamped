import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const WonSessionsSkeleton = () => {
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

        {/* Sessions Grid Skeleton */}
        <motion.div 
          className="mt-8"
          variants={itemVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
              >
                {/* Image Skeleton */}
                <div className="relative h-40 w-full bg-gradient-to-br from-neutral-50 to-neutral-100">
                  <Skeleton className="w-full h-full rounded-none" />
                  <div className="absolute top-3 right-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
                
                {/* Content Skeleton */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-3 h-3 rounded" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Button Skeleton */}
                  <div className="mt-4">
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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

export default WonSessionsSkeleton;

