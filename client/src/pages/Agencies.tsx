import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink, Copy } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { getAllAgencies, orgChartData } from "@/data/orgChart";
import { toast } from "sonner";

export default function Agencies() {
  const agencies = useMemo(() => getAllAgencies(), []);
  const departments = orgChartData.departments;

  const copySubmissionLink = (agencyId: string) => {
    const link = `${window.location.origin}/submissions?agency=${agencyId}`;
    navigator.clipboard.writeText(link);
    toast.success("Submission link copied to clipboard!");
  };

  const testLink = (agencyId: string) => {
    const link = `${window.location.origin}/submissions?agency=${agencyId}`;
    window.open(link, "_blank");
  };

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Agencies</h1>
              <p className="text-muted-foreground mt-1">
                Manage your agency partners and their submission links
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Agencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{agencies.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Departments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{departments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{orgChartData.services.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Agencies by Department */}
          {departments.map((dept) => (
            <Card key={dept.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {dept.name}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({dept.agencies.length} {dept.agencies.length === 1 ? 'agency' : 'agencies'})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dept.agencies.map((agency) => (
                    <div
                      key={agency.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{agency.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {agency.slackChannelId}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => copySubmissionLink(agency.id)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Submission Link
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => testLink(agency.id)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Test Link
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Services
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({orgChartData.services.length} services)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orgChartData.services.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.slackChannelId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => copySubmissionLink(service.id)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Submission Link
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => testLink(service.id)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Test Link
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Sidebar>
  );
}
