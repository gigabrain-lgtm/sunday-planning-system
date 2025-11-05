import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Upload, CheckCircle, FileText } from "lucide-react";
import { useLocation } from "wouter";

function useNavigate() {
  const [, setLocation] = useLocation();
  return setLocation;
}

export default function ClickUpReportUpload() {
  const navigate = useNavigate();
  
  const [reportText, setReportText] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);

  const parseMutation = trpc.okr.parseWeeklyReport.useMutation({
    onSuccess: (data) => {
      setParsedData(data.data);
      toast.success("Report parsed successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to parse: ${error.message}`);
    },
  });

  const handleParse = () => {
    if (!reportText.trim()) {
      toast.error("Please paste a report first");
      return;
    }
    
    parseMutation.mutate({
      reportText,
    });
  };

  const handleSaveAndContinue = () => {
    toast.success("Report saved! Redirecting to OKR dashboard...");
    setTimeout(() => {
      navigate('/okrs');
    }, 1000);
  };

  const sampleReport = `Weekly Meeting Report
Total Meetings: 26
Performance Metrics
Sales Hours This Week: 4.5 hours
Show Rate: 35% (9/26)
No Shows: 0 of 26
Cancelled: 5 of 26
Unknown Status: 12 of 26
Call Type Breakdown
Discovery Calls: 20
Second Meetings: 4
Pending Decisions: 1
Follow-up/Rebooks: 0
Scheduled Calls This Week
Total Scheduled: 36
Scheduled Call Breakdown
Discovery Calls: 29
Second Meetings: 6
Pending Decisions: 1
Follow-up/Rebooks: 0
Pipeline Analytics
Current Pipeline Health
Active Prospects: 22 total
Discovery Calls: 14
Second Meetings: 7
Pending Decisions: 1
Conversion Rates
Discovery → Second Meeting: 33%
Second Meeting → Pending Decision: 13%
Second Meeting → Closed Won: 0% (0/8)
Pending Decision → Closed Won: 0%
Overall Win Rate: 0% (0 won, 0 lost)
Deal Results This Period
Closed Won: 0 deals
Average Time to Close: 0 days
Revenue Generated: $0
Pending Revenue: $6,500
Lost Deals: 0
Unqualified/Not Fit: 3
Nurturing: 0`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
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
            📋 Upload ClickUp Weekly Report
          </h1>
          <p className="text-gray-600">
            Paste your weekly meeting report to automatically update OKR metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Paste Report Text
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReportText(sampleReport)}
                >
                  Load Sample
                </Button>
              </div>

              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Paste your ClickUp weekly meeting report here..."
                rows={20}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              />

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleParse}
                  disabled={parseMutation.isPending || !reportText.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {parseMutation.isPending ? (
                    <>Parsing...</>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Parse Report
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setReportText('');
                    setParsedData(null);
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Parsed Results */}
          <div className="space-y-4">
            {!parsedData ? (
              <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Parsed metrics will appear here
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Paste your report and click "Parse Report"
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border-2 border-green-200 p-6">
                <div className="flex items-center gap-2 mb-4 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Successfully Parsed!</h3>
                </div>

                <div className="space-y-6">
                  {/* Sales Activity */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Sales Activity</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-blue-600">Total Meetings</p>
                        <p className="text-2xl font-bold text-blue-900">{parsedData.totalMeetings}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-blue-600">Show Rate</p>
                        <p className="text-2xl font-bold text-blue-900">{parsedData.showRate}%</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-xs text-purple-600">Discovery Calls</p>
                        <p className="text-2xl font-bold text-purple-900">{parsedData.discoveryCalls}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-xs text-purple-600">Second Meetings</p>
                        <p className="text-2xl font-bold text-purple-900">{parsedData.secondMeetings}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pipeline Health */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Pipeline Health</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-green-600">Active Prospects</p>
                        <p className="text-2xl font-bold text-green-900">{parsedData.activeProspects}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-green-600">Closed Won</p>
                        <p className="text-2xl font-bold text-green-900">{parsedData.closedWon}</p>
                      </div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Revenue</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-xs text-yellow-600">Generated</p>
                        <p className="text-2xl font-bold text-yellow-900">${parsedData.revenueGenerated.toLocaleString()}</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-xs text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">${parsedData.pendingRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Rates */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Conversion Rates</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Discovery → Second</span>
                        <span className="font-bold text-gray-900">{parsedData.conversionDiscoveryToSecond}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Second → Close</span>
                        <span className="font-bold text-gray-900">{parsedData.conversionSecondToClose}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleSaveAndContinue}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save & View OKR Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📖 How to Use</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Copy your weekly meeting report from ClickUp</li>
            <li>Paste it into the text area on the left</li>
            <li>Click "Parse Report" to extract the metrics</li>
            <li>Review the parsed data on the right</li>
            <li>Click "Save & View OKR Dashboard" to update your OKRs</li>
          </ol>
          <p className="text-xs text-blue-600 mt-4">
            💡 Tip: You can click "Load Sample" to see an example report and test the parser
          </p>
        </div>
      </div>
    </div>
  );
}
