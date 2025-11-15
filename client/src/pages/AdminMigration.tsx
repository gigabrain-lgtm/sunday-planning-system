import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { trpc } from "@/lib/trpc";
import { Database, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminMigration() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const migrateMutation = trpc.fulfilment.migrateClients.useMutation({
    onSuccess: () => {
      setMigrationStatus('success');
      toast.success('Migration completed successfully!');
    },
    onError: (error) => {
      setMigrationStatus('error');
      setErrorMessage(error.message);
      toast.error(`Migration failed: ${error.message}`);
    },
  });

  const handleMigrate = () => {
    setMigrationStatus('running');
    setErrorMessage('');
    migrateMutation.mutate();
  };

  return (
    <Sidebar>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Database Migration</h1>
          <p className="text-muted-foreground mt-2">
            Migrate ClickUp clients from Supabase to PostgreSQL
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              ClickUp Clients Migration
            </CardTitle>
            <CardDescription>
              This will copy all client data from the external Supabase database to your local PostgreSQL database.
              This operation is idempotent - you can run it multiple times safely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {migrationStatus === 'idle' && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h3 className="font-semibold mb-2">What this does:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Fetches all clients from Supabase</li>
                    <li>Inserts them into your PostgreSQL database</li>
                    <li>Updates existing clients if they already exist</li>
                    <li>Takes approximately 30-60 seconds</li>
                  </ul>
                </div>
                <Button onClick={handleMigrate} size="lg" className="w-full">
                  <Database className="mr-2 h-4 w-4" />
                  Run Migration
                </Button>
              </div>
            )}

            {migrationStatus === 'running' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-semibold">Migration in progress...</p>
                  <p className="text-sm text-muted-foreground">This may take up to 60 seconds</p>
                </div>
              </div>
            )}

            {migrationStatus === 'success' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div className="text-center">
                  <p className="font-semibold text-green-600">Migration completed successfully!</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All clients have been migrated to PostgreSQL
                  </p>
                </div>
                <Button onClick={() => window.location.href = '/fulfilment/clients'} variant="outline">
                  View Clients
                </Button>
              </div>
            )}

            {migrationStatus === 'error' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <XCircle className="h-12 w-12 text-red-500" />
                <div className="text-center">
                  <p className="font-semibold text-red-600">Migration failed</p>
                  <p className="text-sm text-muted-foreground mt-2">{errorMessage}</p>
                </div>
                <Button onClick={() => setMigrationStatus('idle')} variant="outline">
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Notes</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
            <li>This migration only needs to be run once</li>
            <li>Running it multiple times is safe (it will update existing records)</li>
            <li>After migration, the Clients page will load from your local database</li>
            <li>You can set up a sync job later to keep data fresh</li>
          </ul>
        </div>
      </div>
    </Sidebar>
  );
}
