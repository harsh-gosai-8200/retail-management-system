import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  Clock,
  ShoppingCart,
  Package,
} from "lucide-react";
import {
  mockOrders,
  type Order,
  type OrderItem,
} from "~/lib/mock-data/wholesaler";
import {
  modifyOrderSchema,
  type ModifyOrderFormData,
} from "~/lib/schemas/wholesaler";
import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(modifyOrderSchema),
    defaultValues: {
      orderId: "",
      items: [],
      reason: "",
    },
  });

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

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleModifyOrder = (order: Order) => {
    setSelectedOrder(order);
    form.reset({
      orderId: order.id,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      reason: "",
    });
    setModifyDialogOpen(true);
  };

  const onModifySubmit = (data: any) => {
    if (!selectedOrder) return;

    const updatedItems: OrderItem[] = data.items.map((item: any) => ({
      ...item,
      total: item.quantity * item.price,
    }));

    const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);

    setOrders((prev) =>
      prev.map((order) =>
        order.id === data.orderId
          ? {
              ...order,
              items: updatedItems,
              totalAmount,
              notes: data.reason,
            }
          : order,
      ),
    );

    toast.success("Order modified successfully!");
    setModifyDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleActionClick = (orderId: string, action: "approve" | "reject") => {
    setActionOrderId(orderId);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    if (!actionOrderId || !actionType) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === actionOrderId
          ? {
              ...order,
              status: actionType === "approve" ? "approved" : "rejected",
            }
          : order,
      ),
    );

    toast.success(
      `Order ${actionType === "approve" ? "approved" : "rejected"} successfully!`,
    );
    setActionDialogOpen(false);
    setActionOrderId(null);
    setActionType(null);
  };

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    approved: orders.filter((o) => o.status === "approved").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Order Management</h1>
        <p className="text-slate-600 mt-1">
          Review and manage incoming orders from retailers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {orderStats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {orderStats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Approved
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {orderStats.approved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Completed
            </CardTitle>
            <Package className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {orderStats.completed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          onClick={() => setFilterStatus("all")}
        >
          All Orders
        </Button>
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          onClick={() => setFilterStatus("pending")}
        >
          Pending
        </Button>
        <Button
          variant={filterStatus === "approved" ? "default" : "outline"}
          onClick={() => setFilterStatus("approved")}
        >
          Approved
        </Button>
        <Button
          variant={filterStatus === "completed" ? "default" : "outline"}
          onClick={() => setFilterStatus("completed")}
        >
          Completed
        </Button>
        <Button
          variant={filterStatus === "rejected" ? "default" : "outline"}
          onClick={() => setFilterStatus("rejected")}
        >
          Rejected
        </Button>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">
            Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Retailer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-slate-500 py-8"
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell className="font-semibold">
                        {order.retailerName}
                      </TableCell>
                      <TableCell>{order.items.length} items</TableCell>
                      <TableCell className="font-semibold">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleDateString("en-IN")}
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-slate-600" />
                          </Button>
                          {order.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleModifyOrder(order)}
                                title="Modify Order"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleActionClick(order.id, "approve")
                                }
                                title="Approve Order"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleActionClick(order.id, "reject")
                                }
                                title="Reject Order"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
              Complete information about this order
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
                    {new Date(selectedOrder.orderDate).toLocaleDateString(
                      "en-IN",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <Badge
                    variant="outline"
                    className={getStatusColor(selectedOrder.status)}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Amount</p>
                  <p className="font-semibold text-lg">
                    ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Order Items</h3>
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
                        <TableCell>
                          ₹{item.price.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{item.total.toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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

      {/* Modify Order Dialog */}
      <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modify Order - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Adjust quantities or remove items from the order
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onModifySubmit)}
              className="space-y-6"
            >
              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">Order Items</h3>
                {form.watch("items").map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-end mb-4 p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="col-span-5">
                      <p className="text-sm text-slate-600">Product</p>
                      <p className="font-medium">{item.productName}</p>
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                value={field.value as number}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-4">
                      <p className="text-sm text-slate-600">Total</p>
                      <p className="font-semibold">
                        ₹
                        {(
                          (item.quantity as number) * (item.price as number)
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Modification *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why you're modifying this order..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total Amount */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">Updated Total Amount:</p>
                  <p className="font-bold text-2xl text-blue-900">
                    ₹
                    {form
                      .watch("items")
                      .reduce(
                        (sum, item: any) =>
                          sum +
                          (item.quantity as number) * (item.price as number),
                        0,
                      )
                      .toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModifyDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Save Modifications
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Approve Order?" : "Reject Order?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "This will approve the order and move it to the processing stage. The retailer will be notified."
                : "This will reject the order. The retailer will be notified about the rejection."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
