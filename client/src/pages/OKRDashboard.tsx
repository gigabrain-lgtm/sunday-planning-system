import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Upload,
  Edit,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

interface KeyResult {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  confidence: number;
  status: 'on-track' | 'at-risk' | 'off-track';
  dataSource: string;
  lastUpdated?: string;
}

interface Objective {
  id: string;
  name: string;
  keyResults: KeyResult[];
  expanded: boolean;
}

export default function OKRDashboard() {
  // Mock data for local testing
  const [objectives, setObjectives] = useState<Objective[]>([
    {
      id: 'obj-1',
      name: 'Build a Scalable Revenue Engine',
      expanded: true,
      keyResults: [
        {
          id: 'kr-1-1',
          name: 'Reach $250k Monthly Recurring Revenue',
          target: 250000,
          current: 0,
          unit: '$',
          confidence: 60,
          status: 'at-risk',
          dataSource: 'bookkeeper',
          lastUpdated: '2025-11-01',
        },
        {
          id: 'kr-1-2',
          name: 'Generate 100+ Qualified Leads per Month',
          target: 100,
          current: 0,
          unit: 'leads',
          confidence: 70,
          status: 'on-track',
          dataSource: 'clickup',
          lastUpdated: '2025-11-03',
        },
        {
          id: 'kr-1-3',
          name: 'Maintain <5% Monthly Client Churn',
          target: 5,
          current: 0,
          unit: '%',
          confidence: 80,
          status: 'on-track',
          dataSource: 'sales',
        },
      ],
    },
    {
      id: 'obj-2',
      name: 'Establish Operational Excellence',
      expanded: true,
      keyResults: [
        {
          id: 'kr-2-1',
          name: 'Real-time Financial Dashboard Operational',
          target: 100,
          current: 0,
          unit: '%',
          confidence: 50,
          status: 'at-risk',
          dataSource: 'manual',
        },
        {
          id: 'kr-2-2',
          name: 'Reduce Manual Work by 80%',
          target: 80,
          current: 0,
          unit: '%',
          confidence: 40,
          status: 'off-track',
          dataSource: 'manual',
        },
        {
          id: 'kr-2-3',
          name: 'Month-End Close in <5 Days',
          target: 5,
          current: 0,
          unit: 'days',
          confidence: 65,
          status: 'on-track',
          dataSource: 'bookkeeper',
        },
      ],
    },
    {
      id: 'obj-3',
      name: 'Scale Team Without Founder Dependency',
      expanded: false,
      keyResults: [
        {
          id: 'kr-3-1',
          name: 'Hire 4 Quality Candidates per Month',
          target: 4,
          current: 0,
          unit: 'hires',
          confidence: 55,
          status: 'at-risk',
          dataSource: 'manual',
        },
        {
          id: 'kr-3-2',
          name: 'Reduce Founder Time to <10 hrs/week',
          target: 10,
          current: 0,
          unit: 'hours',
          confidence: 45,
          status: 'off-track',
          dataSource: 'manual',
        },
        {
          id: 'kr-3-3',
          name: '95% of Processes Have SOPs',
          target: 95,
          current: 0,
          unit: '%',
          confidence: 60,
          status: 'at-risk',
          dataSource: 'manual',
        },
      ],
    },
  ]);

  const toggleObjective = (objId: string) => {
    setObjectives(objectives.map(obj => 
      obj.id === objId ? { ...obj, expanded: !obj.expanded } : obj
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'at-risk':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'off-track':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-5 h-5" />;
      case 'at-risk':
        return <AlertCircle className="w-5 h-5" />;
      case 'off-track':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDataSourceBadge = (source: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      clickup: { label: 'ClickUp', color: 'bg-purple-100 text-purple-700' },
      sales: { label: 'Sales Team', color: 'bg-blue-100 text-blue-700' },
      bookkeeper: { label: 'Bookkeeper', color: 'bg-green-100 text-green-700' },
      manual: { label: 'Manual', color: 'bg-gray-100 text-gray-700' },
    };
    const badge = badges[source] || badges.manual;
    return (
      <span className={`text-xs px-2 py-1 rounded ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎯 OKR Dashboard
          </h1>
          <p className="text-gray-600">
            Q2 FY25 • Track progress on your quarterly objectives
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/clickup-report">
            <Button className="w-full h-20 bg-purple-600 hover:bg-purple-700">
              <Upload className="w-5 h-5 mr-2" />
              Upload ClickUp Report
            </Button>
          </Link>
          <Link href="/sales-update">
            <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700">
              <TrendingUp className="w-5 h-5 mr-2" />
              Sales Update
            </Button>
          </Link>
          <Link href="/finance-update">
            <Button className="w-full h-20 bg-green-600 hover:bg-green-700">
              <DollarSign className="w-5 h-5 mr-2" />
              Finance Update
            </Button>
          </Link>
        </div>

        {/* Overall Progress Summary */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Key Results</p>
              <p className="text-3xl font-bold text-gray-900">
                {objectives.reduce((sum, obj) => sum + obj.keyResults.length, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">On Track</p>
              <p className="text-3xl font-bold text-green-600">
                {objectives.reduce((sum, obj) => 
                  sum + obj.keyResults.filter(kr => kr.status === 'on-track').length, 0
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">At Risk</p>
              <p className="text-3xl font-bold text-yellow-600">
                {objectives.reduce((sum, obj) => 
                  sum + obj.keyResults.filter(kr => kr.status === 'at-risk').length, 0
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Off Track</p>
              <p className="text-3xl font-bold text-red-600">
                {objectives.reduce((sum, obj) => 
                  sum + obj.keyResults.filter(kr => kr.status === 'off-track').length, 0
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Objectives List */}
        <div className="space-y-4">
          {objectives.map((objective) => (
            <div key={objective.id} className="bg-white rounded-lg shadow-sm border-2 border-gray-200">
              {/* Objective Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleObjective(objective.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {objective.expanded ? (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-gray-400" />
                    )}
                    <Target className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      {objective.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {objective.keyResults.length} Key Results
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Results */}
              {objective.expanded && (
                <div className="border-t border-gray-200">
                  {objective.keyResults.map((kr) => (
                    <div key={kr.id} className="p-6 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{kr.name}</h4>
                            {getDataSourceBadge(kr.dataSource)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              Target: {kr.unit === '$' ? '$' : ''}{kr.target.toLocaleString()}{kr.unit !== '$' ? ` ${kr.unit}` : ''}
                            </span>
                            <span>
                              Current: {kr.unit === '$' ? '$' : ''}{kr.current.toLocaleString()}{kr.unit !== '$' ? ` ${kr.unit}` : ''}
                            </span>
                            {kr.lastUpdated && (
                              <span className="text-gray-400">
                                Updated: {new Date(kr.lastUpdated).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(kr.status)}`}>
                          {getStatusIcon(kr.status)}
                          <span className="text-sm font-medium capitalize">{kr.status.replace('-', ' ')}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Progress</span>
                          <span className="text-xs font-semibold text-gray-700">
                            {calculateProgress(kr.current, kr.target).toFixed(1)}%
                          </span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              kr.status === 'on-track' ? 'bg-green-500' :
                              kr.status === 'at-risk' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${calculateProgress(kr.current, kr.target)}%` }}
                          />
                        </div>
                      </div>

                      {/* Confidence Level */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Confidence</span>
                          <span className="text-xs font-semibold text-gray-700">{kr.confidence}%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              kr.confidence >= 70 ? 'bg-blue-500' :
                              kr.confidence >= 40 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${kr.confidence}%` }}
                          />
                        </div>
                      </div>

                      {/* Update Button */}
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Update Confidence
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
