import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, RefreshCw, Moon, TrendingUp, TrendingDown, Award, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SleepReview() {
  const weeklySummary = trpc.sleep.getWeeklySummary.useQuery();
  const fetchData = trpc.sleep.fetchData.useMutation({
    onSuccess: () => {
      toast.success("Sleep data updated successfully!");
      weeklySummary.refetch();
    },
    onError: (error) => {
      toast.error(`Failed to fetch data: ${error.message}`);
    },
  });

  const handleRefreshData = () => {
    fetchData.mutate();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "😊";
    return "😴";
  };

  if (weeklySummary.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!weeklySummary.data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🌙 Sleep Review</CardTitle>
            <CardDescription>
              Track and review your weekly sleep data from Eight Sleep
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No sleep data available yet. Click the button below to fetch your sleep data from Eight Sleep.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={handleRefreshData}
              disabled={fetchData.isPending}
              size="lg"
              className="w-full"
            >
              {fetchData.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching Sleep Data...
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Fetch Sleep Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { averageScore, averageDuration, averageLight, averageDeep, averageRem, averageAwake, totalNights, bestNight, worstNight, sessions } = weeklySummary.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>🌙 Sleep Review</CardTitle>
            <CardDescription>
              Last {totalNights} nights • Average Score: {averageScore}/100 {getScoreEmoji(averageScore)}
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

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              icon={<Award className="w-5 h-5" />}
              label="Average Sleep Score"
              value={`${averageScore}/100`}
              color={getScoreColor(averageScore)}
            />
            <SummaryCard
              icon={<Moon className="w-5 h-5" />}
              label="Average Sleep Duration"
              value={formatDuration(averageDuration)}
            />
            <SummaryCard
              label="Total Nights Tracked"
              value={totalNights.toString()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sleep Stages Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep Stages (Average per Night)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StageCard
              label="Light Sleep"
              value={formatDuration(averageLight)}
              color="bg-blue-50 border-blue-200"
            />
            <StageCard
              label="Deep Sleep"
              value={formatDuration(averageDeep)}
              color="bg-indigo-50 border-indigo-200"
            />
            <StageCard
              label="REM Sleep"
              value={formatDuration(averageRem)}
              color="bg-purple-50 border-purple-200"
            />
            <StageCard
              label="Awake Time"
              value={formatDuration(averageAwake)}
              color="bg-gray-50 border-gray-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Best & Worst Nights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Best Night
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {new Date(bestNight.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-3xl font-bold text-green-600">{bestNight.score}/100</p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(bestNight.duration)} of sleep
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Worst Night
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {new Date(worstNight.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-3xl font-bold text-red-600">{worstNight.score}/100</p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(worstNight.duration)} of sleep
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Nights */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Nights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {new Date(session.sessionDate).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-2xl font-bold ${getScoreColor(session.sleepScore || 0)}`}>
                        {session.sleepScore}
                      </span>
                      <span className="text-sm text-muted-foreground">/ 100</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(session.sleepDuration || 0)} total sleep
                    </p>
                  </div>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  <p>💡 {formatDuration(session.lightSleepMinutes || 0)}</p>
                  <p>🌊 {formatDuration(session.deepSleepMinutes || 0)}</p>
                  <p>💭 {formatDuration(session.remSleepMinutes || 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="p-4 rounded-lg border bg-white">
      {icon && <div className="mb-2">{icon}</div>}
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color || ""}`}>{value}</p>
    </div>
  );
}

function StageCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-lg border ${color}`}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
