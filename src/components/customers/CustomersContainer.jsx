import { motion } from "framer-motion";
import { Eye, Edit, MoreHorizontal, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditCustomerModal from "./EditCustomerModal";
import { useState } from "react";

const CustomersContainer = ({
  customers = [],
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  onPageChange = () => {},
  onViewCustomer = () => {},
  onCustomerUpdated = () => {},
}) => {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Calculate pagination display from actual data
  const startIndex = customers.length > 0 ? (currentPage - 1) * 10 + 1 : 0;
  const endIndex = customers.length > 0 ? Math.min((currentPage - 1) * 10 + customers.length, totalCount) : 0;

  // Animation variants
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

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCustomer(null);
  };

  const handleEditSuccess = () => {
    handleCloseEditModal();
    onCustomerUpdated();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 mb-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                Customers
              </h3>
              <p className="text-sm text-neutral-600">
                All customer information
              </p>
            </div>
          </div>
          <div className="text-sm text-neutral-500">
            {customers.length === 0 ? (
              "No customers found"
            ) : (
              <>
                Showing {startIndex}-{endIndex} of {totalCount} customers
              </>
            )}
          </div>
        </div>

        {/* Empty State */}
        {customers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No Customers
            </h3>
            <p className="text-neutral-600 text-center max-w-md">
              No customers found in the system
            </p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-neutral-200 hover:bg-transparent">
                  <TableHead className="text-neutral-600 font-medium">
                    Customer Name
                  </TableHead>
                  <TableHead className="text-neutral-600 font-medium">
                    Email
                  </TableHead>
                  <TableHead className="text-neutral-600 font-medium">
                    Phone
                  </TableHead>
                  <TableHead className="text-neutral-600 font-medium">
                    Address
                  </TableHead>
                  <TableHead className="text-neutral-600 font-medium">
                    City, State, ZIP
                  </TableHead>
                  <TableHead className="text-neutral-600 font-medium">
                    Join Date
                  </TableHead>
                  <TableHead className="text-neutral-600 font-medium text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    variants={itemVariants}
                    className="border-neutral-100 hover:bg-neutral-50 transition-colors duration-200"
                  >
                    <TableCell className="py-4">
                      <div className="font-semibold text-neutral-900 text-sm">
                        {customer.name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-neutral-700">
                        {customer.email || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-neutral-700">
                        {customer.phone || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-neutral-700 max-w-[200px] truncate" title={customer.address}>
                        {customer.address || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-neutral-700">
                        {customer.city && customer.state && customer.zip
                          ? `${customer.city}, ${customer.state} ${customer.zip}`
                          : customer.city && customer.state
                          ? `${customer.city}, ${customer.state}`
                          : customer.zip || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-neutral-600">
                        {formatDate(customer.join_date)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex justify-end items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-neutral-100 cursor-pointer"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => handleEditCustomer(customer)}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onViewCustomer(customer.id, customer.name)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <EditCustomerModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          customer={editingCustomer}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default CustomersContainer;

