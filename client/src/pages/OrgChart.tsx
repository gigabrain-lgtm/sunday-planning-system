import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { orgChartData, getSubmissionLink } from "@/data/orgChart";
import { Building2, Users, Copy, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function OrgChart() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copySubmissionLink = (agencyId: string, agencyName: string) => {
    const link = getSubmissionLink(agencyId);
    navigator.clipboard.writeText(link);
    setCopiedId(agencyId);
    toast.success(`Copied ${agencyName} submission link!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar>
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Organization Chart</h1>
              <p className="text-muted-foreground mt-1">
                Team structure, agencies, and submission links
              </p>
            </div>

            {/* CEO Card */}
            <Card className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {orgChartData.ceo.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{orgChartData.ceo.name}</CardTitle>
                    <CardDescription className="text-base">{orgChartData.ceo.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Departments */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Departments</h2>
              
              {orgChartData.departments.map((dept) => (
                <Card key={dept.id} className="border-2">
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          {dept.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <Users className="w-4 h-4 inline mr-1" />
                          {dept.teamSize} people • {dept.subTeams} teams
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dept.agencies.map((agency) => (
                        <Card key={agency.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              {agency.logo ? (
                                <img 
                                  src={agency.logo} 
                                  alt={agency.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <CardTitle className="text-base">{agency.name}</CardTitle>
                                {agency.slackChannelId && (
                                  <CardDescription className="text-xs font-mono">
                                    {agency.slackChannelId}
                                  </CardDescription>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => copySubmissionLink(agency.id, agency.name)}
                            >
                              {copiedId === agency.id ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Submission Link
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => window.open(getSubmissionLink(agency.id), '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Test Link
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Services */}
            <div className="mt-12 space-y-6">
              <h2 className="text-2xl font-bold">Services</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orgChartData.services.map((service) => (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>
                        {service.subName}
                      </CardDescription>
                      <CardDescription className="text-xs font-mono mt-2">
                        {service.slackChannelId}
                      </CardDescription>
                      <CardDescription className="mt-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        {service.teamSize} people • {service.subTeams} teams
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => copySubmissionLink(service.id, service.name)}
                      >
                        {copiedId === service.id ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Submission Link
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => window.open(getSubmissionLink(service.id), '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Link
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📋 How to Use</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Each agency has a unique submission link</li>
                <li>• Click "Copy Submission Link" to get the URL for an agency</li>
                <li>• Share the link with the agency - their name will be pre-filled</li>
                <li>• When content is marked complete, they'll get a Slack notification</li>
              </ul>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
