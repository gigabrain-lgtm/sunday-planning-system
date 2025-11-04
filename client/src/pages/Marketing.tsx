import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, RefreshCw, Table as TableIcon } from "lucide-react";
import { useState } from "react";

export default function Marketing() {
  const { data, isLoading, error, refetch } = trpc.marketing.getAllData.useQuery();
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleTable = (tableId: string) => {
    setExpandedTables(prev => {
      const next = new Set(prev);
      if (next.has(tableId)) {
        next.delete(tableId);
      } else {
        next.add(tableId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Failed to load marketing data: {error.message}
                  </p>
                  <Button onClick={() => refetch()} variant="outline" className="mt-4">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Sidebar>
    );
  }

  const { tables = [], totalTables = 0 } = data || {};

  return (
    <Sidebar>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
              <p className="text-muted-foreground mt-1">
                View and manage marketing data from Airtable
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-5xl font-bold text-center">{totalTables}</CardTitle>
              <CardDescription className="text-center text-lg">
                Total Tables
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Tables */}
          {tables.map((table: any) => (
            <Card key={table.tableId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="w-5 h-5" />
                    {table.tableName}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({table.records.length} records)
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTable(table.tableId)}
                  >
                    {expandedTables.has(table.tableId) ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </CardHeader>
              
              {expandedTables.has(table.tableId) && (
                <CardContent>
                  {table.error ? (
                    <div className="text-sm text-destructive">
                      Error loading data: {table.error}
                    </div>
                  ) : table.records.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No records found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {Object.keys(table.records[0]?.fields || {}).map((fieldName) => (
                              <th key={fieldName} className="text-left p-2 font-medium">
                                {fieldName}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.records.slice(0, 50).map((record: any) => (
                            <tr key={record.id} className="border-b hover:bg-accent/50">
                              {Object.keys(table.records[0]?.fields || {}).map((fieldName) => (
                                <td key={fieldName} className="p-2">
                                  {typeof record.fields[fieldName] === 'object' 
                                    ? JSON.stringify(record.fields[fieldName])
                                    : String(record.fields[fieldName] || '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {table.records.length > 50 && (
                        <div className="text-sm text-muted-foreground mt-4 text-center">
                          Showing first 50 of {table.records.length} records
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}

          {/* Empty State */}
          {tables.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TableIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No tables found in Airtable base
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
