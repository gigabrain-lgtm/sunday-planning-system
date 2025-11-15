import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

interface MapWorkableJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workableJob: {
    id: string;
    title: string;
    shortcode: string;
  };
  onSuccess?: () => void;
}

export function MapWorkableJobDialog({
  open,
  onOpenChange,
  workableJob,
  onSuccess,
}: MapWorkableJobDialogProps) {
  const [selectedJobAssignmentId, setSelectedJobAssignmentId] = useState<string>("");

  // Fetch all job assignments
  const { data: jobAssignments, isLoading } = trpc.jobAssignments.list.useQuery();

  // Map Workable job mutation
  const mapMutation = trpc.jobAssignments.mapWorkableJob.useMutation({
    onSuccess: () => {
      toast.success("Workable job mapped successfully");
      onOpenChange(false);
      setSelectedJobAssignmentId("");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to map job: ${error.message}`);
    },
  });

  const handleMap = () => {
    if (!selectedJobAssignmentId) {
      toast.error("Please select a job assignment");
      return;
    }

    mapMutation.mutate({
      jobAssignmentId: parseInt(selectedJobAssignmentId),
      workableJobId: workableJob.id,
      workableShortcode: workableJob.shortcode,
    });
  };

  // Filter out already mapped job assignments
  const availableAssignments = jobAssignments?.filter(
    (assignment) => !assignment.workableJobId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Map Workable Job</DialogTitle>
          <DialogDescription>
            Link "{workableJob.title}" to an internal job assignment to track performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="jobAssignment">Select Job Assignment</Label>
            <Select
              value={selectedJobAssignmentId}
              onValueChange={setSelectedJobAssignmentId}
              disabled={isLoading || mapMutation.isPending}
            >
              <SelectTrigger id="jobAssignment">
                <SelectValue placeholder="Choose an internal job assignment" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : availableAssignments && availableAssignments.length > 0 ? (
                  availableAssignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id.toString()}>
                      {assignment.nomenclature || `${assignment.jobTitle} - ${assignment.agencyName}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No available job assignments
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Only unmapped job assignments are shown
            </p>
          </div>

          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-sm font-medium">Workable Job Details</p>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono">{workableJob.shortcode}</span> • {workableJob.title}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mapMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMap}
            disabled={!selectedJobAssignmentId || mapMutation.isPending}
          >
            {mapMutation.isPending ? "Mapping..." : "Map Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
