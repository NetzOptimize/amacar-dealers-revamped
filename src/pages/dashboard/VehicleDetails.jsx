import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Tag,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { getVehicleDetail, markVehicleSold } from "@/lib/api";
import { toast } from "react-hot-toast";
import "photoswipe/dist/photoswipe.css";
import { Gallery, Item } from "react-photoswipe-gallery";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/Button";

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMarkSoldModal, setShowMarkSoldModal] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  // Fetch vehicle details on mount
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) {
        setError("Vehicle ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getVehicleDetail(id);

        if (response && response.success && response.data) {
          setVehicleData(response.data);
        } else {
          setError(response?.message || "Failed to fetch vehicle details");
        }
      } catch (err) {
        console.error("Error fetching vehicle details:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch vehicle details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id]);

  // Handle scroll to detect when sticky header is active
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Set sticky when scrolled past initial position (approximately 100px)
      const shouldBeSticky = scrollPosition > 100;
      setIsHeaderSticky(shouldBeSticky);
      
      // Add/remove class to body to hide DashboardLayout header
      if (shouldBeSticky) {
        document.body.classList.add('vehicle-details-sticky-active');
      } else {
        document.body.classList.remove('vehicle-details-sticky-active');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Clean up class on unmount
      document.body.classList.remove('vehicle-details-sticky-active');
    };
  }, []);

  // Prepare images array for PhotoSwipe
  const images = useMemo(() => {
    if (!vehicleData?.images?.length) return [];

    return vehicleData.images.map((img, index) => {
      let url = "";
      let thumbnail = "";

      if (typeof img === "string") {
        url = img;
        thumbnail = img;
      } else if (img?.url || img?.full) {
        url = img.url || img.full;
        thumbnail = img.thumbnail || img.medium || img.url || img.full;
      } else if (img?.thumbnail) {
        thumbnail = img.thumbnail;
        url = img.url || img.medium || img.large || img.thumbnail;
      }

      return {
        src: url,
        thumbnail: thumbnail || url,
        width: img.width || 1200,
        height: img.height || 800,
        alt: vehicleData.title || `Vehicle Image ${index + 1}`,
      };
    });
  }, [vehicleData?.images, vehicleData?.title]);

  const primaryImage = images[0];
  const imageCount = images.length;

  // Check if vehicle is sold
  const isSold = vehicleData?.inventory_status === "sold";
  
  // Check if vehicle has active bids
  const hasActiveBids = vehicleData?.has_active_bids === true;
  
  // Handle mark as sold
  const handleMarkAsSold = async () => {
    try {
      setMarkingSold(true);
      const response = await markVehicleSold(id);
      
      if (response && response.success) {
        toast.success("Vehicle marked as sold successfully");
        setShowMarkSoldModal(false);
        // Refresh vehicle data
        const updatedData = await getVehicleDetail(id);
        if (updatedData && updatedData.success && updatedData.data) {
          setVehicleData(updatedData.data);
        }
      } else {
        toast.error(response?.message || "Failed to mark vehicle as sold");
      }
    } catch (err) {
      console.error("Error marking vehicle as sold:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to mark vehicle as sold"
      );
    } finally {
      setMarkingSold(false);
    }
  };

  // Condition badge
  const conditionValue = vehicleData?.new_used || vehicleData?.condition || "new";
  const conditionBadge =
    conditionValue === "U" || conditionValue === "used" ? "Used" : "New";
  const conditionColor =
    conditionValue === "U" || conditionValue === "used"
      ? "bg-blue-500/80"
      : "bg-green-500/80";

  // Location
  const location =
    vehicleData?.city && vehicleData?.state
      ? `${vehicleData.city}, ${vehicleData.state}`
      : vehicleData?.zip_code || "Location unavailable";

  // Price
  const price = vehicleData?.price || vehicleData?.regular_price || 0;
  const salePrice = vehicleData?.sale_price;
  const onSale = vehicleData?.on_sale || (salePrice && salePrice < price);
  const priceHtml = vehicleData?.price_html;

  // Extract mileage from description if available
  const extractMileage = (desc) => {
    if (!desc) return null;
    const mileageMatch = desc.match(/mileage[:\s]*(\d+(?:,\d{3})*)\s*miles?/i);
    if (mileageMatch) {
      return parseInt(mileageMatch[1].replace(/,/g, ""), 10);
    }
    return null;
  };

  // Extract MPG from description if available
  const extractMPG = (desc) => {
    if (!desc) return { city: null, highway: null };
    const mpgMatch = desc.match(/mpg[:\s]*(\d+)\s*city\s*\/\s*(\d+)\s*highway/i);
    if (mpgMatch) {
      return { city: parseInt(mpgMatch[1], 10), highway: parseInt(mpgMatch[2], 10) };
    }
    return { city: null, highway: null };
  };

  const mileage =
    vehicleData?.mileage ||
    vehicleData?.odometer ||
    extractMileage(vehicleData?.description);
  const mpgData = extractMPG(vehicleData?.description);
  const mpgCity = vehicleData?.mpg_city || vehicleData?.city_mpg || mpgData.city;
  const mpgHighway =
    vehicleData?.mpg_highway || vehicleData?.highway_mpg || mpgData.highway;

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-neutral-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicleData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">
            {error ? "Error Loading Vehicle Details" : "Vehicle Not Found"}
          </h3>
          <p className="text-neutral-600 mb-6">{error || "No vehicle data available"}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Initial Header (shown when not sticky) */}
      {!isHeaderSticky && (
        <div className="bg-gray-50 pt-10 md:pt-24 px-4 md:px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="mb-4 text-sm text-neutral-600">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-neutral-400">
                  {vehicleData.vin ? `VIN: ${vehicleData.vin}` : `Vehicle #${id}`}
                </span>
              </div>
            </nav>

            {/* Header with Vehicle Title */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0 pr-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 mb-2 truncate">
                  {vehicleData.title ||
                    `${vehicleData.year || ""} ${vehicleData.make || ""} ${vehicleData.model || ""}`.trim()}
                </h1>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-600 flex-wrap">
                  <span className="px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 whitespace-nowrap">
                    {conditionBadge}
                  </span>
                  {mileage && (
                    <>
                      <span>•</span>
                      <span className="whitespace-nowrap">{mileage.toLocaleString()} mi</span>
                    </>
                  )}
                  {(mpgCity || mpgHighway) && (
                    <>
                      <span>•</span>
                      <span className="whitespace-nowrap">
                        {mpgCity && mpgHighway
                          ? `${mpgCity} city / ${mpgHighway} highway MPG`
                          : mpgCity
                          ? `${mpgCity} city MPG`
                          : `${mpgHighway} highway MPG`}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors inline-flex items-center"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-neutral-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header (shown when scrolled) */}
      <div 
        className={`fixed top-0 right-0 z-50 hidden lg:block bg-white border-b border-neutral-200 shadow-sm transition-all duration-300 lg:left-64 ${
          isHeaderSticky ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 truncate">
                {vehicleData.title ||
                  `${vehicleData.year || ""} ${vehicleData.make || ""} ${vehicleData.model || ""}`.trim()}
              </h1>
              <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-100">
                  {conditionBadge}
                </span>
                {vehicleData.vin && (
                  <>
                    <span>•</span>
                    <span className="text-neutral-400">VIN: {vehicleData.vin}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors inline-flex items-center"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 pb-12">
        <div className="max-w-7xl mx-auto">

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Gallery>
              <div className="relative bg-neutral-100 rounded-xl overflow-hidden">
                {primaryImage && images.length > 0 ? (
                  <div className="relative aspect-[4/3]">
                    {images.map((image, index) => (
                      <Item
                        key={`gallery-${index}`}
                        original={image.src}
                        thumbnail={image.thumbnail || image.src}
                        width={image.width}
                        height={image.height}
                        alt={image.alt}
                      >
                        {({ ref, open }) => (
                          <img
                            ref={ref}
                            onClick={open}
                            src={index === 0 ? image.src : image.thumbnail || image.src}
                            alt={image.alt}
                            className={`w-full h-full object-cover cursor-pointer ${
                              index === 0 ? "block" : "hidden"
                            }`}
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                        )}
                      </Item>
                    ))}

                    {/* Condition Badge */}
                    <div
                      className={`absolute top-4 right-4 px-3 py-1.5 rounded-md text-sm font-medium backdrop-blur-md text-white z-30 ${conditionColor}`}
                    >
                      {conditionBadge}
                    </div>

                    {/* Image Count */}
                    {imageCount > 1 && (
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md text-sm font-semibold backdrop-blur-md bg-black/60 text-white z-30">
                        Show all photos ({imageCount})
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center bg-neutral-200 text-neutral-400">
                    <span>No Image Available</span>
                  </div>
                )}
              </div>
            </Gallery>

            {/* Short Description */}
            {vehicleData.short_description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50 p-6"
              >
                <div
                  className="text-neutral-700 text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: vehicleData.short_description }}
                />
              </motion.div>
            )}

            {/* Tabs Section */}
            {(() => {
              // Extract Features section from description
              const extractFeaturesSection = (desc) => {
                if (!desc) return null;
                const featuresMatch = desc.match(/<h3>Features<\/h3>([\s\S]*?)(?=<h3>|$)/i);
                if (featuresMatch) {
                  return featuresMatch[1];
                }
                return null;
              };

              // Extract Vehicle Details section from description
              const extractVehicleDetailsSection = (desc) => {
                if (!desc) return null;
                const detailsMatch = desc.match(/<h3>Vehicle Details<\/h3>([\s\S]*?)(?=<h3>|$)/i);
                if (detailsMatch) {
                  return detailsMatch[1];
                }
                return null;
              };

              const featuresSection = extractFeaturesSection(vehicleData.description);
              const vehicleDetailsSection = extractVehicleDetailsSection(vehicleData.description);

              // Process sections for styling
              const processSection = (section) => {
                if (!section) return "";
                return section.replace(/<ul>([\s\S]*?)<\/ul>/gi, (match, content) => {
                  const hasStrongTags = /<strong>/.test(content);
                  const listClass = hasStrongTags ? "vehicle-details-list" : "features-list";
                  return `<ul class="${listClass}">${content}</ul>`;
                });
              };

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
                >
                  <Tabs defaultValue="overview" className="w-full">
                    <div className="border-b border-neutral-200 p-6">
                      <TabsList className="bg-neutral-100/50 w-full justify-start h-auto p-1">
                        <TabsTrigger
                          value="overview"
                          className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm px-4 py-2"
                        >
                          Vehicle Overview
                        </TabsTrigger>
                        {vehicleDetailsSection && (
                          <TabsTrigger
                            value="details"
                            className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm px-4 py-2"
                          >
                            Vehicle Details
                          </TabsTrigger>
                        )}
                        {featuresSection && (
                          <TabsTrigger
                            value="features"
                            className="data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm px-4 py-2"
                          >
                            Features
                          </TabsTrigger>
                        )}
                      </TabsList>
                    </div>

                    {/* Vehicle Overview Tab */}
                    <TabsContent value="overview" className="p-6 m-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {vehicleData.id && (
                          <div>
                            <span className="text-sm text-neutral-500">ID</span>
                            <p className="font-medium">{vehicleData.id}</p>
                          </div>
                        )}
                        {vehicleData.title && (
                          <div>
                            <span className="text-sm text-neutral-500">Title</span>
                            <p className="font-medium">{vehicleData.title}</p>
                          </div>
                        )}
                        {vehicleData.sku && (
                          <div>
                            <span className="text-sm text-neutral-500">SKU</span>
                            <p className="font-medium">{vehicleData.sku}</p>
                          </div>
                        )}
                        {vehicleData.status && (
                          <div>
                            <span className="text-sm text-neutral-500">Status</span>
                            <p className="font-medium capitalize">{vehicleData.status}</p>
                          </div>
                        )}
                        {vehicleData.vin && (
                          <div>
                            <span className="text-sm text-neutral-500">VIN</span>
                            <p className="font-medium font-mono">{vehicleData.vin}</p>
                          </div>
                        )}
                        {vehicleData.make && (
                          <div>
                            <span className="text-sm text-neutral-500">Make</span>
                            <p className="font-medium">{vehicleData.make}</p>
                          </div>
                        )}
                        {vehicleData.model && (
                          <div>
                            <span className="text-sm text-neutral-500">Model</span>
                            <p className="font-medium">{vehicleData.model}</p>
                          </div>
                        )}
                        {vehicleData.year && (
                          <div>
                            <span className="text-sm text-neutral-500">Year</span>
                            <p className="font-medium">{vehicleData.year}</p>
                          </div>
                        )}
                        {conditionValue && (
                          <div>
                            <span className="text-sm text-neutral-500">Condition</span>
                            <p className="font-medium">{conditionBadge}</p>
                          </div>
                        )}
                        {mileage && (
                          <div>
                            <span className="text-sm text-neutral-500">Mileage</span>
                            <p className="font-medium">{mileage.toLocaleString()} miles</p>
                          </div>
                        )}
                        {(mpgCity || mpgHighway) && (
                          <div>
                            <span className="text-sm text-neutral-500">MPG</span>
                            <p className="font-medium">
                              {mpgCity && mpgHighway
                                ? `${mpgCity} city / ${mpgHighway} highway`
                                : mpgCity || mpgHighway}
                            </p>
                          </div>
                        )}
                        {location !== "Location unavailable" && (
                          <div className="sm:col-span-2">
                            <span className="text-sm text-neutral-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Location
                            </span>
                            <p className="font-medium">{location}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Vehicle Details Tab */}
                    {vehicleDetailsSection && (
                      <TabsContent value="details" className="p-6 sm:p-8 m-0">
                        <div className="prose prose-lg max-w-none">
                          <style>{`
                            .vehicle-description h3 {
                              font-size: 1.5rem;
                              font-weight: 700;
                              color: #171717;
                              margin-top: 2rem;
                              margin-bottom: 1.25rem;
                              padding-bottom: 0.75rem;
                              border-bottom: 2px solid #f97316;
                            }
                            .vehicle-description h3:first-of-type {
                              margin-top: 0;
                            }
                            .vehicle-description ul {
                              list-style: none;
                              padding: 0;
                              margin: 0 0 1.5rem 0;
                            }
                            .vehicle-description ul li {
                              padding: 0.875rem 0 0.875rem 1.5rem;
                              border-bottom: 1px solid #e5e5e5;
                              display: flex;
                              align-items: flex-start;
                              gap: 0.75rem;
                              font-size: 0.9375rem;
                              line-height: 1.5;
                              position: relative;
                            }
                            .vehicle-description ul li:last-child {
                              border-bottom: none;
                            }
                            .vehicle-description ul li strong {
                              color: #171717;
                              font-weight: 600;
                              min-width: 140px;
                              flex-shrink: 0;
                            }
                            .vehicle-description .vehicle-details-list li::before {
                              content: "•";
                              color: #737373;
                              font-weight: bold;
                              position: absolute;
                              left: 0;
                              font-size: 1.25rem;
                              line-height: 1;
                            }
                          `}</style>
                          <div
                            className="vehicle-description text-neutral-700"
                            dangerouslySetInnerHTML={{
                              __html: processSection(vehicleDetailsSection),
                            }}
                          />
                        </div>
                      </TabsContent>
                    )}

                    {/* Features Tab */}
                    {featuresSection && (
                      <TabsContent value="features" className="p-6 sm:p-8 m-0">
                        <div className="prose prose-lg max-w-none">
                          <style>{`
                            .vehicle-description h3 {
                              font-size: 1.5rem;
                              font-weight: 700;
                              color: #171717;
                              margin-top: 0;
                              margin-bottom: 1.25rem;
                              padding-bottom: 0.75rem;
                              border-bottom: 2px solid #f97316;
                            }
                            .vehicle-description ul {
                              list-style: none;
                              padding: 0;
                              margin: 0 0 1.5rem 0;
                              display: grid;
                              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                              gap: 0.75rem;
                            }
                            .vehicle-description ul li {
                              padding: 0.75rem 0 0.75rem 1.5rem;
                              border: 1px solid #e5e5e5;
                              border-radius: 0.5rem;
                              display: flex;
                              align-items: center;
                              gap: 0.75rem;
                              font-size: 0.875rem;
                              line-height: 1.4;
                              position: relative;
                              background-color: #fafafa;
                              transition: all 0.2s ease;
                            }
                            .vehicle-description ul li:hover {
                              background-color: #f5f5f5;
                              border-color: #f97316;
                            }
                            .vehicle-description .features-list li::before {
                              content: "✓";
                              color: #f97316;
                              font-weight: bold;
                              position: absolute;
                              left: 0.5rem;
                              font-size: 1rem;
                            }
                          `}</style>
                          <div
                            className="vehicle-description text-neutral-700"
                            dangerouslySetInnerHTML={{
                              __html: processSection(featuresSection),
                            }}
                          />
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
                </motion.div>
              );
            })()}

            {/* Dates */}
            {(vehicleData.date_created || vehicleData.date_modified) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl border border-neutral-200 p-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neutral-500" />
                  Dates
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicleData.date_created && (
                    <div>
                      <span className="text-sm text-neutral-500">Created</span>
                      <p className="font-medium">{formatDate(vehicleData.date_created)}</p>
                    </div>
                  )}
                  {vehicleData.date_modified && (
                    <div>
                      <span className="text-sm text-neutral-500">Last Modified</span>
                      <p className="font-medium">{formatDate(vehicleData.date_modified)}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Pricing and Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing Card - Sticky */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl border border-neutral-200 p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-neutral-900">Price</h3>
              {price ? (
                <div className="space-y-6">
                  {onSale && salePrice ? (
                    <>
                      <div>
                        <div className="text-3xl font-bold text-primary-600 mb-1">
                          {priceHtml ? (
                            <span dangerouslySetInnerHTML={{ __html: priceHtml }} />
                          ) : (
                            formatCurrency(salePrice)
                          )}
                        </div>
                        <div className="text-sm text-neutral-500 line-through">
                          {formatCurrency(price)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-3xl font-bold text-neutral-900">
                      {priceHtml ? (
                        <span dangerouslySetInnerHTML={{ __html: priceHtml }} />
                      ) : (
                        formatCurrency(price)
                      )}
                    </div>
                  )}
                  <div className="text-sm text-neutral-600 font-medium">List price</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-lg font-semibold text-neutral-400">
                    Price not available
                  </div>
                </div>
              )}
              
              {/* Mark as Sold Button */}
              {!isSold && !hasActiveBids && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <Button
                    onClick={() => setShowMarkSoldModal(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Mark as Sold
                  </Button>
                </div>
              )}
              
              {isSold && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>This vehicle has been marked as sold</span>
                  </div>
                </div>
              )}
              
              {hasActiveBids && !isSold && (
                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <div className="flex items-center gap-2 text-amber-600 font-medium text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>This vehicle has active bids and cannot be marked as sold</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Mark as Sold Confirmation Modal */}
      <AnimatePresence>
        {showMarkSoldModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            >
              <button
                onClick={() => setShowMarkSoldModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
              
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
                <Tag className="w-8 h-8 text-orange-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-neutral-900 text-center mb-2">
                Mark Vehicle as Sold?
              </h2>
              
              <p className="text-neutral-600 text-center mb-6">
                Are you sure you want to mark this vehicle as sold?
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Important Notice</p>
                    <p>
                      After marking this vehicle as sold, customers will no longer be able to see this vehicle in your inventory. This action cannot be easily undone.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowMarkSoldModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={markingSold}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMarkAsSold}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  disabled={markingSold}
                >
                  {markingSold ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Sold
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleDetails;
