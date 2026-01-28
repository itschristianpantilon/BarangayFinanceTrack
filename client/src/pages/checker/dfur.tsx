import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Eye,
  Flag,
} from "lucide-react";
import { CheckerLayout } from "../../components/checker-layout";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { type DfurProject } from "../../../../deleted/shared/schema";
import { queryClient, apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "In Progress":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "Planned":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "On Hold":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "Cancelled":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      return "bg-muted";
  }
};

const getReviewStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "flagged":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
  }
};

export default function CheckerDFUR() {
  const [selectedProject, setSelectedProject] = useState<DfurProject | null>(
    null,
  );
  const [viewProject, setViewProject] = useState<DfurProject | null>(null);
  const [flagComment, setFlagComment] = useState("");
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery<DfurProject[]>({
    queryKey: ["/api/dfur"],
  });

  const reviewProject = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "flagged" }) => {
      return apiRequest("PATCH", `/api/dfur/${id}/review`, {
        status,
        comment: flagComment,
        reviewedBy: "Checker",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dfur"] });
      toast({
        title: "Project Flagged",
        description: "DFUR project has been flagged for review.",
      });
      setSelectedProject(null);
      setFlagComment("");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Flagging Project",
        description:
          error.message || "Failed to flag project. Please try again.",
      });
    },
  });

  const handleFlag = () => {
    if (!selectedProject) return;
    if (!flagComment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment Required",
        description:
          "Please provide a comment explaining why this project is being flagged.",
      });
      return;
    }
    reviewProject.mutate({ id: selectedProject.id, status: "flagged" });
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const pendingProjects =
    projects?.filter((p) => p.reviewStatus === "pending").length || 0;
  const flaggedProjects =
    projects?.filter((p) => p.reviewStatus === "flagged").length || 0;

  return (
    <CheckerLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">
            Development Fund Utilization Report (DFUR)
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and flag DFUR projects for compliance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-base">
                <FolderKanban className="h-5 w-5 text-chart-1" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-4xl font-bold text-foreground"
                data-testid="text-total-projects"
              >
                {projects?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-base">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-4xl font-bold text-foreground"
                data-testid="text-pending-projects"
              >
                {pendingProjects}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-base">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Flagged
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-4xl font-bold text-foreground"
                data-testid="text-flagged-projects"
              >
                {flaggedProjects}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">DFUR Projects Review</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Nature</TableHead>
                      <TableHead className="text-right">
                        Approved Cost
                      </TableHead>
                      <TableHead className="text-right">
                        Incurred Cost
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Review Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!projects || projects.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No DFUR projects found
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project) => (
                        <TableRow
                          key={project.id}
                          data-testid={`row-dfur-${project.id}`}
                        >
                          <TableCell className="font-mono text-sm">
                            {project.transactionId}
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {project.project}
                          </TableCell>
                          <TableCell className="text-sm">
                            {project.natureOfCollection}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(project.totalCostApproved)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(project.totalCostIncurred)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(project.status)}
                              variant="outline"
                            >
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getReviewStatusColor(
                                project.reviewStatus,
                              )}
                              variant="outline"
                            >
                              {project.reviewStatus === "pending"
                                ? "Pending"
                                : project.reviewStatus === "approved"
                                  ? "Approved"
                                  : "Flagged"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewProject(project)}
                                data-testid={`button-view-${project.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => setSelectedProject(project)}
                                disabled={project.reviewStatus === "flagged"}
                                data-testid={`button-flag-${project.id}`}
                              >
                                <Flag className="h-4 w-4 mr-1" />
                                Flag
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Project Dialog */}
        <Dialog
          open={!!viewProject}
          onOpenChange={(open) => !open && setViewProject(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                Project Details
              </DialogTitle>
            </DialogHeader>
            {viewProject && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Transaction ID
                    </p>
                    <p className="font-mono font-medium">
                      {viewProject.transactionId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Transaction Date
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(viewProject.transactionDate),
                        "MMM dd, yyyy",
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{viewProject.project}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Nature of Collection
                    </p>
                    <p className="font-medium">
                      {viewProject.natureOfCollection}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{viewProject.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Cost Approved
                    </p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(viewProject.totalCostApproved)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Cost Incurred
                    </p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(viewProject.totalCostIncurred)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date Started
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(viewProject.dateStarted),
                        "MMM dd, yyyy",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Target Completion
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(viewProject.targetCompletionDate),
                        "MMM dd, yyyy",
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      className={getStatusColor(viewProject.status)}
                      variant="outline"
                    >
                      {viewProject.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      No. of Extensions
                    </p>
                    <p className="font-medium">
                      {viewProject.numberOfExtensions}
                    </p>
                  </div>
                </div>
                {viewProject.remarks && (
                  <div>
                    <p className="text-sm text-muted-foreground">Remarks</p>
                    <p className="font-medium">{viewProject.remarks}</p>
                  </div>
                )}
                {viewProject.reviewComment && (
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Review Comment
                    </p>
                    <p className="font-medium">{viewProject.reviewComment}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Flag Project Dialog */}
        <Dialog
          open={!!selectedProject}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedProject(null);
              setFlagComment("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                Flag Project for Review
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedProject && (
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{selectedProject.project}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Transaction ID
                  </p>
                  <p className="font-mono text-sm">
                    {selectedProject.transactionId}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Comment</label>
                <Textarea
                  placeholder="Explain why this project is being flagged..."
                  value={flagComment}
                  onChange={(e) => setFlagComment(e.target.value)}
                  rows={4}
                  className="mt-1"
                  data-testid="input-flag-comment"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProject(null);
                    setFlagComment("");
                  }}
                  data-testid="button-cancel-flag"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFlag}
                  disabled={reviewProject.isPending || !flagComment.trim()}
                  data-testid="button-confirm-flag"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {reviewProject.isPending ? "Flagging..." : "Flag Project"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </CheckerLayout>
  );
}
