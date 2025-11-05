import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save, TrendingUp, Users, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

function useNavigate() {
  const [, setLocation] = useLocation();
  return setLocation;
}

export default function SalesUpdate() {
  const navigate = useNavigate();
  
  // Get current week Monday
  const getCurrentWeekMonday = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  };

  const [weekStartDate] = useState(getCurrentWeekMonday());
  const [qualifiedLeads, setQualifiedLeads] = useState<number | ''>('');
  const [lostClients, setLostClients] = useState<number | ''>('');
  const [churnReason, setChurnReason] = useState('');
  const [newDeals, setNewDeals] = useState<number | ''>('');
  const [newDealValue, setNewDealValue] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Fetch latest ClickUp report to pre-fill data
  const { data: latestReport } = trpc.okr.getLatestWeeklyReport.useQuery();

  const submitMutation = trpc.okr.submitSalesUpdate.useMutation({
    onSuccess: () => {
      toast.success("Sales metrics updated successfully!");
      navigate('/okrs');
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    submitMutation.mutate({
      weekStartDate,
      qualifiedLeads: qualifiedLeads === '' ? undefined : Number(qualifiedLeads),
      lostClients: lostClients === '' ? undefined : Number(lostClients),
      churnReason: churnReason || undefined,
      newDeals: newDeals === '' ? undefined : Number(newDeals),
      newDealValue: newDealValue === '' ? undefined : Number(newDealValue),
      notes: notes || undefined,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            📊 Sales Metrics Update
          </h1>
          <p className="text-gray-600">
            Week of {formatDate(weekStartDate)}
          </p>
        </div>

        {/* ClickUp Report Summary (if available) */}
        {latestReport && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 Latest ClickUp Report
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-600">Discovery Calls</p>
                <p className="text-2xl font-bold text-blue-900">{latestReport.discoveryCalls}</p>
              </div>
              <div>
                <p className="text-blue-600">Second Meetings</p>
                <p className="text-2xl font-bold text-blue-900">{latestReport.secondMeetings}</p>
              </div>
              <div>
                <p className="text-blue-600">Show Rate</p>
                <p className="text-2xl font-bold text-blue-900">{latestReport.showRate}%</p>
              </div>
              <div>
                <p className="text-blue-600">Closed Won</p>
                <p className="text-2xl font-bold text-blue-900">{latestReport.closedWon}</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Data auto-filled from ClickUp. You can adjust values below if needed.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* KR 1.2: Qualified Leads */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold">KR 1.2: Qualified Leads This Month</h3>
                <p className="text-sm text-gray-600">Target: 100 leads/month</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discovery Calls This Week
                </label>
                <input
                  type="number"
                  value={qualifiedLeads}
                  onChange={(e) => setQualifiedLeads(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={latestReport ? String(latestReport.discoveryCalls) : "Enter number"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {latestReport && `Auto-filled: ${latestReport.discoveryCalls} from ClickUp report`}
                </p>
              </div>
            </div>
          </div>

          {/* KR 1.3: Client Churn */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold">KR 1.3: Client Churn This Month</h3>
                <p className="text-sm text-gray-600">Target: &lt;5% monthly churn</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lost Clients This Week
                </label>
                <input
                  type="number"
                  value={lostClients}
                  onChange={(e) => setLostClients(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Churn Reason
                </label>
                <select
                  value={churnReason}
                  onChange={(e) => setChurnReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select reason (optional)</option>
                  <option value="price">Price too high</option>
                  <option value="service">Service quality issues</option>
                  <option value="competition">Switched to competitor</option>
                  <option value="business_closed">Business closed</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* New Deals Closed */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold">New Deals Closed This Week</h3>
                <p className="text-sm text-gray-600">Contributes to KR 1.1 (MRR)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Deals
                </label>
                <input
                  type="number"
                  value={newDeals}
                  onChange={(e) => setNewDeals(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={latestReport ? String(latestReport.closedWon) : "Enter number"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {latestReport && `Auto-filled: ${latestReport.closedWon} from ClickUp report`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Contract Value ($)
                </label>
                <input
                  type="number"
                  value={newDealValue}
                  onChange={(e) => setNewDealValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Enter total value"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
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
              placeholder="Any additional context, wins, or blockers..."
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
              className="bg-purple-600 hover:bg-purple-700"
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
