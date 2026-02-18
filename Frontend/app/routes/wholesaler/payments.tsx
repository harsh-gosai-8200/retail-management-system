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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Wallet,
} from "lucide-react";
import {
  mockPayments,
  mockOrders,
  type Payment,
  type Order,
} from "~/lib/mock-data/wholesaler";
import { paymentSchema, type PaymentFormData } from "~/lib/schemas/wholesaler";
import { toast } from "sonner";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [orders] = useState<Order[]>(mockOrders);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      orderId: "",
      retailerName: "",
      amount: 0,
      paymentMode: "cash" as const,
      transactionId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      status: "completed" as const,
      notes: "",
    },
  });

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getPaymentModeIcon = (mode: Payment["paymentMode"]) => {
    switch (mode) {
      case "cash":
        return "💵";
      case "upi":
        return "📱";
      case "bank_transfer":
        return "🏦";
      case "cheque":
        return "📝";
      default:
        return "💳";
    }
  };

  const getPaymentModeLabel = (mode: Payment["paymentMode"]) => {
    switch (mode) {
      case "cash":
        return "Cash";
      case "upi":
        return "UPI";
      case "bank_transfer":
        return "Bank Transfer";
      case "cheque":
        return "Cheque";
      default:
        return mode;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filterStatus === "all") return true;
    return payment.status === filterStatus;
  });

  // Get approved orders that don't have completed payments yet
  const pendingPaymentOrders = orders.filter((order) => {
    const hasCompletedPayment = payments.some(
      (payment) =>
        payment.orderId === order.id && payment.status === "completed",
    );
    return (
      (order.status === "approved" || order.status === "completed") &&
      !hasCompletedPayment
    );
  });

  const handleConfirmPayment = (order: Order) => {
    setSelectedOrder(order);
    form.reset({
      orderId: order.id,
      retailerName: order.retailerName,
      amount: order.totalAmount,
      paymentMode: "cash",
      transactionId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      status: "completed",
      notes: "",
    });
    setConfirmDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    const newPayment: Payment = {
      id: `PAY${String(payments.length + 1).padStart(3, "0")}`,
      orderId: data.orderId,
      retailerName: data.retailerName,
      amount: data.amount,
      paymentMode: data.paymentMode,
      transactionId: data.transactionId || undefined,
      paymentDate: data.paymentDate,
      status: data.status,
      notes: data.notes || undefined,
    };

    setPayments((prev) => [...prev, newPayment]);
    toast.success("Payment confirmed successfully!");
    setConfirmDialogOpen(false);
    setSelectedOrder(null);
  };

  const paymentStats = {
    total: payments.length,
    pending: payments.filter((p) => p.status === "pending").length,
    completed: payments.filter((p) => p.status === "completed").length,
    totalAmount: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Payment Management
        </h1>
        <p className="text-slate-600 mt-1">
          Track and manage payments from retailers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Payments
            </CardTitle>
            <CreditCard className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {paymentStats.total}
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
              {paymentStats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Completed
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {paymentStats.completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Received
            </CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              ₹{paymentStats.totalAmount.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payment Orders */}
      {pendingPaymentOrders.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-yellow-600" />
              Orders Awaiting Payment Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Retailer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPaymentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.retailerName}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {new Date(order.orderDate).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleConfirmPayment(order)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          onClick={() => setFilterStatus("all")}
        >
          All Payments
        </Button>
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          onClick={() => setFilterStatus("pending")}
        >
          Pending
        </Button>
        <Button
          variant={filterStatus === "completed" ? "default" : "outline"}
          onClick={() => setFilterStatus("completed")}
        >
          Completed
        </Button>
        <Button
          variant={filterStatus === "failed" ? "default" : "outline"}
          onClick={() => setFilterStatus("failed")}
        >
          Failed
        </Button>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Retailer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-slate-500 py-8"
                    >
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.orderId}
                      </TableCell>
                      <TableCell>{payment.retailerName}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getPaymentModeIcon(payment.paymentMode)}</span>
                          <span>
                            {getPaymentModeLabel(payment.paymentMode)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {payment.transactionId || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(payment.status)}
                        >
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Payment Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Record payment details for Order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order ID</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="retailerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Retailer Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value as number}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Mode *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">💵 Cash</SelectItem>
                          <SelectItem value="upi">📱 UPI</SelectItem>
                          <SelectItem value="bank_transfer">
                            🏦 Bank Transfer
                          </SelectItem>
                          <SelectItem value="cheque">📝 Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter transaction/reference ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this payment..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Summary */}
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-lg">Payment Amount:</p>
                  <p className="font-bold text-2xl text-emerald-900">
                    ₹{(form.watch("amount") as number).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setConfirmDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
