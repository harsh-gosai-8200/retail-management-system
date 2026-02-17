import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import {
  History as HistoryIcon,
  Eye,
  Filter,
  Download,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { mockOrders, mockPayments, type Order } from "~/lib/mock-data/wholesaler";

export default function HistoryPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [payments] = useState(mockPayments);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRetailer, setFilterRetailer] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getPaymentStatus = (orderId: string) => {
    const payment = payments.find((p) => p.orderId === orderId);
    if (!payment) return { status: "unpaid", color: "bg-slate-100 text-slate-800 border-slate-200" };

    if (payment.status === "completed") {
      return { status: "paid", color: "bg-green-100 text-green-800 border-green-200" };
    } else if (payment.status === "pending") {
      return { status: "pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    } else {
      return { status: "failed", color: "bg-red-100 text-red-800 border-red-200" };
    }
  };

  // Get unique retailers for filter
  const uniqueRetailers = Array.from(
    new Set(orders.map((order) => order.retailerName))
  ).sort();

  // Apply all filters
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (filterStatus !== "all" && order.status !== filterStatus) return false;

    // Retailer filter
    if (filterRetailer !== "all" && order.retailerName !== filterRetailer)
      return false;

    // Date range filter
    if (dateFrom && new Date(order.orderDate) < new Date(dateFrom)) return false;
    if (dateTo && new Date(order.orderDate) > new Date(dateTo)) return false;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(search) ||
        order.retailerName.toLowerCase().includes(search) ||
        order.items.some((item) =>
          item.productName.toLowerCase().includes(search)
        )
      );
    }

    return true;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleExportHistory = () => {
    // In a real application, this would export to CSV/Excel
    const csvContent = [
      ["Order ID", "Retailer", "Date", "Amount", "Status", "Payment Status"],
      ...filteredOrders.map((order) => [
        order.id,
        order.retailerName,
        order.orderDate,
        order.totalAmount,
        order.status,
        getPaymentStatus(order.id).status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const historyStats = {
    totalOrders: filteredOrders.length,
    completedOrders: filteredOrders.filter((o) => o.status === "completed").length,
    totalRevenue: filteredOrders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0),
    averageOrderValue:
      filteredOrders.length > 0
        ? filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0) /
          filteredOrders.length
        : 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order History</h1>
          <p className="text-slate-600 mt-1">
            Complete record of all orders and transactions
          </p>
        </div>
        <Button
          onClick={handleExportHistory}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Orders
            </CardTitle>
            <HistoryIcon className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {historyStats.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Completed
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {historyStats.completedOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              ₹{historyStats.totalRevenue.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Avg Order Value
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              ₹{Math.round(historyStats.averageOrderValue).toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Search
              </label>
              <Input
                placeholder="Order ID, retailer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Status
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Retailer Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Retailer
              </label>
              <Select value={filterRetailer} onValueChange={setFilterRetailer}>
                <SelectTrigger>
                  <SelectValue placeholder="All retailers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Retailers</SelectItem>
                  {uniqueRetailers.map((retailer) => (
                    <SelectItem key={retailer} value={retailer}>
                      {retailer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                From Date
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                To Date
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(filterStatus !== "all" ||
            filterRetailer !== "all" ||
            dateFrom ||
            dateTo ||
            searchTerm) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterStatus("all");
                  setFilterRetailer("all");
                  setDateFrom("");
                  setDateTo("");
                  setSearchTerm("");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">
            Order History ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Retailer</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-slate-500 py-8"
                    >
                      No orders found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const paymentStatus = getPaymentStatus(order.id);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell className="font-semibold">
                          {order.retailerName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(order.orderDate).toLocaleDateString("en-IN")}
                          </div>
                        </TableCell>
                        <TableCell>{order.items.length} items</TableCell>
                        <TableCell className="font-semibold">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(order.status)}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={paymentStatus.color}
                          >
                            {paymentStatus.status.charAt(0).toUpperCase() +
                              paymentStatus.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Complete order and payment information
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Retailer Name</p>
                  <p className="font-semibold">{selectedOrder.retailerName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Order Date</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.orderDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Order Status</p>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedOrder.status)}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Payment Status</p>
                  <Badge
                    variant="outline"
                    className={getPaymentStatus(selectedOrder.id).color}
                  >
                    {getPaymentStatus(selectedOrder.id).status.charAt(0).toUpperCase() +
                      getPaymentStatus(selectedOrder.id).status.slice(1)}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="font-semibold text-2xl text-blue-900">
                    ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Order Items</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price.toLocaleString("en-IN")}</TableCell>
                          <TableCell className="font-semibold">
                            ₹{item.total.toLocaleString("en-IN")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Payment Information */}
              {payments.find((p) => p.orderId === selectedOrder.id) && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Payment Information</h3>
                  {(() => {
                    const payment = payments.find((p) => p.orderId === selectedOrder.id);
                    if (!payment) return null;
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Payment ID</p>
                          <p className="font-medium">{payment.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Payment Mode</p>
                          <p className="font-medium">
                            {payment.paymentMode.replace("_", " ").toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Payment Date</p>
                          <p className="font-medium">
                            {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                        {payment.transactionId && (
                          <div>
                            <p className="text-sm text-slate-600">Transaction ID</p>
                            <p className="font-medium">{payment.transactionId}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Notes</p>
                  <p className="text-sm bg-slate-50 p-3 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
