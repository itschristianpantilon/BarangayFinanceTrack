import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  Eye,
  Flag,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import { ApproverLayout } from "../../components/approver-layout";
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
import { queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/auth-context";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://barangayfinancetrackbackenddeployment.onrender.com/api";
const PAGE_SIZE = 10;

type DfurProject = {
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
  review_comment?: string;
  remarks?: string;
  is_flagged?: boolean;
};

type ApiResponse = { data: DfurProject[]; message: string };

type TotalDataResponse = {
  overall_cost_approved: string;
  overall_cost_incurred: string;
  total_active: number;
  total_approved: number;
  total_data: number;
  total_flagged: number;
  total_pending: number;
};

type FlagComment = {
  id: number;
  comment_text: string;
  created_at: string;
  flagged_by: number;
  username: string;
};

/* -------------------- HELPERS -------------------- */

const getStatusColor = (status: string) => {
  const s = status?.toLowerCase() || "";
  switch (s) {
    case "completed":    return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "in progress":
    case "in_progress":  return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "planned":      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "on hold":
    case "on_hold":      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "cancelled":    return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:             return "bg-muted";
  }
};

const getReviewStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "flagged":  return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:         return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
  }
};

const formatStatusDisplay = (status: string) => {
  if (!status) return "N/A";
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

/* -------------------- PAGINATION -------------------- */

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-2 py-3 border-t">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .reduce<(number | "...")[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">...</span>
            ) : (
              <Button
                key={p}
                size="sm"
                variant={currentPage === p ? "default" : "outline"}
                onClick={() => onPageChange(p as number)}
                className="h-8 w-8 p-0 text-xs"
              >
                {p}
              </Button>
            )
          )}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* -------------------- VIEW FLAG COMMENTS -------------------- */

function ViewFlagComments({ recordId }: { recordId: string }) {
  const { data: comments = [], isLoading } = useQuery<FlagComment[]>({
    queryKey: ["flag-comments", "dfur", recordId],
    queryFn: async () => {
      const url = `${API_BASE_URL}/get-flag-comments?flag_type=dfur&record_id=${recordId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch flag comments");
      const data = await response.json();
      return data.data || [];
    },
    enabled: !!recordId,
    staleTime: 0,
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pt-1">
        <Flag className="h-4 w-4 text-red-500" />
        <p className="text-sm font-semibold">Flag Comments</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2 border rounded-lg">
          <MessageSquare className="h-7 w-7 opacity-40" />
          <p className="text-xs">No flag comments for this record.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-lg p-3 space-y-1.5"
            >
              <p className="text-sm leading-relaxed text-foreground">{comment.comment_text}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-red-200 dark:border-red-900">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium">{comment.username}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {comment.created_at
                    ? format(new Date(comment.created_at), "MMM dd, yyyy hh:mm a")
                    : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function ApproverDFUR() {
  const [selectedProject, setSelectedProject] = useState<DfurProject | null>(null);
  const [viewProject, setViewProject] = useState<DfurProject | null>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "flagged" | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: apiData, isLoading } = useQuery<ApiResponse>({
    queryKey: ["dfur-projects"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/get-dfur-project`);
      if (!response.ok) throw new Error("Failed to fetch DFUR projects");
      return response.json();
    },
  });

  const { data: totalData } = useQuery<TotalDataResponse>({
    queryKey: ["dfur-total-data"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/get-total-data-dfur-project`);
      if (!response.ok) throw new Error("Failed to fetch total data");
      return response.json();
    },
  });

  const projects = apiData?.data || [];
  const totalPages = Math.ceil(projects.length / PAGE_SIZE);
  const paginatedProjects = projects.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* Track which DFUR records the current user has already flagged */
  const { data: userFlaggedDfur } = useQuery<Set<number>>({
    queryKey: ["user-flagged-dfur-approver", user?.id, projects.map((p) => p.id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        projects.map(async (p) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/get-flag-comments?flag_type=dfur&record_id=${p.id}`
            );
            if (!res.ok) return null;
            const data = await res.json();
            const comments: FlagComment[] = data.data || [];
            return comments.some((c) => Number(c.flagged_by) === Number(user?.id))
              ? p.id
              : null;
          } catch {
            return null;
          }
        })
      );
      return new Set(results.filter((id): id is number => id !== null));
    },
    enabled: projects.length > 0 && !!user?.id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: undefined,
  });

  /** Disable Flag button only if THIS user has already flagged this project */
  const isFlagDisabled = (project: DfurProject): boolean =>
    userFlaggedDfur?.has(project.id) ?? false;

  // Approve mutation
  const approveProject = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const payload = { dfur_id: id, review_status: "approved", approval_type: "dfur" };
      const response = await fetch(`${API_BASE_URL}/put-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to approve project. Please try again.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dfur-projects"] });
      queryClient.invalidateQueries({ queryKey: ["dfur-total-data"] });
      toast({ title: "Project Approved", description: "DFUR project has been approved successfully." });
      setSelectedProject(null);
      setReviewAction(null);
      setReviewComment("");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error Approving Project", description: error.message });
    },
  });

  // Flag mutation
  const flagProject = useMutation({
    mutationFn: async ({ id, comment }: { id: number; comment: string }) => {
      const payload = {
        dfur_id: id,
        comment,
        flagged_by: user?.id ?? null,
        flag_type: "dfur",
        username: user?.username ?? "",
      };
      const response = await fetch(`${API_BASE_URL}/insert-flag-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to flag project. Please try again.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dfur-projects"] });
      queryClient.invalidateQueries({ queryKey: ["dfur-total-data"] });
      // Invalidate so Flag button disables immediately for this user
      queryClient.invalidateQueries({ queryKey: ["user-flagged-dfur-approver", user?.id] });
      toast({ title: "Project Flagged", description: "DFUR project has been flagged for review." });
      setSelectedProject(null);
      setReviewAction(null);
      setReviewComment("");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error Flagging Project", description: error.message });
    },
  });

  const handleReview = () => {
    if (!selectedProject || !reviewAction) return;
    if (reviewAction === "approved") {
      approveProject.mutate({ id: selectedProject.id });
    } else {
      if (!reviewComment.trim()) {
        toast({ variant: "destructive", title: "Comment Required", description: "Please provide a comment when flagging a project." });
        return;
      }
      flagProject.mutate({ id: selectedProject.id, comment: reviewComment.trim() });
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return format(date, "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const ProjectCard = ({ project, isFlagDisabled }: { project: DfurProject; isFlagDisabled: boolean }) => (
    <div
      className={`rounded-lg border p-4 space-y-3 ${project.is_flagged === true ? "bg-red-500/20" : "bg-card"} transition-all duration-200`}
      data-testid={`row-dfur-${project.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug line-clamp-2">{project.project}</p>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{project.transaction_id}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge className={getReviewStatusColor(project.review_status)} variant="outline">
            {project.review_status === "pending" ? "Pending" : project.review_status === "approved" ? "Approved" : "Flagged"}
          </Badge>
          <Badge className={getStatusColor(project.status)} variant="outline">
            {formatStatusDisplay(project.status)}
          </Badge>
          <Badge className={project.is_flagged ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" : "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"} variant="outline">
            {project.is_flagged === true
              ? <p className="flex items-center gap-1 text-xs font-semibold"><Flag className="h-3 w-3 text-red-500" /> Flagged</p>
              : <p className="flex items-center gap-1 text-xs font-semibold"><Check className="h-3 w-3 text-green-500" /> Not Flagged</p>}
          </Badge>
        </div>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Nature:</span>
          <span className="text-right truncate max-w-[60%]">{project.name_of_collection}</span>
        </div>
        <div className="flex justify-between gap-2 pt-1 border-t">
          <span className="text-muted-foreground shrink-0">Approved Cost:</span>
          <span className="font-semibold text-right">{formatCurrency(project.total_cost_approved)}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Incurred Cost:</span>
          <span className="text-right">{formatCurrency(project.total_cost_incurred)}</span>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" className="flex-1 touch-manipulation" onClick={() => setViewProject(project)} data-testid={`button-view-${project.id}`}>
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
        <Button
          size="sm" variant="outline"
          className="flex-1 text-green-600 border-green-300 hover:bg-green-50 touch-manipulation"
          onClick={() => { setSelectedProject(project); setReviewAction("approved"); }}
          disabled={project.review_status === "approved"}
          data-testid={`button-approve-${project.id}`}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
        </Button>
        {/* <Button
          size="sm" variant="outline"
          className="flex-1 text-red-600 border-red-300 hover:bg-red-50 touch-manipulation"
          onClick={() => { setSelectedProject(project); setReviewAction("flagged"); }}
          disabled={project.review_status === "approved" || isFlagDisabled}
          data-testid={`button-flag-${project.id}`}
        >
          <Flag className="h-4 w-4 mr-1" /> Flag
        </Button> */}
      </div>
    </div>
  );

  return (
    <ApproverLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-poppins leading-tight">
            Development Fund Utilization Report (DFUR)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review and approve DFUR projects</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="flex items-center gap-2 font-poppins text-xs sm:text-base">
                <FolderKanban className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1 shrink-0" />
                <span className="leading-tight">Total Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <p className="text-3xl sm:text-4xl font-bold" data-testid="text-total-projects">{totalData?.total_data || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 shadow-lg">
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="flex items-center gap-2 font-poppins text-xs sm:text-base">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 shrink-0" />
                <span className="leading-tight">Pending</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <p className="text-3xl sm:text-4xl font-bold" data-testid="text-pending-projects">{totalData?.total_pending || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 shadow-lg">
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="flex items-center gap-2 font-poppins text-xs sm:text-base">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0" />
                <span className="leading-tight">Approved</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <p className="text-3xl sm:text-4xl font-bold" data-testid="text-approved-projects">{totalData?.total_approved || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/5 to-red-500/10 shadow-lg">
            <CardHeader className="p-3 sm:p-6 pb-1 sm:pb-2">
              <CardTitle className="flex items-center gap-2 font-poppins text-xs sm:text-base">
                <Flag className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 shrink-0" />
                <span className="leading-tight">Flagged</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <p className="text-3xl sm:text-4xl font-bold" data-testid="text-flagged-projects">{totalData?.total_flagged || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Table */}
        <Card className="shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="font-poppins text-base sm:text-lg">DFUR Projects Review</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
              </div>
            ) : (
              <>
                {/* Mobile: card list */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {projects.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground text-sm">No DFUR projects found</p>
                  ) : (
                    <>
                      {paginatedProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} isFlagDisabled={isFlagDisabled(project)} />
                      ))}
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                  )}
                </div>

                {/* Desktop: table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Nature</TableHead>
                        <TableHead className="text-right">Approved Cost</TableHead>
                        <TableHead className="text-right">Incurred Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Is Flagged</TableHead>
                        <TableHead>Review Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No DFUR projects found
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedProjects.map((project) => (
                          <TableRow key={project.id} data-testid={`row-dfur-${project.id}`} className={project.is_flagged ? "bg-red-500/40" : ""}>
                            <TableCell className="font-mono text-sm">{project.transaction_id}</TableCell>
                            <TableCell className="font-medium max-w-[200px] truncate">{project.project}</TableCell>
                            <TableCell className="text-sm">{project.name_of_collection}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(project.total_cost_approved)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(project.total_cost_incurred)}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(project.status)} variant="outline">
                                {formatStatusDisplay(project.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {project.is_flagged === true
                                ? <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Flag className="h-4 w-4 text-red-500" /> Flagged</p>
                                : <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Check className="h-4 w-4 text-green-500" /> Not Flagged</p>}
                            </TableCell>
                            <TableCell>
                              <Badge className={getReviewStatusColor(project.review_status)} variant="outline">
                                {project.review_status === "pending" ? "Pending" : project.review_status === "approved" ? "Approved" : "Flagged"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-center">
                                <Button size="sm" variant="outline" onClick={() => setViewProject(project)} data-testid={`button-view-${project.id}`}>
                                  <Eye className="h-4 w-4 mr-1" /> View
                                </Button>
                                <Button
                                  size="sm" variant="outline"
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                  onClick={() => { setSelectedProject(project); setReviewAction("approved"); }}
                                  disabled={project.review_status === "approved"}
                                  data-testid={`button-approve-${project.id}`}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                {/* <Button
                                  size="sm" variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                  onClick={() => { setSelectedProject(project); setReviewAction("flagged"); }}
                                  disabled={project.review_status === "approved" || isFlagDisabled(project)}
                                  data-testid={`button-flag-${project.id}`}
                                >
                                  <Flag className="h-4 w-4 mr-1" /> Flag
                                </Button> */}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Project Dialog */}
      <Dialog open={!!viewProject} onOpenChange={(open) => !open && setViewProject(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] rounded-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-poppins text-base sm:text-lg">Project Details</DialogTitle>
          </DialogHeader>
          {viewProject && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-medium break-all">{viewProject.transaction_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transaction Date</p>
                  <p className="font-medium">{formatDate(viewProject.transaction_date)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Project</p>
                <p className="font-medium">{viewProject.project}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Nature of Collection</p>
                  <p className="font-medium">{viewProject.name_of_collection}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{viewProject.location}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Cost Approved</p>
                  <p className="font-semibold text-base sm:text-lg">{formatCurrency(viewProject.total_cost_approved)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Cost Incurred</p>
                  <p className="font-semibold text-base sm:text-lg">{formatCurrency(viewProject.total_cost_incurred)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Date Started</p>
                  <p className="font-medium">{formatDate(viewProject.date_started)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Completion</p>
                  <p className="font-medium">{formatDate(viewProject.target_completion_date)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(viewProject.status)} variant="outline">
                    {formatStatusDisplay(viewProject.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">No. of Extensions</p>
                  <p className="font-medium">{viewProject.no_extensions}</p>
                </div>
              </div>
              {viewProject.remarks && (
                <div>
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p className="font-medium">{viewProject.remarks}</p>
                </div>
              )}
              {viewProject.review_comment && (
                <div className="bg-muted p-3 sm:p-4 rounded-md">
                  <p className="text-xs text-muted-foreground">Review Comment</p>
                  <p className="font-medium mt-1">{viewProject.review_comment}</p>
                </div>
              )}
              <ViewFlagComments recordId={String(viewProject.id)} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={!!selectedProject && !!reviewAction}
        onOpenChange={(open) => {
          if (!open) { setSelectedProject(null); setReviewAction(null); setReviewComment(""); }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[500px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-poppins text-base sm:text-lg">
              {reviewAction === "approved" ? "Approve Project" : "Flag Project for Review"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProject && (
              <div className="bg-muted p-3 sm:p-4 rounded-md">
                <p className="text-xs text-muted-foreground">Project</p>
                <p className="font-medium text-sm mt-0.5">{selectedProject.project}</p>
                <p className="text-xs text-muted-foreground mt-2">Transaction ID</p>
                <p className="font-mono text-xs mt-0.5">{selectedProject.transaction_id}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">
                Comment{" "}
                {reviewAction === "flagged" && <span className="text-destructive">*</span>}
              </label>
              <Textarea
                placeholder={reviewAction === "approved" ? "Add an optional comment..." : "Explain why this project is being flagged..."}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="mt-1"
                data-testid="input-review-comment"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => { setSelectedProject(null); setReviewAction(null); setReviewComment(""); }}
                data-testid="button-cancel-review"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={approveProject.isPending || flagProject.isPending }
                variant={reviewAction === "approved" ? "default" : "destructive"}
                className="w-full sm:w-auto"
                data-testid="button-confirm-review"
              >
                {reviewAction === "approved" ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" />{approveProject.isPending ? "Approving..." : "Approve Project"}</>
                ) : (
                  <><AlertTriangle className="h-4 w-4 mr-2" />{flagProject.isPending ? "Flagging..." : "Flag Project"}</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ApproverLayout>
  );
}