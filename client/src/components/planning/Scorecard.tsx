import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, RefreshCw, Link2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Scorecard() {
  const [isConnecting, setIsConnecting] = useState(false);
  
  const connectionStatus = trpc.microsoft.getConnectionStatus.useQuery();
  const getAuthUrl = trpc.microsoft.getAuthUrl.useQuery();
  const fetchData = trpc.scorecard.fetchData.useMutation({
    onSuccess: () => {
      toast.success("Scorecard data updated successfully!");
      latestData.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to fetch data: ${error.message}`);
    },
  });
  const latestData = trpc.scorecard.getLatest.useQuery();

  const handleConnectOneDrive = () => {
    if (getAuthUrl.data?.url) {
      setIsConnecting(true);
      window.location.href = getAuthUrl.data.url;
    }
  };

  const handleRefreshData = () => {
    fetchData.mutate();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (!connectionStatus.data?.connected) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>📊 Scorecard Dashboard</CardTitle>
            <CardDescription>
              Connect your OneDrive to automatically sync your GigaBrands P&L and display real-time metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Link2 className="h-4 w-4" />
              <AlertDescription>
                To view your scorecard, you need to connect your OneDrive account. This will allow the system to read your "GigaBrands PNL" Excel file.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={handleConnectOneDrive}
              disabled={isConnecting || !getAuthUrl.data}
              size="lg"
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect OneDrive
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>📊 Scorecard Dashboard</CardTitle>
            <CardDescription>
              {latestData.data?.month || "Loading..."} • Last updated: {latestData.data?.fetchedAt ? new Date(latestData.data.fetchedAt).toLocaleString() : "Never"}
            </CardDescription>
          </div>
          <Button
            onClick={handleRefreshData}
            disabled={fetchData.isPending}
            variant="outline"
          >
            {fetchData.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </>
            )}
          </Button>
        </CardHeader>
      </Card>

      {latestData.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !latestData.data ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No scorecard data available yet.</p>
              <Button onClick={handleRefreshData} disabled={fetchData.isPending}>
                Fetch Latest Data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Net Profit"
                  value={formatCurrency(latestData.data.overall.netProfit)}
                  trend="positive"
                />
                <MetricCard
                  label="Churn Rate (#)"
                  value={formatPercent(latestData.data.overall.churnRateNumber)}
                  trend={latestData.data.overall.churnRateNumber > 5 ? "negative" : "neutral"}
                />
                <MetricCard
                  label="Churn Rate ($)"
                  value={formatPercent(latestData.data.overall.churnRateDollar)}
                  trend={latestData.data.overall.churnRateDollar > 5 ? "negative" : "neutral"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Marketing Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Email Leads"
                  value={latestData.data.marketing.qualifiedLeadsEmail.toString()}
                />
                <MetricCard
                  label="MQL (Ads)"
                  value={latestData.data.marketing.qualifiedLeadsMQL.toString()}
                />
                <MetricCard
                  label="SQL (Ads)"
                  value={latestData.data.marketing.qualifiedLeadsSQL.toString()}
                />
                <MetricCard
                  label="Total Leads"
                  value={latestData.data.marketing.totalLeads.toString()}
                  trend="positive"
                />
                <MetricCard
                  label="Ad Spend"
                  value={formatCurrency(latestData.data.marketing.adSpend)}
                />
                <MetricCard
                  label="Cost Per Lead"
                  value={formatCurrency(latestData.data.marketing.costPerLead)}
                  trend={latestData.data.marketing.costPerLead < 150 ? "positive" : "neutral"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sales Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Net MRR"
                  value={formatCurrency(latestData.data.sales.netMRR)}
                  trend="positive"
                />
                <MetricCard
                  label="New MRR Cash"
                  value={formatCurrency(latestData.data.sales.newMRRCashCollected)}
                />
                <MetricCard
                  label="New MRR Closed"
                  value={formatCurrency(latestData.data.sales.newMRRClosed)}
                />
                <MetricCard
                  label="One-Time Service"
                  value={formatCurrency(latestData.data.sales.newOneTimeServiceCash)}
                />
                <MetricCard
                  label="Closed Deals"
                  value={latestData.data.sales.closedDeals.toString()}
                  trend="positive"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Fulfillment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Revenue per Strategist"
                  value={formatCurrency(latestData.data.fulfillment.revenuePerStrategist)}
                  trend="positive"
                />
                <MetricCard
                  label="Effective Churn $"
                  value={formatCurrency(latestData.data.fulfillment.effectiveChurnDollar)}
                  trend="negative"
                />
                <MetricCard
                  label="Notified Churn $"
                  value={formatCurrency(latestData.data.fulfillment.notifiedChurnDollar)}
                  trend="negative"
                />
                <MetricCard
                  label="Effective Churn %"
                  value={formatPercent(latestData.data.fulfillment.effectiveChurnRateNumber)}
                  trend={latestData.data.fulfillment.effectiveChurnRateNumber > 5 ? "negative" : "neutral"}
                />
                <MetricCard
                  label="Notified Churn (#)"
                  value={latestData.data.fulfillment.notifiedChurnNumber.toString()}
                  trend="negative"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sales Projection */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  label="Target Revenue (Jan 2026)"
                  value={formatCurrency(latestData.data.salesProjection.targetRevenue)}
                  trend="positive"
                />
                <MetricCard
                  label="New Clients Needed"
                  value={latestData.data.salesProjection.newClientsNeeded.toString()}
                />
                <MetricCard
                  label="Expected Churn"
                  value={latestData.data.salesProjection.clientsChurn.toString()}
                  trend="negative"
                />
                <MetricCard
                  label="Qualified Meetings Required"
                  value={latestData.data.salesProjection.qualifiedMeetingsRequired.toString()}
                />
                <MetricCard
                  label="Conversion Rate"
                  value={formatPercent(latestData.data.salesProjection.conversionRate * 100)}
                />
                <MetricCard
                  label="Avg Sale Value"
                  value={formatCurrency(latestData.data.salesProjection.averageSaleValue)}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: "positive" | "negative" | "neutral";
}) {
  const trendColors = {
    positive: "bg-green-50 border-green-200",
    negative: "bg-red-50 border-red-200",
    neutral: "bg-gray-50 border-gray-200",
  };

  return (
    <div className={`p-4 rounded-lg border ${trend ? trendColors[trend] : "bg-white border-gray-200"}`}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
