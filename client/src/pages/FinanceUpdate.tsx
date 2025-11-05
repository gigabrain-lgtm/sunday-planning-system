import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save, DollarSign, Calendar, PieChart } from "lucide-react";
import { useLocation } from "wouter";

function useNavigate() {
  const [, setLocation] = useLocation();
  return setLocation;
}

export default function FinanceUpdate() {
  const navigate = useNavigate();
  
  // Get current month (first day)
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const [month] = useState(getCurrentMonth());
  const [newMRR, setNewMRR] = useState<number | ''>('');
  const [churnedMRR, setChurnedMRR] = useState<number | ''>('');
  const [monthEndCloseDays, setMonthEndCloseDays] = useState<number | ''>('');
  const [expenseTrackingCoverage, setExpenseTrackingCoverage] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Fetch latest finance update
  const { data: latestUpdate } = trpc.okr.getLatestFinanceUpdate.useQuery();

  const submitMutation = trpc.okr.submitFinanceUpdate.useMutation({
    onSuccess: () => {
      toast.success("Finance metrics updated successfully!");
      navigate('/okrs');
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    submitMutation.mutate({
      month,
      newMRR: newMRR === '' ? undefined : Number(newMRR),
      churnedMRR: churnedMRR === '' ? undefined : Number(churnedMRR),
      monthEndCloseDays: monthEndCloseDays === '' ? undefined : Number(monthEndCloseDays),
      expenseTrackingCoverage: expenseTrackingCoverage === '' ? undefined : Number(expenseTrackingCoverage),
      notes: notes || undefined,
    });
  };

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const calculateNetMRR = () => {
    const newVal = newMRR === '' ? 0 : Number(newMRR);
    const churnVal = churnedMRR === '' ? 0 : Number(churnedMRR);
    return newVal - churnVal;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/okrs')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to OKRs
          </Button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💰 Financial Metrics Update
          </h1>
          <p className="text-gray-600">
            {formatMonth(month)}
          </p>
        </div>

        {/* Previous Month Summary (if available) */}
        {latestUpdate && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-900 mb-2">
              📊 Previous Month Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-green-600">New MRR</p>
                <p className="text-2xl font-bold text-green-900">${latestUpdate.newMRR?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-green-600">Churned MRR</p>
                <p className="text-2xl font-bold text-green-900">${latestUpdate.churnedMRR?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-green-600">Close Days</p>
                <p className="text-2xl font-bold text-green-900">{latestUpdate.monthEndCloseDays || 'N/A'}</p>
              </div>
              <div>
                <p className="text-green-600">Expense Coverage</p>
                <p className="text-2xl font-bold text-green-900">{latestUpdate.expenseTrackingCoverage || 0}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* KR 1.1: Monthly Recurring Revenue */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">KR 1.1: Monthly Recurring Revenue</h3>
                <p className="text-sm text-gray-600">Target: $250,000</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New MRR This Month ($)
                </label>
                <input
                  type="number"
                  value={newMRR}
                  onChange={(e) => setNewMRR(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter new recurring revenue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Revenue from new clients or upgrades
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Churned MRR This Month ($)
                </label>
                <input
                  type="number"
                  value={churnedMRR}
                  onChange={(e) => setChurnedMRR(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter lost recurring revenue"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Revenue lost from cancellations or downgrades
                </p>
              </div>

              {/* Net MRR Calculation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-900">Net New MRR:</span>
                  <span className={`text-2xl font-bold ${calculateNetMRR() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${calculateNetMRR().toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Calculated automatically: New MRR - Churned MRR
                </p>
              </div>
            </div>
          </div>

          {/* KR 2.3: Month-End Close Time */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold">KR 2.3: Financial Month-End Close</h3>
                <p className="text-sm text-gray-600">Target: &lt;5 business days</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days to Close Last Month
                </label>
                <input
                  type="number"
                  value={monthEndCloseDays}
                  onChange={(e) => setMonthEndCloseDays(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter number of days"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Business days from month-end to final P&L delivery
                </p>
              </div>
            </div>
          </div>

          {/* KR 2.4: Expense Tracking Coverage */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">KR 2.4: Expense Tracking Coverage</h3>
                <p className="text-sm text-gray-600">Target: 100% automated</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Tracking Coverage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={expenseTrackingCoverage}
                  onChange={(e) => setExpenseTrackingCoverage(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter percentage"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Percentage of expenses automatically categorized
                </p>
              </div>

              {/* Progress Bar */}
              {expenseTrackingCoverage !== '' && (
                <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      Number(expenseTrackingCoverage) >= 80 ? 'bg-green-500' :
                      Number(expenseTrackingCoverage) >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(Number(expenseTrackingCoverage), 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any blockers, improvements, or context..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/okrs')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Updates
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
