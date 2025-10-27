import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export default function TestSlack() {
  const postMutation = trpc.slack.postDaily.useMutation({
    onSuccess: () => {
      toast.success("Slack message posted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to post: ${error.message}`);
    },
  });

  const handleTest = () => {
    postMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Test Slack Integration</CardTitle>
            <CardDescription>
              Manually trigger a Slack post to test the daily manifestation message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will post the latest manifestations from Airtable to your configured Slack channel.
            </p>
            <Button
              onClick={handleTest}
              disabled={postMutation.isPending}
              className="w-full"
            >
              {postMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Message to Slack
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

