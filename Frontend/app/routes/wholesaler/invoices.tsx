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
import { Badge } from "~/components/ui/badge";
import { FileText, Download, Eye, Printer } from "lucide-react";
import { mockInvoices, type Invoice } from "~/lib/mock-data/wholesaler";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // In a real application, this would generate and download a PDF
    toast.success(`Invoice ${invoice.invoiceNumber} downloaded successfully!`);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // In a real application, this would open the print dialog
    toast.success(`Preparing invoice ${invoice.invoiceNumber} for printing...`);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.retailerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInvoiceAmount = invoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Invoice Management</h1>
        <p className="text-slate-600 mt-1">
          View and manage all generated invoices
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Invoices
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {invoices.length}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Invoice Amount
            </CardTitle>
            <FileText className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              ₹{totalInvoiceAmount.toLocaleString("en-IN")}
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Including all taxes and charges
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              All Invoices
            </CardTitle>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Retailer</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-slate-500 py-8"
                    >
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.invoiceNumber}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {invoice.orderId}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {invoice.retailerName}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.invoiceDate).toLocaleDateString(
                          "en-IN"
                        )}
                      </TableCell>
                      <TableCell>
                        ₹{invoice.subtotal.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        ₹{invoice.tax.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="font-semibold text-lg">
                        ₹{invoice.totalAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewInvoice(invoice)}
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePrintInvoice(invoice)}
                            title="Print Invoice"
                          >
                            <Printer className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4 text-emerald-600" />
                          </Button>
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

      {/* View Invoice Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Complete invoice information
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Preview - Professional Format */}
              <div className="bg-white border-2 border-slate-200 rounded-lg p-8 space-y-6">
                {/* Header */}
                <div className="border-b-2 border-slate-300 pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-bold text-blue-900">
                        INVOICE
                      </h2>
                      <p className="text-slate-600 mt-2">
                        {selectedInvoice.wholesalerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedInvoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Date:{" "}
                        {new Date(
                          selectedInvoice.invoiceDate
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* From & To Section */}
                <div className="grid grid-cols-2 gap-8">
                  {/* From */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                      From (Wholesaler)
                    </h3>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {selectedInvoice.wholesalerName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedInvoice.wholesalerAddress}
                      </p>
                      {selectedInvoice.wholesalerGST && (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">GST:</span>{" "}
                          {selectedInvoice.wholesalerGST}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* To */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">
                      To (Retailer)
                    </h3>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {selectedInvoice.retailerName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedInvoice.retailerAddress}
                      </p>
                      {selectedInvoice.retailerGST && (
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">GST:</span>{" "}
                          {selectedInvoice.retailerGST}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Reference */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Order Reference:</span>{" "}
                    {selectedInvoice.orderId}
                  </p>
                </div>

                {/* Items Table */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Invoice Items
                  </h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">
                            Product
                          </th>
                          <th className="text-center px-4 py-3 text-sm font-semibold text-slate-700">
                            Quantity
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">
                            Price
                          </th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-slate-900">
                              {item.productName}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-700">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-700">
                              ₹{item.price.toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-900">
                              ₹{item.total.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-semibold text-slate-900">
                        ₹{selectedInvoice.subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-600">Tax (GST 12%):</span>
                      <span className="font-semibold text-slate-900">
                        ₹{selectedInvoice.tax.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="border-t-2 border-slate-300 pt-3 flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-blue-900">
                        ₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="border-t-2 border-slate-300 pt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Thank you for your business!
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    This is a computer-generated invoice and does not require a
                    signature.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialogOpen(false)}
            >
              Close
            </Button>
            {selectedInvoice && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
