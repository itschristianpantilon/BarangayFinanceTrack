import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FolderKanban, Eye, CheckCircle2, AlertTriangle } from "lucide-react";
import { ReviewerLayout } from "../../components/reviewer-layout";
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
import { Badge } from "../../components/ui/badge";

import { format } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export type DfurProject = {
  id: number;
  transaction_id: string;
  transaction_date: string | null;
  project: string;
  name_of_collection: string;
  location: string;
  total_cost_approved: string;
  total_cost_incurred: string;
  date_started: string | null;
  target_completion_date: string | null;
  no_extensions: number;
  status: string;
  review_status: "pending" | "approved" | "flagged";
  reviewed_by?: number | null;
  remarks?: string;
  review_comment?: string;
};

type ApiResponse = {
  data: DfurProject[];
  message: string;
};

type TotalDataResponse = {
  overall_cost_approved: string;
  overall_cost_incurred: string;
  total_active: number;
  total_approved: number;
  total_data: number;
  total_flagged: number;
  total_pending: number;
};

const getStatusColor = (status: string) => {
  const normalizedStatus = status?.toLowerCase() || "";
  switch (normalizedStatus) {
    case "completed":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "in progress":
    case "in_progress":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "planned":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "on hold":
    case "on_hold":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "cancelled":
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

const formatStatusDisplay = (status: string) => {
  if (!status) return "N/A";
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function ReviewerDFUR() {
  const [viewProject, setViewProject] = useState<DfurProject | null>(null);

  // Fetch DFUR projects
  const { data: apiData, isLoading } = useQuery<ApiResponse>({
    queryKey: ["dfur-projects"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/get-dfur-project`);
      if (!response.ok) {
        throw new Error("Failed to fetch DFUR projects");
      }
      return response.json();
    },
  });

  // Fetch total data for summary cards
  const { data: totalData } = useQuery<TotalDataResponse>({
    queryKey: ["dfur-total-data"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/get-total-data-dfur-project`);
      if (!response.ok) {
        throw new Error("Failed to fetch total data");
      }
      return response.json();
    },
  });

  const projects = apiData?.data || [];

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      return "N/A";
    }
  };

  return (
    <ReviewerLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">
            Development Fund Utilization Report (DFUR)
          </h1>
          <p className="text-muted-foreground mt-1">
            Committee Review - Monitor development fund projects for your
            committee
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
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
                {totalData?.total_data || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-base">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-4xl font-bold text-foreground"
                data-testid="text-approved-projects"
              >
                {totalData?.total_approved || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-base">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-4xl font-bold text-foreground"
                data-testid="text-pending-projects"
              >
                {totalData?.total_pending || 0}
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
                {totalData?.total_flagged || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 shadow-lg">
            <CardHeader>
              <CardTitle className="font-poppins text-base">
                Total Approved Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-3xl font-bold text-foreground"
                data-testid="text-total-approved"
              >
                {formatCurrency(totalData?.overall_cost_approved || "0")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 shadow-lg">
            <CardHeader>
              <CardTitle className="font-poppins text-base">
                Total Incurred Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-3xl font-bold text-foreground"
                data-testid="text-total-incurred"
              >
                {formatCurrency(totalData?.overall_cost_incurred || "0")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">DFUR Projects</CardTitle>
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
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Nature</TableHead>
                      <TableHead className="text-right">
                        Approved Cost
                      </TableHead>
                      <TableHead className="text-right">
                        Incurred Cost
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!projects || projects.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
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
                            {project.transaction_id}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(project.transaction_date)}
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {project.project}
                          </TableCell>
                          <TableCell className="text-sm">
                            {project.name_of_collection}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(project.total_cost_approved)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(project.total_cost_incurred)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(project.status)}
                              variant="outline"
                            >
                              {formatStatusDisplay(project.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getReviewStatusColor(
                                project.review_status,
                              )}
                              variant="outline"
                            >
                              {project.review_status === "pending"
                                ? "Pending"
                                : project.review_status === "approved"
                                  ? "Approved"
                                  : "Flagged"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setViewProject(project)}
                                data-testid={`button-view-${project.id}`}
                              >
                                <Eye className="h-4 w-4" />
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
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                      {viewProject.transaction_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Transaction Date
                    </p>
                    <p className="font-medium">
                      {formatDate(viewProject.transaction_date)}
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
                      {viewProject.name_of_collection}
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
                      {formatCurrency(viewProject.total_cost_approved)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Cost Incurred
                    </p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(viewProject.total_cost_incurred)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date Started
                    </p>
                    <p className="font-medium">
                      {formatDate(viewProject.date_started)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Target Completion
                    </p>
                    <p className="font-medium">
                      {formatDate(viewProject.target_completion_date)}
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
                      {formatStatusDisplay(viewProject.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Review Status
                    </p>
                    <Badge
                      className={getReviewStatusColor(viewProject.review_status)}
                      variant="outline"
                    >
                      {viewProject.review_status === "pending"
                        ? "Pending"
                        : viewProject.review_status === "approved"
                          ? "Approved"
                          : "Flagged"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      No. of Extensions
                    </p>
                    <p className="font-medium">
                      {viewProject.no_extensions}
                    </p>
                  </div>
                  {viewProject.reviewed_by && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Reviewed By
                      </p>
                      <p className="font-medium">User #{viewProject.reviewed_by}</p>
                    </div>
                  )}
                </div>
                {viewProject.remarks && (
                  <div>
                    <p className="text-sm text-muted-foreground">Remarks</p>
                    <p className="font-medium">{viewProject.remarks}</p>
                  </div>
                )}
                {viewProject.review_comment && (
                  <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Review Comment
                    </p>
                    <p className="font-medium">{viewProject.review_comment}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ReviewerLayout>
  );
}