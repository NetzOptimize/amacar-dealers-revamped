import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Loader2 } from 'lucide-react';
import { updateInventoryItem } from '@/lib/api';
import toast from 'react-hot-toast';

const EditInventoryModal = ({ isOpen, onClose, vehicle, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [incentives, setIncentives] = useState({
    loyalty: 0,
    manufacturer: 0,
    conquest: 0,
    customer_cash: 0,
    manual_rebate: 0
  });
  const [perks, setPerks] = useState([]);
  const [newPerk, setNewPerk] = useState({ name: '', description: '', value: 0, type: 'service' });

  const isNewCar = vehicle?.new_used === 'N';

  useEffect(() => {
    if (isOpen && vehicle) {
      // Initialize incentives
      if (vehicle.incentives) {
        setIncentives({
          loyalty: vehicle.incentives.loyalty || 0,
          manufacturer: vehicle.incentives.manufacturer || 0,
          conquest: vehicle.incentives.conquest || 0,
          customer_cash: vehicle.incentives.customer_cash || 0,
          manual_rebate: vehicle.incentives.manual_rebate || 0
        });
      } else {
        setIncentives({
          loyalty: 0,
          manufacturer: 0,
          conquest: 0,
          customer_cash: 0,
          manual_rebate: 0
        });
      }

      // Initialize perks
      if (vehicle.perks && Array.isArray(vehicle.perks)) {
        setPerks(vehicle.perks);
      } else {
        setPerks([]);
      }

      // Reset new perk
      setNewPerk({ name: '', description: '', value: 0, type: 'service' });
    }
  }, [isOpen, vehicle]);

  const handleIncentiveChange = (key, value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue >= 0 && numValue <= 999999.99) {
      setIncentives(prev => ({
        ...prev,
        [key]: numValue
      }));
    }
  };

  const handleAddPerk = () => {
    if (newPerk.name.trim() && newPerk.value >= 0) {
      setPerks(prev => [...prev, {
        ...newPerk,
        value: parseFloat(newPerk.value) || 0
      }]);
      setNewPerk({ name: '', description: '', value: 0, type: 'service' });
    }
  };

  const handleRemovePerk = (index) => {
    setPerks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const updateData = {};

      // Add incentives only for new cars
      if (isNewCar) {
        updateData.incentives = incentives;
      }

      // Add perks
      updateData.perks = perks;

      const response = await updateInventoryItem(vehicle.id, updateData);

      if (response && response.success) {
        toast.success('Inventory updated successfully');
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(response?.message || 'Failed to update inventory');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update inventory');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900">
            Edit Inventory
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">
            Update incentives and perks for this vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Incentives Section - Only for New Cars */}
          {isNewCar && (
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-2">
                <h3 className="text-lg font-semibold text-neutral-900">Incentives (New Cars Only)</h3>
                <p className="text-sm text-neutral-600">Add manufacturer and dealer incentives</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loyalty" className="text-sm font-medium text-neutral-700">
                    Loyalty Rebate ($)
                  </Label>
                  <Input
                    id="loyalty"
                    type="number"
                    min="0"
                    max="999999.99"
                    step="0.01"
                    value={incentives.loyalty}
                    onChange={(e) => handleIncentiveChange('loyalty', e.target.value)}
                    className="h-10"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-sm font-medium text-neutral-700">
                    Manufacturer Rebate ($)
                  </Label>
                  <Input
                    id="manufacturer"
                    type="number"
                    min="0"
                    max="999999.99"
                    step="0.01"
                    value={incentives.manufacturer}
                    onChange={(e) => handleIncentiveChange('manufacturer', e.target.value)}
                    className="h-10"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conquest" className="text-sm font-medium text-neutral-700">
                    Conquest Rebate ($)
                  </Label>
                  <Input
                    id="conquest"
                    type="number"
                    min="0"
                    max="999999.99"
                    step="0.01"
                    value={incentives.conquest}
                    onChange={(e) => handleIncentiveChange('conquest', e.target.value)}
                    className="h-10"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_cash" className="text-sm font-medium text-neutral-700">
                    Customer Cash ($)
                  </Label>
                  <Input
                    id="customer_cash"
                    type="number"
                    min="0"
                    max="999999.99"
                    step="0.01"
                    value={incentives.customer_cash}
                    onChange={(e) => handleIncentiveChange('customer_cash', e.target.value)}
                    className="h-10"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manual_rebate" className="text-sm font-medium text-neutral-700">
                    Manual Rebate ($)
                  </Label>
                  <Input
                    id="manual_rebate"
                    type="number"
                    min="0"
                    max="999999.99"
                    step="0.01"
                    value={incentives.manual_rebate}
                    onChange={(e) => handleIncentiveChange('manual_rebate', e.target.value)}
                    className="h-10"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <strong>Total Incentives:</strong> {formatCurrency(
                    incentives.loyalty + 
                    incentives.manufacturer + 
                    incentives.conquest + 
                    incentives.customer_cash + 
                    incentives.manual_rebate
                  )}
                </p>
              </div>
            </div>
          )}

          {!isNewCar && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Incentives are only available for new cars. This vehicle is used.
              </p>
            </div>
          )}

          {/* Perks Section */}
          <div className="space-y-4">
            <div className="border-b border-neutral-200 pb-2">
              <h3 className="text-lg font-semibold text-neutral-900">Free Perks</h3>
              <p className="text-sm text-neutral-600">Add free perks or services included with this vehicle</p>
            </div>

            {/* Existing Perks */}
            {perks.length > 0 && (
              <div className="space-y-2">
                {perks.map((perk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">{perk.name}</div>
                      {perk.description && (
                        <div className="text-sm text-neutral-600 mt-1">{perk.description}</div>
                      )}
                      <div className="text-sm text-neutral-500 mt-1">
                        Value: {formatCurrency(perk.value)} • Type: {perk.type || 'service'}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePerk(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Perk */}
            <div className="border border-neutral-200 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-neutral-900">Add New Perk</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="perk_name" className="text-sm font-medium text-neutral-700">
                    Perk Name *
                  </Label>
                  <Input
                    id="perk_name"
                    type="text"
                    value={newPerk.name}
                    onChange={(e) => setNewPerk(prev => ({ ...prev, name: e.target.value }))}
                    className="h-10"
                    placeholder="e.g., Free Oil Change"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="perk_description" className="text-sm font-medium text-neutral-700">
                    Description
                  </Label>
                  <Input
                    id="perk_description"
                    type="text"
                    value={newPerk.description}
                    onChange={(e) => setNewPerk(prev => ({ ...prev, description: e.target.value }))}
                    className="h-10"
                    placeholder="e.g., One free oil change service"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perk_value" className="text-sm font-medium text-neutral-700">
                    Value ($) *
                  </Label>
                  <Input
                    id="perk_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPerk.value}
                    onChange={(e) => setNewPerk(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                    className="h-10"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perk_type" className="text-sm font-medium text-neutral-700">
                    Type
                  </Label>
                  <select
                    id="perk_type"
                    value={newPerk.type}
                    onChange={(e) => setNewPerk(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="service">Service</option>
                    <option value="accessory">Accessory</option>
                    <option value="warranty">Warranty</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddPerk}
                disabled={!newPerk.name.trim()}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Perk
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryModal;

