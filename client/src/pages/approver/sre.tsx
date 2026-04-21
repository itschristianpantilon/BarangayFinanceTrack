import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { useToast } from "../../hooks/use-toast";
import {
  Flag,
  CheckCircle2,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";
import { queryClient } from "../../lib/queryClient";
import { format } from "date-fns";
import { ApproverLayout } from "../../components/approver-layout";
import { useAuth } from "@/contexts/auth-context";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://barangayfinancetrackbackenddeployment.onrender.com/api";
const PAGE_SIZE = 10;

type ReviewStatus = "pending" | "approved" | "flagged";

type Collection = {
  id: number;
  transaction_id: string;
  transaction_date: string | null;
  nature_of_collection: string;
  payor: string;
  or_number: string;
  amount: string;
  category: string;
  fund_source: string;
  review_status: ReviewStatus;
  review_comment: string | null;
  is_flagged: boolean;
};

type Disbursement = {
  id: number;
  transaction_id: string;
  transaction_date: string | null;
  nature_of_disbursement: string;
  payee: string;
  or_number: string | null;
  amount: string;
  category: string;
  fund_source: string;
  review_status: ReviewStatus;
  review_comment: string | null;
  is_flagged: boolean;
};

type FlagComment = {
  id: number;
  comment_text: string;
  created_at: string;
  flagged_by: number;
  username: string;
};

/* -------------------- FLAG COMMENTS DIALOG -------------------- */

function FlagCommentsDialog({
  open,
  onOpenChange,
  recordId,
  flagType,
  transactionId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: number | null;
  flagType: "collection" | "disbursement";
  transactionId?: string;
}) {
  const { data: comments = [], isLoading } = useQuery<FlagComment[]>({
    queryKey: ["flag-comments", flagType, recordId],
    queryFn: async () => {
      if (!recordId) return [];
      const url = `${API_BASE_URL}/get-flag-comments?flag_type=${flagType}&record_id=${recordId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch flag comments");
      const data = await response.json();
      return data.data || [];
    },
    enabled: open && !!recordId,
    staleTime: 0,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Flag Comments
          </DialogTitle>
          <DialogDescription>
            Viewing flag remarks for transaction{" "}
            <span className="font-mono font-semibold text-foreground">
              {transactionId}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <MessageSquare className="h-8 w-8 opacity-40" />
              <p className="text-sm">No flag comments found for this record.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-lg p-4 space-y-2"
              >
                <p className="text-sm leading-relaxed text-foreground">
                  {comment.comment_text}
                </p>
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
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

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

/* -------------------- PAGE -------------------- */

export default function ApproverSRE() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"collections" | "disbursements">("collections");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    | ((Collection | Disbursement) & { type: "collection" | "disbursement" })
    | null
  >(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAction, setReviewAction] = useState<"approved" | "flagged">("approved");
  const [collectionsPage, setCollectionsPage] = useState(1);
  const [disbursementsPage, setDisbursementsPage] = useState(1);
  const [flagDialog, setFlagDialog] = useState<{
    open: boolean;
    recordId: number | null;
    flagType: "collection" | "disbursement";
    transactionId?: string;
  }>({ open: false, recordId: null, flagType: "collection" });

  const openFlagDialog = (recordId: number, flagType: "collection" | "disbursement", transactionId: string) => {
    setFlagDialog({ open: true, recordId, flagType, transactionId });
  };

  /* Fetch collections */
  const { data: collections = [], isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/get-collection`);
      if (!response.ok) throw new Error("Failed to fetch collections");
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  /* Fetch disbursements */
  const { data: disbursements = [], isLoading: disbursementsLoading } = useQuery<Disbursement[]>({
    queryKey: ["disbursements"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/get-disbursement`);
      if (!response.ok) throw new Error("Failed to fetch disbursements");
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  /* Track which collection records THIS user has already flagged */
  const { data: userFlaggedCollections } = useQuery<Set<number>>({
    queryKey: ["user-flagged-collections-approver", user?.id, collections.map((c) => c.id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        collections.map(async (c) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/get-flag-comments?flag_type=collection&record_id=${c.id}`
            );
            if (!res.ok) return null;
            const data = await res.json();
            const comments: FlagComment[] = data.data || [];
            return comments.some((comment) => Number(comment.flagged_by) === Number(user?.id))
              ? c.id
              : null;
          } catch {
            return null;
          }
        })
      );
      return new Set(results.filter((id): id is number => id !== null));
    },
    enabled: collections.length > 0 && !!user?.id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: undefined,
  });

  /* Track which disbursement records THIS user has already flagged */
  const { data: userFlaggedDisbursements } = useQuery<Set<number>>({
    queryKey: ["user-flagged-disbursements-approver", user?.id, disbursements.map((d) => d.id).join(",")],
    queryFn: async () => {
      const results = await Promise.all(
        disbursements.map(async (d) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/get-flag-comments?flag_type=disbursement&record_id=${d.id}`
            );
            if (!res.ok) return null;
            const data = await res.json();
            const comments: FlagComment[] = data.data || [];
            return comments.some((comment) => Number(comment.flagged_by) === Number(user?.id))
              ? d.id
              : null;
          } catch {
            return null;
          }
        })
      );
      return new Set(results.filter((id): id is number => id !== null));
    },
    enabled: disbursements.length > 0 && !!user?.id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: undefined,
  });

  /** Disable Flag button only if THIS user has already flagged this record */
  const isUserFlagged = (id: number, type: "collection" | "disbursement"): boolean =>
    type === "collection"
      ? (userFlaggedCollections?.has(id) ?? false)
      : (userFlaggedDisbursements?.has(id) ?? false);

  // Paginated slices
  const collectionsTotalPages = Math.ceil(collections.length / PAGE_SIZE);
  const paginatedCollections = collections.slice(
    (collectionsPage - 1) * PAGE_SIZE,
    collectionsPage * PAGE_SIZE
  );
  const disbursementsTotalPages = Math.ceil(disbursements.length / PAGE_SIZE);
  const paginatedDisbursements = disbursements.slice(
    (disbursementsPage - 1) * PAGE_SIZE,
    disbursementsPage * PAGE_SIZE
  );

  /* Approve mutation */
  const approveMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number; type: "collection" | "disbursement" }) => {
      const payload =
        type === "collection"
          ? { collection_id: id, review_status: "approved", approval_type: "collection" }
          : { disbursement_id: id, review_status: "approved", approval_type: "disbursement" };
      const response = await fetch(`${API_BASE_URL}/put-approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to approve transaction. Please try again.");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: variables.type === "collection" ? ["collections"] : ["disbursements"],
      });
      toast({ title: "Transaction Approved", description: "The transaction has been approved successfully." });
      setReviewDialogOpen(false);
      setReviewComment("");
      setSelectedTransaction(null);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Approval Failed", description: error.message || "Failed to approve transaction. Please try again." });
    },
  });

  /* Flag mutation */
  const flagMutation = useMutation({
    mutationFn: async ({ id, type, comment }: { id: number; type: "collection" | "disbursement"; comment: string }) => {
      const payload = {
        ...(type === "collection" ? { collection_id: id } : { disbursement_id: id }),
        comment,
        flagged_by: user?.id ?? null,
        flag_type: type,
        username: user?.username ?? "",
      };
      const response = await fetch(`${API_BASE_URL}/insert-flag-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to flag transaction. Please try again.");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: variables.type === "collection" ? ["collections"] : ["disbursements"],
      });
      // Invalidate per-user flag cache so button disables immediately
      queryClient.invalidateQueries({
        queryKey:
          variables.type === "collection"
            ? ["user-flagged-collections-approver", user?.id]
            : ["user-flagged-disbursements-approver", user?.id],
      });
      toast({ title: "Transaction Flagged", description: "The transaction has been flagged for review." });
      setReviewDialogOpen(false);
      setReviewComment("");
      setSelectedTransaction(null);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Flag Failed", description: error.message || "Failed to flag transaction. Please try again." });
    },
  });

  const handleReviewClick = (
    transaction: Collection | Disbursement,
    type: "collection" | "disbursement",
    action: "approved" | "flagged"
  ) => {
    setSelectedTransaction({ ...transaction, type });
    setReviewAction(action);
    setReviewComment(transaction.review_comment || "");
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedTransaction) return;
    if (reviewAction === "flagged" && !reviewComment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment Required",
        description: "Please provide a comment explaining why this transaction is being flagged.",
      });
      return;
    }
    if (reviewAction === "approved") {
      approveMutation.mutate({ id: selectedTransaction.id, type: selectedTransaction.type });
    } else {
      flagMutation.mutate({ id: selectedTransaction.id, type: selectedTransaction.type, comment: reviewComment.trim() });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "flagged":  return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Flagged</Badge>;
      default:         return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatCurrency = (amount: string) =>
    `₱${parseFloat(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return format(date, "MMM dd, yyyy");
    } catch { return "N/A"; }
  };

  const totalCollections = collections.reduce((sum, c) => sum + parseFloat(c.amount), 0);
  const totalDisbursements = disbursements.reduce((sum, d) => sum + parseFloat(d.amount), 0);
  const isPending = approveMutation.isPending || flagMutation.isPending;

  const CollectionCard = ({ collection }: { collection: Collection }) => (
    <div
      className={`rounded-lg border p-4 space-y-3 ${collection.is_flagged === true ? "bg-red-500/20 border-red-500" : ""}`}
      data-testid={`row-collection-${collection.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{collection.transaction_id}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(collection.transaction_date)}</p>
        </div>
        {getStatusBadge(collection.review_status)}
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Nature:</span>
          <span className="text-right truncate max-w-[60%]">{collection.nature_of_collection}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Payor:</span>
          <span className="text-right">{collection.payor}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">OR #:</span>
          <span className="text-right">{collection.or_number}</span>
        </div>
        <div className="flex justify-between gap-2 pt-1 border-t">
          <span className="font-medium shrink-0">Amount:</span>
          <span className="font-bold text-right">{formatCurrency(collection.amount)}</span>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" className="flex-1 touch-manipulation"
          onClick={() => openFlagDialog(collection.id, "collection", collection.transaction_id)}
          data-testid={`button-view-flags-collection-${collection.id}`}>
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-green-600 border-green-300 hover:bg-green-50 touch-manipulation"
          onClick={() => handleReviewClick(collection, "collection", "approved")}
          data-testid={`button-approve-collection-${collection.id}`}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
        </Button>
        {/* <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-300 hover:bg-red-50 touch-manipulation"
          onClick={() => handleReviewClick(collection, "collection", "flagged")}
          data-testid={`button-flag-collection-${collection.id}`}
          disabled={isUserFlagged(collection.id, "collection")}>
          <Flag className="h-4 w-4 mr-1" /> Flag
        </Button> */}
      </div>
    </div>
  );

  const DisbursementCard = ({ disbursement }: { disbursement: Disbursement }) => (
    <div
      className={`rounded-lg border p-4 space-y-3 ${disbursement.is_flagged === true ? "bg-red-500/20 border-red-500" : ""}`}
      data-testid={`row-disbursement-${disbursement.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{disbursement.transaction_id}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(disbursement.transaction_date)}</p>
        </div>
        {getStatusBadge(disbursement.review_status)}
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Nature:</span>
          <span className="text-right truncate max-w-[60%]">{disbursement.nature_of_disbursement}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">Payee:</span>
          <span className="text-right">{disbursement.payee}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground shrink-0">OR #:</span>
          <span className="text-right">{disbursement.or_number || "N/A"}</span>
        </div>
        <div className="flex justify-between gap-2 pt-1 border-t">
          <span className="font-medium shrink-0">Amount:</span>
          <span className="font-bold text-right">{formatCurrency(disbursement.amount)}</span>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" variant="outline" className="flex-1 touch-manipulation"
          onClick={() => openFlagDialog(disbursement.id, "disbursement", disbursement.transaction_id)}
          data-testid={`button-view-flags-disbursement-${disbursement.id}`}>
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-green-600 border-green-300 hover:bg-green-50 touch-manipulation"
          onClick={() => handleReviewClick(disbursement, "disbursement", "approved")}
          data-testid={`button-approve-disbursement-${disbursement.id}`}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
        </Button>
        {/* <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-300 hover:bg-red-50 touch-manipulation"
          onClick={() => handleReviewClick(disbursement, "disbursement", "flagged")}
          data-testid={`button-flag-disbursement-${disbursement.id}`}
          disabled={isUserFlagged(disbursement.id, "disbursement")}>
          <Flag className="h-4 w-4 mr-1" /> Flag
        </Button> */}
      </div>
    </div>
  );

  return (
    <ApproverLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground font-poppins leading-tight">
            Statement of Receipts &amp; Expenditures (SRE)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Approve or flag financial transactions</p>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Transaction Review</CardTitle>
            <CardDescription className="text-sm">Review transactions and flag any errors for correction</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as "collections" | "disbursements");
              setCollectionsPage(1);
              setDisbursementsPage(1);
            }}>
              <TabsList className="grid w-full grid-cols-2 sm:max-w-md">
                <TabsTrigger value="collections" data-testid="tab-collections">Collections</TabsTrigger>
                <TabsTrigger value="disbursements" data-testid="tab-disbursements">Disbursements</TabsTrigger>
              </TabsList>

              {/* ========== COLLECTIONS TAB ========== */}
              <TabsContent value="collections" className="mt-4 sm:mt-6">
                {collectionsLoading ? (
                  <div className="text-center py-8">Loading collections...</div>
                ) : collections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No collection transactions found</div>
                ) : (
                  <>
                    {/* Mobile */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      {paginatedCollections.map((collection) => (
                        <CollectionCard key={collection.id} collection={collection} />
                      ))}
                      <Pagination currentPage={collectionsPage} totalPages={collectionsTotalPages} onPageChange={setCollectionsPage} />
                      <div className="flex justify-between items-center px-1 pt-2 border-t font-semibold text-sm">
                        <span>Total Collections:</span>
                        <span className="font-bold">{formatCurrency(totalCollections.toString())}</span>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:block border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Nature</TableHead>
                            <TableHead>Payor</TableHead>
                            <TableHead>OR Number</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Is Flagged</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedCollections.map((collection) => (
                            <TableRow key={collection.id}
                              className={collection.is_flagged === true ? "bg-red-500/40" : ""}
                              data-testid={`row-collection-${collection.id}`}>
                              <TableCell className="font-medium">{collection.transaction_id}</TableCell>
                              <TableCell>{formatDate(collection.transaction_date)}</TableCell>
                              <TableCell className="max-w-xs truncate">{collection.nature_of_collection}</TableCell>
                              <TableCell>{collection.payor}</TableCell>
                              <TableCell>{collection.or_number}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(collection.amount)}</TableCell>
                              <TableCell className="text-center">{getStatusBadge(collection.review_status)}</TableCell>
                              <TableCell className="text-center">
                                {collection.is_flagged === true ? (
                                  <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Flag className="h-4 w-4 text-red-500" /> Flagged</p>
                                ) : (
                                  <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Check className="h-4 w-4 text-green-500" /> Not Flagged</p>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex gap-2 justify-center">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                                    onClick={() => openFlagDialog(collection.id, "collection", collection.transaction_id)}
                                    data-testid={`button-view-flags-collection-${collection.id}`} title="View flag comments">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                                    onClick={() => handleReviewClick(collection, "collection", "approved")}
                                    data-testid={`button-approve-collection-${collection.id}`}>
                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                                  </Button>
                                  {/* <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => handleReviewClick(collection, "collection", "flagged")}
                                    data-testid={`button-flag-collection-${collection.id}`}
                                    disabled={isUserFlagged(collection.id, "collection")}>
                                    <Flag className="h-4 w-4 mr-1" /> Flag
                                  </Button> */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={5} className="text-right font-semibold">Total Collections:</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(totalCollections.toString())}</TableCell>
                            <TableCell colSpan={3} />
                          </TableRow>
                        </TableFooter>
                      </Table>
                      <Pagination currentPage={collectionsPage} totalPages={collectionsTotalPages} onPageChange={setCollectionsPage} />
                    </div>
                  </>
                )}
              </TabsContent>

              {/* ========== DISBURSEMENTS TAB ========== */}
              <TabsContent value="disbursements" className="mt-4 sm:mt-6">
                {disbursementsLoading ? (
                  <div className="text-center py-8">Loading disbursements...</div>
                ) : disbursements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No disbursement transactions found</div>
                ) : (
                  <>
                    {/* Mobile */}
                    <div className="flex flex-col gap-3 sm:hidden">
                      {paginatedDisbursements.map((disbursement) => (
                        <DisbursementCard key={disbursement.id} disbursement={disbursement} />
                      ))}
                      <Pagination currentPage={disbursementsPage} totalPages={disbursementsTotalPages} onPageChange={setDisbursementsPage} />
                      <div className="flex justify-between items-center px-1 pt-2 border-t font-semibold text-sm">
                        <span>Total Disbursements:</span>
                        <span className="font-bold">{formatCurrency(totalDisbursements.toString())}</span>
                      </div>
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:block border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Nature</TableHead>
                            <TableHead>Payee</TableHead>
                            <TableHead>OR Number</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-center">Is Flagged</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedDisbursements.map((disbursement) => (
                            <TableRow key={disbursement.id}
                              className={disbursement.is_flagged === true ? "bg-red-500/40" : ""}
                              data-testid={`row-disbursement-${disbursement.id}`}>
                              <TableCell className="font-medium">{disbursement.transaction_id}</TableCell>
                              <TableCell>{formatDate(disbursement.transaction_date)}</TableCell>
                              <TableCell className="max-w-xs truncate">{disbursement.nature_of_disbursement}</TableCell>
                              <TableCell>{disbursement.payee}</TableCell>
                              <TableCell>{disbursement.or_number || "N/A"}</TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(disbursement.amount)}</TableCell>
                              <TableCell className="text-center">{getStatusBadge(disbursement.review_status)}</TableCell>
                              <TableCell className="text-center">
                                {disbursement.is_flagged === true ? (
                                  <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Flag className="h-4 w-4 text-red-500" /> Flagged</p>
                                ) : (
                                  <p className="flex items-center justify-center gap-2 text-xs font-semibold"><Check className="h-4 w-4 text-green-500" /> Not Flagged</p>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex gap-2 justify-center">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                                    onClick={() => openFlagDialog(disbursement.id, "disbursement", disbursement.transaction_id)}
                                    data-testid={`button-view-flags-disbursement-${disbursement.id}`} title="View flag comments">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                                    onClick={() => handleReviewClick(disbursement, "disbursement", "approved")}
                                    data-testid={`button-approve-disbursement-${disbursement.id}`}>
                                    <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                                  </Button>
                                  {/* <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => handleReviewClick(disbursement, "disbursement", "flagged")}
                                    data-testid={`button-flag-disbursement-${disbursement.id}`}
                                    disabled={isUserFlagged(disbursement.id, "disbursement")}>
                                    <Flag className="h-4 w-4 mr-1" /> Flag
                                  </Button> */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={5} className="text-right font-semibold">Total Disbursements:</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(totalDisbursements.toString())}</TableCell>
                            <TableCell colSpan={3} />
                          </TableRow>
                        </TableFooter>
                      </Table>
                      <Pagination currentPage={disbursementsPage} totalPages={disbursementsTotalPages} onPageChange={setDisbursementsPage} />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-lg" data-testid="dialog-review">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {reviewAction === "approved" ? "Approve Transaction" : "Flag Transaction"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {reviewAction === "approved"
                ? "Confirm that this transaction is correct and complete."
                : "Please explain what issues you found with this transaction."}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-muted p-3 sm:p-4 rounded-lg space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-sm font-medium shrink-0">Transaction ID:</span>
                  <span className="text-sm text-right truncate">{selectedTransaction.transaction_id}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-sm font-medium shrink-0">Amount:</span>
                  <span className="text-sm text-right">{formatCurrency(selectedTransaction.amount)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-sm font-medium shrink-0">
                    {selectedTransaction.type === "collection" ? "Payor:" : "Payee:"}
                  </span>
                  <span className="text-sm text-right">
                    {selectedTransaction.type === "collection"
                      ? (selectedTransaction as Collection).payor
                      : (selectedTransaction as Disbursement).payee}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-comment" className="text-sm">
                  Comment {reviewAction === "flagged" && <span className="text-red-600">*</span>}
                </Label>
                <Textarea
                  id="review-comment"
                  placeholder={reviewAction === "approved" ? "Optional: Add any notes about this transaction" : "Explain what errors or issues you found"}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  data-testid="input-review-comment"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" className="w-full sm:w-auto"
              onClick={() => setReviewDialogOpen(false)} data-testid="button-cancel-review">
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit} disabled={isPending}
              className={`w-full sm:w-auto ${reviewAction === "approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              data-testid="button-confirm-review">
              {isPending ? "Submitting..." : reviewAction === "approved" ? "Approve" : "Flag Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Comments Dialog */}
      <FlagCommentsDialog
        open={flagDialog.open}
        onOpenChange={(open) => setFlagDialog((prev) => ({ ...prev, open }))}
        recordId={flagDialog.recordId}
        flagType={flagDialog.flagType}
        transactionId={flagDialog.transactionId}
      />
    </ApproverLayout>
  );
}