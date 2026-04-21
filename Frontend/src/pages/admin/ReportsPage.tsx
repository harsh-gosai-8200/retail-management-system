import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Loader2,
  TrendingUp,
  Users,
  IndianRupee,
  PieChart,
  BarChart3,
  Printer,
  FileSpreadsheet
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { Button } from '../../components/ui/button';
import { AdminStatsCard } from '../../components/admin/AdminStatsCard';

export function AdminReportsPage() {
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesEndDate, setSalesEndDate] = useState('');
  const [userStartDate, setUserStartDate] = useState('');
  const [userEndDate, setUserEndDate] = useState('');
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [userReport, setUserReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'users'>('sales');

  const handleSalesReport = async () => {
    if (!salesStartDate || !salesEndDate) {
      setError('Please select both start and end dates');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoadingSales(true);
    try {
      const data = await reportService.getSalesReport(salesStartDate, salesEndDate);
      setSalesReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleUserReport = async () => {
    if (!userStartDate || !userEndDate) {
      setError('Please select both start and end dates');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoadingUser(true);
    try {
      const data = await reportService.getUserReport(userStartDate, userEndDate);
      setUserReport(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleExport = async (type: 'sales' | 'users', format: 'xlsx' | 'pdf') => {
    try {
      let blob;
      if (type === 'sales') {
        if (format === 'xlsx') {
          blob = await reportService.exportSalesReportExcel(salesStartDate, salesEndDate);
        } else {
          blob = await reportService.exportSalesReportPDF(salesStartDate, salesEndDate);
        }
      } else {
        if (format === 'xlsx') {
          blob = await reportService.exportUserReportExcel(userStartDate, userEndDate);
        } else {
          blob = await reportService.exportUserReportPDF(userStartDate, userEndDate);
        }
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${type === 'sales' ? salesStartDate : userStartDate}_to_${type === 'sales' ? salesEndDate : userEndDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate and export sales and user reports
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'sales'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <TrendingUp className="inline h-4 w-4 mr-2" />
          Sales Report
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'users'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="inline h-4 w-4 mr-2" />
          User Report
        </button>
      </div>

      {/* Sales Report Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Report Controls */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-blue-50 p-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Generate Sales Report</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={salesStartDate}
                    onChange={(e) => setSalesStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={salesEndDate}
                    onChange={(e) => setSalesEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleSalesReport}
                disabled={loadingSales}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loadingSales ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                Generate Report
              </Button>
              
              {salesReport && (
                <>
                  <Button
                    onClick={() => handleExport('sales', 'xlsx')}
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Excel
                  </Button>
                  <Button
                    onClick={() => handleExport('sales', 'pdf')}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Printer className="h-4 w-4" />
                    Export PDF
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Sales Report Display */}
          {salesReport && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <AdminStatsCard
                  label="Total Revenue"
                  value={salesReport.totalRevenue}
                  icon={IndianRupee}
                  color="green"
                  prefix="₹"
                />
                <AdminStatsCard
                  label="Total Orders"
                  value={salesReport.totalOrders}
                  icon={TrendingUp}
                  color="blue"
                />
                <AdminStatsCard
                  label="Completed Orders"
                  value={salesReport.completedOrders}
                  icon={BarChart3}
                  color="green"
                />
                <AdminStatsCard
                  label="Cancelled Orders"
                  value={salesReport.cancelledOrders}
                  icon={BarChart3}
                  color="red"
                />
              </div>

              {/* Top Products */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Selling Products</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Product</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Quantity Sold</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {salesReport.topProducts.map((product:any, idx:number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900">{product.productName}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-600">{product.quantitySold}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-900">₹{product.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Sellers */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Spending Sellers</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Seller</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Shop</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Orders</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {salesReport.topSellers.map((seller:any, idx:number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900">{seller.sellerName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{seller.shopName}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-600">{seller.ordersCount}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-900">₹{seller.totalSpent.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Report Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Report Controls */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-green-50 p-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Generate User Report</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={userStartDate}
                    onChange={(e) => setUserStartDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={userEndDate}
                    onChange={(e) => setUserEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleUserReport}
                disabled={loadingUser}
                className="bg-green-600 hover:bg-green-700"
              >
                {loadingUser ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PieChart className="h-4 w-4" />
                )}
                Generate Report
              </Button>
              
              {userReport && (
                <>
                  <Button
                    onClick={() => handleExport('users', 'xlsx')}
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Excel
                  </Button>
                  <Button
                    onClick={() => handleExport('users', 'pdf')}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Printer className="h-4 w-4" />
                    Export PDF
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* User Report Display */}
          {userReport && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <AdminStatsCard
                  label="Total Users"
                  value={userReport.totalUsers}
                  icon={Users}
                  color="blue"
                />
                <AdminStatsCard
                  label="New Users"
                  value={userReport.newUsers}
                  icon={Users}
                  color="green"
                />
                <AdminStatsCard
                  label="Active Users"
                  value={userReport.activeUsers}
                  icon={Users}
                  color="green"
                />
                <AdminStatsCard
                  label="Inactive Users"
                  value={userReport.inactiveUsers}
                  icon={Users}
                  color="red"
                />
              </div>

              {/* Role Distribution */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Role Distribution</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Role</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Count</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {userReport.roleDistribution.map((role:any, idx:number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900">{role.role}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-600">{role.count}</td>
                          <td className="px-4 py-3 text-sm text-right text-slate-600">{role.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}