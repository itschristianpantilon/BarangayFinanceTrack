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
import { Flag, CheckCircle2 } from "lucide-react";
import { queryClient } from "../../lib/queryClient";
import { format } from "date-fns";
import { ApproverLayout } from "../../components/approver-layout";
import { useAuth } from "@/contexts/auth-context";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

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
  is_flagged: number;
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
  is_flagged: number;
};

export default function ApproverSRE() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"collections" | "disbursements">(
    "collections",
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    | ((Collection | Disbursement) & { type: "collection" | "disbursement" })
    | null
  >(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAction, setReviewAction] = useState<"approved" | "flagged">(
    "approved",
  );

  // Fetch collections
  const { data: collections = [], isLoading: collectionsLoading } = useQuery<
    Collection[]
  >({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/get-collection`);
      if (!response.ok) {
        throw new Error("Failed to fetch collections");
      }
      return response.json();
    },
  });

  // Fetch disbursements
  const { data: disbursements = [], isLoading: disbursementsLoading } =
    useQuery<Disbursement[]>({
      queryKey: ["disbursements"],
      queryFn: async () => {
        const response = await fetch(`${API_BASE_URL}/get-disbursement`);
        if (!response.ok) {
          throw new Error("Failed to fetch disbursements");
        }
        return response.json();
      },
    });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({
      id,
      type,
    }: {
      id: number;
      type: "collection" | "disbursement";
    }) => {
      const payload =
        type === "collection"
          ? {
              collection_id: id,
              review_status: "approved",
              approval_type: "collection",
            }
          : {
              disbursement_id: id,
              review_status: "approved",
              approval_type: "disbursement",
            };

      const response = await fetch(`${API_BASE_URL}/put-approval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to approve transaction. Please try again.",
        );
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey:
          variables.type === "collection"
            ? ["collections"]
            : ["disbursements"],
      });
      toast({
        title: "Transaction Approved",
        description: "The transaction has been approved successfully.",
      });
      setReviewDialogOpen(false);
      setReviewComment("");
      setSelectedTransaction(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description:
          error.message || "Failed to approve transaction. Please try again.",
      });
    },
  });

  // Flag mutation
  const flagMutation = useMutation({
    mutationFn: async ({
      id,
      type,
      comment,
    }: {
      id: number;
      type: "collection" | "disbursement";
      comment: string;
    }) => {
      const reviewedBy = user?.id?.toString() || "1";

      const payload =
        type === "collection"
          ? {
              collection_id: id,
              reviewed_by: parseInt(reviewedBy),
              comment: comment,
              flag_type: "collection",
            }
          : {
              disbursement_id: id,
              reviewed_by: parseInt(reviewedBy),
              comment: comment,
              flag_type: "disbursement",
            };

      const response = await fetch(`${API_BASE_URL}/put-flag-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to flag transaction. Please try again.",
        );
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey:
          variables.type === "collection"
            ? ["collections"]
            : ["disbursements"],
      });
      toast({
        title: "Transaction Flagged",
        description:
          "The transaction has been flagged for review.",
      });
      setReviewDialogOpen(false);
      setReviewComment("");
      setSelectedTransaction(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Flag Failed",
        description:
          error.message || "Failed to flag transaction. Please try again.",
      });
    },
  });

  const handleReviewClick = (
    transaction: Collection | Disbursement,
    type: "collection" | "disbursement",
    action: "approved" | "flagged",
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
        description:
          "Please provide a comment explaining why this transaction is being flagged.",
      });
      return;
    }

    if (reviewAction === "approved") {
      approveMutation.mutate({
        id: selectedTransaction.id,
        type: selectedTransaction.type,
      });
    } else {
      flagMutation.mutate({
        id: selectedTransaction.id,
        type: selectedTransaction.type,
        comment: reviewComment.trim(),
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        );
      case "flagged":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Flagged
          </Badge>
        );
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatCurrency = (amount: string) => {
    return `₱${parseFloat(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

  const totalCollections = collections.reduce(
    (sum, c) => sum + parseFloat(c.amount),
    0,
  );
  const totalDisbursements = disbursements.reduce(
    (sum, d) => sum + parseFloat(d.amount),
    0,
  );

  const isPending = approveMutation.isPending || flagMutation.isPending;

  return (
    <ApproverLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">
            Statement of Receipts & Expenditures (SRE)
          </h1>
          <p className="text-muted-foreground mt-1">
            Approve or flag financial transactions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Review</CardTitle>
            <CardDescription>
              Review transactions and flag any errors for correction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "collections" | "disbursements")
              }
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="collections" data-testid="tab-collections">
                  Collections
                </TabsTrigger>
                <TabsTrigger
                  value="disbursements"
                  data-testid="tab-disbursements"
                >
                  Disbursements
                </TabsTrigger>
              </TabsList>

              {/* Collections Tab */}
              <TabsContent value="collections" className="mt-6">
                {collectionsLoading ? (
                  <div className="text-center py-8">Loading collections...</div>
                ) : collections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No collection transactions found
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
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
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {collections.map((collection) => (
                          <TableRow
                            key={collection.id}
                            className={
                              collection.is_flagged === 1
                                ? "bg-red-50"
                                : ""
                            }
                            data-testid={`row-collection-${collection.id}`}
                          >
                            <TableCell className="font-medium">
                              {collection.transaction_id}
                            </TableCell>
                            <TableCell>
                              {formatDate(collection.transaction_date)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {collection.nature_of_collection}
                            </TableCell>
                            <TableCell>{collection.payor}</TableCell>
                            <TableCell>{collection.or_number}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(collection.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(collection.review_status)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex gap-2 justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                  onClick={() =>
                                    handleReviewClick(
                                      collection,
                                      "collection",
                                      "approved",
                                    )
                                  }
                                  data-testid={`button-approve-collection-${collection.id}`}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                  onClick={() =>
                                    handleReviewClick(
                                      collection,
                                      "collection",
                                      "flagged",
                                    )
                                  }
                                  data-testid={`button-flag-collection-${collection.id}`}
                                >
                                  <Flag className="h-4 w-4 mr-1" />
                                  Flag
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-right font-semibold"
                          >
                            Total Collections:
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(totalCollections.toString())}
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Disbursements Tab */}
              <TabsContent value="disbursements" className="mt-6">
                {disbursementsLoading ? (
                  <div className="text-center py-8">
                    Loading disbursements...
                  </div>
                ) : disbursements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No disbursement transactions found
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
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
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {disbursements.map((disbursement) => (
                          <TableRow
                            key={disbursement.id}
                            className={
                              disbursement.is_flagged === 1
                                ? "bg-red-50"
                                : ""
                            }
                            data-testid={`row-disbursement-${disbursement.id}`}
                          >
                            <TableCell className="font-medium">
                              {disbursement.transaction_id}
                            </TableCell>
                            <TableCell>
                              {formatDate(disbursement.transaction_date)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {disbursement.nature_of_disbursement}
                            </TableCell>
                            <TableCell>{disbursement.payee}</TableCell>
                            <TableCell>{disbursement.or_number || "N/A"}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(disbursement.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(disbursement.review_status)}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex gap-2 justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                  onClick={() =>
                                    handleReviewClick(
                                      disbursement,
                                      "disbursement",
                                      "approved",
                                    )
                                  }
                                  data-testid={`button-approve-disbursement-${disbursement.id}`}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                  onClick={() =>
                                    handleReviewClick(
                                      disbursement,
                                      "disbursement",
                                      "flagged",
                                    )
                                  }
                                  data-testid={`button-flag-disbursement-${disbursement.id}`}
                                >
                                  <Flag className="h-4 w-4 mr-1" />
                                  Flag
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-right font-semibold"
                          >
                            Total Disbursements:
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(totalDisbursements.toString())}
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent data-testid="dialog-review">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approved"
                ? "Approve Transaction"
                : "Flag Transaction"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approved"
                ? "Confirm that this transaction is correct and complete."
                : "Please explain what issues you found with this transaction."}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Transaction ID:</span>
                  <span className="text-sm">
                    {selectedTransaction.transaction_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm">
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    {selectedTransaction.type === "collection"
                      ? "Payor:"
                      : "Payee:"}
                  </span>
                  <span className="text-sm">
                    {selectedTransaction.type === "collection"
                      ? (selectedTransaction as Collection).payor
                      : (selectedTransaction as Disbursement).payee}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-comment">
                  Comment{" "}
                  {reviewAction === "flagged" && (
                    <span className="text-red-600">*</span>
                  )}
                </Label>
                <Textarea
                  id="review-comment"
                  placeholder={
                    reviewAction === "approved"
                      ? "Optional: Add any notes about this transaction"
                      : "Explain what errors or issues you found"
                  }
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  data-testid="input-review-comment"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={isPending}
              className={
                reviewAction === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
              data-testid="button-confirm-review"
            >
              {isPending
                ? "Submitting..."
                : reviewAction === "approved"
                  ? "Approve"
                  : "Flag Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ApproverLayout>
  );
}