import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const InventorySkeleton = () => {
  // Animation variants
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

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Skeleton */}
      <motion.div 
        className="flex items-center justify-between mb-6"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-4 w-40" />
      </motion.div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block overflow-x-auto">
        <motion.div 
          className="w-full min-w-[1400px]"
          variants={itemVariants}
        >
          {/* Table Header Skeleton */}
          <div className="grid grid-cols-10 gap-4 mb-6 pb-4 border-b border-neutral-200">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20 ml-auto" />
          </div>

          {/* Table Rows Skeleton */}
          <div className="space-y-4">
            {[...Array(6)].map((_, rowIndex) => (
              <motion.div
                key={rowIndex}
                className="grid grid-cols-10 gap-4 py-4"
                variants={itemVariants}
                transition={{ delay: rowIndex * 0.1 }}
              >
                {/* Image Column */}
                <Skeleton className="h-16 w-20 rounded-lg" />
                
                {/* Title Column */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                
                {/* Make/Model Column */}
                <Skeleton className="h-4 w-24" />
                
                {/* Price Column */}
                <Skeleton className="h-4 w-16" />
                
                {/* Year Column */}
                <Skeleton className="h-4 w-12" />
                
                {/* Condition Column */}
                <Skeleton className="h-4 w-12" />
                
                {/* Location Column */}
                <Skeleton className="h-4 w-20" />
                
                {/* Status Column */}
                <Skeleton className="h-6 w-16 rounded-full" />
                
                {/* Date Added Column */}
                <Skeleton className="h-4 w-20" />
                
                {/* Actions Column */}
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Mobile Card Skeleton */}
      <div className="md:hidden space-y-4">
        {[...Array(4)].map((_, cardIndex) => (
          <motion.div
            key={cardIndex}
            className="bg-neutral-50 rounded-xl p-4 border border-neutral-200"
            variants={itemVariants}
            transition={{ delay: cardIndex * 0.1 }}
          >
            <div className="flex gap-4">
              {/* Image */}
              <Skeleton className="h-24 w-32 rounded-lg flex-shrink-0" />
              
              <div className="flex-1 space-y-3">
                {/* Title */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>

              {/* Vehicle Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex justify-between items-start">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

                {/* Action Button */}
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default InventorySkeleton;

