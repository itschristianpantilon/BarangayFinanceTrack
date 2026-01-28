import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Download, Calendar, TrendingUp, TrendingDown, Edit, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { EncoderLayout } from "../../components/encoder-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

import { format, startOfMonth, endOfMonth } from "date-fns";
import { CollectionForm } from "../../components/collection-form";
import { DisbursementForm } from "../../components/disbursement-form";
import { queryClient, apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

export type Revenue = {
  id: string;
  date: string;
  source: string;
  category: string;
  amount: string;
};

export type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: string;
};

export type Collection = {
  id: string;
  transactionId: string;
  transactionDate: string;
  natureOfCollection: string;
  payor: string;
  orNumber: string;
  amount: string;
};

export type Disbursement = {
  id: string;
  transactionId: string;
  transactionDate: string;
  natureOfDisbursement: string;
  payee: string;
  dvNumber: string;
  amount: string;
};


type ViewType = 'collection' | 'disbursement';

export default function SRE() {
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(currentDate), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(currentDate), 'yyyy-MM-dd'));
  const [activeView, setActiveView] = useState<ViewType>('collection');
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);
  const [deleteDisbursementId, setDeleteDisbursementId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: revenues, isLoading: isLoadingRevenues } = useQuery<Revenue[]>({
    queryKey: ["/api/revenues"],
  });

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: collections, isLoading: isLoadingCollections } = useQuery<Collection[]>({
    queryKey: ["/api/collections"],
  });

  const { data: disbursements, isLoading: isLoadingDisbursements } = useQuery<Disbursement[]>({
    queryKey: ["/api/disbursements"],
  });

  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      toast({
        title: "Collection Deleted",
        description: "Collection transaction has been successfully deleted.",
      });
      setDeleteCollectionId(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Collection",
        description: error.message || "Failed to delete collection. Please try again.",
      });
    },
  });

  const deleteDisbursement = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/disbursements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/disbursements"] });
      toast({
        title: "Disbursement Deleted",
        description: "Disbursement transaction has been successfully deleted.",
      });
      setDeleteDisbursementId(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Disbursement",
        description: error.message || "Failed to delete disbursement. Please try again.",
      });
    },
  });

  const filteredRevenues = revenues?.filter((r) => {
    const date = new Date(r.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  }) || [];

  const filteredExpenses = expenses?.filter((e) => {
    const date = new Date(e.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  }) || [];

  const totalReceipts = filteredRevenues.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const totalExpenditures = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const netBalance = totalReceipts - totalExpenditures;

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleExport = () => {
    alert("Export functionality would generate a formatted SRE report here");
  };

  return (
    <EncoderLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-poppins">
              Statement of Receipts & Expenditures (SRE)
            </h1>
            <p className="text-muted-foreground mt-1">View and encode financial statements for the selected period</p>
          </div>
          <Button className="gap-2" onClick={handleExport} data-testid="button-export">
            <Download className="h-4 w-4" />
            Export SRE
          </Button>
        </div>

      {/* View Toggle Buttons */}
      <div className="flex gap-4">
        <Button
          variant={activeView === 'collection' ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => setActiveView('collection')}
          data-testid="button-collection"
        >
          <TrendingUp className="h-4 w-4" />
          Collection
        </Button>
        <Button
          variant={activeView === 'disbursement' ? 'default' : 'outline'}
          className="flex-1 gap-2"
          onClick={() => setActiveView('disbursement')}
          data-testid="button-disbursement"
        >
          <TrendingDown className="h-4 w-4" />
          Disbursement
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <Calendar className="h-5 w-5" />
            Report Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Total Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-1" data-testid="text-total-receipts">
              {formatCurrency(totalReceipts)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Total Expenditures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive" data-testid="text-total-expenditures">
              {formatCurrency(totalExpenditures)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-chart-1' : 'text-destructive'}`} data-testid="text-net-balance">
              {formatCurrency(netBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Collection Form */}
      {activeView === 'collection' && (
        <div className="flex justify-end">
          <CollectionForm />
        </div>
      )}

      {/* Disbursement Form */}
      {activeView === 'disbursement' && (
        <div className="flex justify-end">
          <DisbursementForm />
        </div>
      )}

      {/* Collection Table */}
      {activeView === 'collection' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">Collection Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCollections ? (
              <div className="space-y-3">
                <div className="h-10 bg-muted rounded animate-pulse" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted/60 rounded animate-pulse" />
                ))}
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Nature of Collection</TableHead>
                  <TableHead>Payor</TableHead>
                  <TableHead>OR Number</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No collection transactions recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  collections?.map((collection) => (
                    <TableRow key={collection.id} data-testid={`row-collection-${collection.id}`}>
                      <TableCell className="font-medium" data-testid={`text-transaction-id-${collection.id}`}>
                        {collection.transactionId}
                      </TableCell>
                      <TableCell data-testid={`text-date-${collection.id}`}>
                        {format(new Date(collection.transactionDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell data-testid={`text-nature-${collection.id}`}>
                        {collection.natureOfCollection}
                      </TableCell>
                      <TableCell data-testid={`text-payor-${collection.id}`}>
                        {collection.payor}
                      </TableCell>
                      <TableCell data-testid={`text-or-number-${collection.id}`}>
                        {collection.orNumber}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-chart-1" data-testid={`text-amount-${collection.id}`}>
                        {formatCurrency(parseFloat(collection.amount))}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <CollectionForm
                            //collection={collection}
                            trigger={
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                data-testid={`button-edit-collection-${collection.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteCollectionId(collection.id)}
                            data-testid={`button-delete-collection-${collection.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="font-semibold">Total Collections</TableCell>
                  <TableCell className="text-right font-bold text-chart-1">
                    {formatCurrency(collections?.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legacy Receipts Table - Keep for reference */}
      {activeView === 'collection' && false && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">Collection (Receipts)</CardTitle>
          </CardHeader>
        <CardContent>
          {isLoadingRevenues ? (
            <div className="space-y-3">
              <div className="h-10 bg-muted rounded animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted/60 rounded animate-pulse" />
              ))}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRevenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No receipts in selected period
                  </TableCell>
                </TableRow>
              ) : (
                filteredRevenues.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell>{format(new Date(revenue.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{revenue.source}</TableCell>
                    <TableCell>{revenue.category}</TableCell>
                    <TableCell className="text-right font-semibold text-chart-1">
                      {formatCurrency(parseFloat(revenue.amount))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">Total Receipts</TableCell>
                <TableCell className="text-right font-bold text-chart-1">
                  {formatCurrency(totalReceipts)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disbursement Table */}
      {activeView === 'disbursement' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">Disbursement Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDisbursements ? (
              <div className="space-y-3">
                <div className="h-10 bg-muted rounded animate-pulse" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted/60 rounded animate-pulse" />
                ))}
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Nature of Disbursement</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead>DV Number</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disbursements?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No disbursement transactions recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  disbursements?.map((disbursement) => (
                    <TableRow key={disbursement.id} data-testid={`row-disbursement-${disbursement.id}`}>
                      <TableCell className="font-medium" data-testid={`text-transaction-id-${disbursement.id}`}>
                        {disbursement.transactionId}
                      </TableCell>
                      <TableCell data-testid={`text-date-${disbursement.id}`}>
                        {format(new Date(disbursement.transactionDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell data-testid={`text-nature-${disbursement.id}`}>
                        {disbursement.natureOfDisbursement}
                      </TableCell>
                      <TableCell data-testid={`text-payee-${disbursement.id}`}>
                        {disbursement.payee}
                      </TableCell>
                      <TableCell data-testid={`text-dv-number-${disbursement.id}`}>
                        {disbursement.dvNumber}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-destructive" data-testid={`text-amount-${disbursement.id}`}>
                        {formatCurrency(parseFloat(disbursement.amount))}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <DisbursementForm
                            //disbursement={disbursement}
                            trigger={
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                data-testid={`button-edit-disbursement-${disbursement.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setDeleteDisbursementId(disbursement.id)}
                            data-testid={`button-delete-disbursement-${disbursement.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="font-semibold">Total Disbursements</TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    {formatCurrency(disbursements?.reduce((sum, d) => sum + parseFloat(d.amount), 0) || 0)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legacy Disbursement Table - Keep for reference */}
      {activeView === 'disbursement' && false && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">Disbursement (Expenditures)</CardTitle>
          </CardHeader>
        <CardContent>
          {isLoadingExpenses ? (
            <div className="space-y-3">
              <div className="h-10 bg-muted rounded animate-pulse" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted/60 rounded animate-pulse" />
              ))}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No expenditures in selected period
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {formatCurrency(parseFloat(expense.amount))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-semibold">Total Expenditures</TableCell>
                <TableCell className="text-right font-bold text-destructive">
                  {formatCurrency(totalExpenditures)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Collection Confirmation Dialog */}
      <AlertDialog open={!!deleteCollectionId} onOpenChange={(open) => !open && setDeleteCollectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the collection transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-collection">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCollectionId && deleteCollection.mutate(deleteCollectionId)}
              data-testid="button-confirm-delete-collection"
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Disbursement Confirmation Dialog */}
      <AlertDialog open={!!deleteDisbursementId} onOpenChange={(open) => !open && setDeleteDisbursementId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Disbursement Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the disbursement transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-disbursement">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDisbursementId && deleteDisbursement.mutate(deleteDisbursementId)}
              data-testid="button-confirm-delete-disbursement"
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </EncoderLayout>
  );
}
