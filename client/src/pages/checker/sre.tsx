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
import { Flag } from "lucide-react";
import { apiRequest, queryClient } from "../../lib/queryClient";
import type {
  Collection,
  Disbursement,
} from "../../../../deleted/shared/schema";
import { format } from "date-fns";
import { CheckerLayout } from "../../components/checker-layout";

export default function CheckerSRE() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"collections" | "disbursements">(
    "collections",
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    | ((Collection | Disbursement) & { type: "collection" | "disbursement" })
    | null
  >(null);
  const [reviewComment, setReviewComment] = useState("");

  // Fetch collections
  const { data: collections = [], isLoading: collectionsLoading } = useQuery<
    Collection[]
  >({
    queryKey: ["/api/collections"],
  });

  // Fetch disbursements
  const { data: disbursements = [], isLoading: disbursementsLoading } =
    useQuery<Disbursement[]>({
      queryKey: ["/api/disbursements"],
    });

  // Flag mutation (checkers can only flag transactions)
  const reviewMutation = useMutation({
    mutationFn: async ({
      id,
      type,
      comment,
    }: {
      id: string;
      type: "collection" | "disbursement";
      comment: string;
    }) => {
      const endpoint =
        type === "collection"
          ? `/api/collections/${id}/review`
          : `/api/disbursements/${id}/review`;
      return apiRequest("PATCH", endpoint, {
        status: "flagged",
        comment,
        reviewedBy: "Checker",
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey:
          variables.type === "collection"
            ? ["/api/collections"]
            : ["/api/disbursements"],
      });
      toast({
        title: "Transaction Flagged",
        description:
          "The transaction has been flagged for review by the Approver.",
      });
      setReviewDialogOpen(false);
      setReviewComment("");
      setSelectedTransaction(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Review Failed",
        description:
          error.message || "Failed to review transaction. Please try again.",
      });
    },
  });

  const handleReviewClick = (
    transaction: Collection | Disbursement,
    type: "collection" | "disbursement",
  ) => {
    setSelectedTransaction({ ...transaction, type });
    setReviewComment(transaction.reviewComment || "");
    setReviewDialogOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedTransaction) return;

    if (!reviewComment.trim()) {
      toast({
        variant: "destructive",
        title: "Comment Required",
        description:
          "Please provide a comment explaining why this transaction is being flagged.",
      });
      return;
    }

    reviewMutation.mutate({
      id: selectedTransaction.id,
      type: selectedTransaction.type,
      comment: reviewComment.trim(),
    });
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

  const totalCollections = collections.reduce(
    (sum, c) => sum + parseFloat(c.amount),
    0,
  );
  const totalDisbursements = disbursements.reduce(
    (sum, d) => sum + parseFloat(d.amount),
    0,
  );

  return (
    <CheckerLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">
            Statement of Receipts & Expenditures (SRE)
          </h1>
          <p className="text-muted-foreground mt-1">
            Flag transactions with errors for review
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
                              collection.reviewStatus === "flagged"
                                ? "bg-red-50"
                                : ""
                            }
                            data-testid={`row-collection-${collection.id}`}
                          >
                            <TableCell className="font-medium">
                              {collection.transactionId}
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(collection.transactionDate),
                                "MMM dd, yyyy",
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {collection.natureOfCollection}
                            </TableCell>
                            <TableCell>{collection.payor}</TableCell>
                            <TableCell>{collection.orNumber}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(collection.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(collection.reviewStatus)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() =>
                                  handleReviewClick(collection, "collection")
                                }
                                data-testid={`button-flag-collection-${collection.id}`}
                              >
                                <Flag className="h-4 w-4 mr-1" />
                                Flag
                              </Button>
                              {collection.reviewComment && (
                                <div className="mt-2 text-xs text-muted-foreground italic">
                                  Comment: {collection.reviewComment}
                                </div>
                              )}
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
                          <TableHead>DV Number</TableHead>
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
                              disbursement.reviewStatus === "flagged"
                                ? "bg-red-50"
                                : ""
                            }
                            data-testid={`row-disbursement-${disbursement.id}`}
                          >
                            <TableCell className="font-medium">
                              {disbursement.transactionId}
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(disbursement.transactionDate),
                                "MMM dd, yyyy",
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {disbursement.natureOfDisbursement}
                            </TableCell>
                            <TableCell>{disbursement.payee}</TableCell>
                            <TableCell>{disbursement.dvNumber}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(disbursement.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(disbursement.reviewStatus)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() =>
                                  handleReviewClick(
                                    disbursement,
                                    "disbursement",
                                  )
                                }
                                data-testid={`button-flag-disbursement-${disbursement.id}`}
                              >
                                <Flag className="h-4 w-4 mr-1" />
                                Flag
                              </Button>
                              {disbursement.reviewComment && (
                                <div className="mt-2 text-xs text-muted-foreground italic">
                                  Comment: {disbursement.reviewComment}
                                </div>
                              )}
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
            <DialogTitle>Flag Transaction</DialogTitle>
            <DialogDescription>
              Please explain what issues you found with this transaction.
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Transaction ID:</span>
                  <span className="text-sm">
                    {selectedTransaction.transactionId}
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
                  Comment <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="review-comment"
                  placeholder="Explain what errors or issues you found"
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
              disabled={reviewMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-review"
            >
              {reviewMutation.isPending ? "Submitting..." : "Flag Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CheckerLayout>
  );
}
