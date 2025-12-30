import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, Sparkles } from 'lucide-react';

const PerksModal = ({ isOpen, onClose, perks }) => {
  // Parse perks if not already parsed
  const parsePerksForDisplay = (perks) => {
    if (!perks) return [];
    
    // If already an array of objects, return as is
    if (Array.isArray(perks) && perks.length > 0 && typeof perks[0] === 'object' && perks[0].value) {
      return perks;
    }
    
    if (typeof perks === 'string') {
      try {
        const parsed = JSON.parse(perks);
        if (typeof parsed === 'object' && parsed !== null) {
          const result = [];
          Object.entries(parsed).forEach(([key, value]) => {
            if (value !== null && value !== '') {
              const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
              const valueStr = String(value);
              
              if (valueStr.includes(',')) {
                const items = valueStr.split(',').map(item => item.trim()).filter(item => item);
                items.forEach(item => {
                  result.push({ label: formattedKey, value: item });
                });
              } else {
                result.push({ label: formattedKey, value: valueStr });
              }
            }
          });
          return result;
        }
        if (perks.includes(',')) {
          return perks.split(',').map(item => ({
            label: 'Benefit',
            value: item.trim()
          })).filter(item => item.value);
        }
        return [{ label: 'Benefit', value: perks.trim() }];
      } catch {
        if (perks.includes(',')) {
          return perks.split(',').map(item => ({
            label: 'Benefit',
            value: item.trim()
          })).filter(item => item.value);
        }
        return [{ label: 'Benefit', value: perks.trim() }];
      }
    }
    
    if (Array.isArray(perks)) {
      return perks.map(perk => ({
        label: 'Benefit',
        value: String(perk).trim()
      })).filter(perk => perk.value);
    }
    
    if (typeof perks === 'object' && perks !== null) {
      const result = [];
      Object.entries(perks).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
          const valueStr = String(value);
          
          if (valueStr.includes(',')) {
            const items = valueStr.split(',').map(item => item.trim()).filter(item => item);
            items.forEach(item => {
              result.push({ label: formattedKey, value: item });
            });
          } else {
            result.push({ label: formattedKey, value: valueStr });
          }
        }
      });
      return result;
    }
    
    return [];
  };

  const displayPerks = parsePerksForDisplay(perks);

  if (!isOpen || !displayPerks || displayPerks.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.16, 1, 0.3, 1] // Custom easing for smooth animation
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border-2 border-orange-200/50">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-orange-50 via-white to-orange-50 p-6 border-b border-orange-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center border-2 border-orange-200 shadow-sm"
                    >
                      <Sparkles className="w-6 h-6 text-orange-600" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900">Perks & Benefits</h2>
                      <p className="text-sm text-neutral-600 mt-1">
                        {displayPerks.length} benefit{displayPerks.length !== 1 ? 's' : ''} included
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayPerks.map((perk, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        delay: 0.3 + index * 0.05,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                      className="group relative"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.05, type: "spring" }}
                          className="flex-shrink-0 mt-0.5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white border-2 border-orange-200 flex items-center justify-center shadow-sm group-hover:border-orange-300 transition-colors">
                            <CheckCircle2 className="w-4 h-4 text-orange-600" />
                          </div>
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          {perk.label && perk.label !== 'Benefit' && (
                            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">
                              {perk.label}
                            </p>
                          )}
                          <p className="text-sm font-medium text-neutral-800 leading-relaxed">
                            {perk.value}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 border-t border-orange-200 bg-gradient-to-r from-orange-50/50 to-white"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Close
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PerksModal;

