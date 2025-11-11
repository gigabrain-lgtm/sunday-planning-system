import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function TestCustomFields() {
  const [taskId, setTaskId] = useState("86ad57tqw");
  const [result, setResult] = useState<any>(null);

  const { refetch, isLoading } = trpc.dashboard.getCustomFields.useQuery(
    { taskId },
    { enabled: false }
  );

  const handleFetch = async () => {
    const { data } = await refetch();
    setResult(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Get Custom Field IDs</h1>
      <div className="space-y-4">
        <input
          type="text"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="border p-2 rounded"
          placeholder="Task ID"
        />
        <Button onClick={handleFetch} disabled={isLoading}>
          {isLoading ? "Loading..." : "Fetch Custom Fields"}
        </Button>
        {result && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
