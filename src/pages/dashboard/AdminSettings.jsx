import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { getAdminSettings, updateAdminSettings } from "@/lib/api";
import { 
  Settings, 
  Save, 
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminSettings();

      if (response.success) {
        const settingsData = response.data?.settings || {};
        setSettings(settingsData);
        setOriginalSettings(JSON.parse(JSON.stringify(settingsData)));
        setHasChanges(false);
      } else {
        throw new Error(response.message || "Failed to fetch settings");
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load settings";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
      return newSettings;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await updateAdminSettings(settings);

      if (response.success) {
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        setHasChanges(false);
        toast.success("Settings updated successfully");
      } else {
        throw new Error(response.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update settings";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setHasChanges(false);
    toast.info("Settings reset to original values");
  };

  const renderSettingField = (key, label, type = "text", placeholder = "", options = []) => {
    const value = settings[key] ?? "";

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : type === "select" ? (
          <select
            value={value}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === "number" ? (
          <input
            type="number"
            value={value}
            onChange={(e) => handleSettingChange(key, parseFloat(e.target.value) || 0)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ) : type === "checkbox" ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === true || value === "true" || value === 1}
              onChange={(e) => handleSettingChange(key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-600">{placeholder}</label>
          </div>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="px-4 md:px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2 flex items-center gap-2">
                <Settings className="h-8 w-8" />
                System Settings
              </h1>
              <p className="text-neutral-600">
                Configure reverse bidding system settings
              </p>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
            )}
          </div>
        </motion.div>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            variants={itemVariants}
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Settings Form */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            General Settings
          </h2>

          {/* Dynamic settings rendering */}
          {Object.keys(settings).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No settings available</p>
              <p className="text-sm mt-2">
                Settings will be displayed here once they are configured
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(settings).map(([key, value]) => {
                // Determine field type based on key and value
                let fieldType = "text";
                let label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                let placeholder = "";

                if (typeof value === "boolean" || value === "true" || value === "false") {
                  fieldType = "checkbox";
                  placeholder = `Enable ${label}`;
                } else if (typeof value === "number") {
                  fieldType = "number";
                } else if (key.includes("duration") || key.includes("timeout") || key.includes("interval")) {
                  fieldType = "number";
                  placeholder = "Enter time in seconds";
                } else if (key.includes("email") || key.includes("mail")) {
                  fieldType = "email";
                } else if (key.includes("url") || key.includes("link")) {
                  fieldType = "url";
                } else if (key.includes("description") || key.includes("message") || key.includes("note")) {
                  fieldType = "textarea";
                }

                return (
                  <div key={key}>
                    {renderSettingField(key, label, fieldType, placeholder)}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex items-center justify-end gap-4"
          variants={itemVariants}
        >
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Save Settings
          </button>
        </motion.div>

        {!hasChanges && Object.keys(settings).length > 0 && (
          <motion.div
            className="mt-4 flex items-center gap-2 text-green-600"
            variants={itemVariants}
          >
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">All settings saved</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminSettings;

