import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Plus, Edit } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

import { queryClient, apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { getAllNatureOptions, FUND_SOURCES } from "../lib/collectionCategories";


import { format } from "date-fns";

type InsertCollection = {
  transactionId: string;
  transactionDate: Date | null;
  natureOfCollection: string;
  category: string;
  subcategory: string;
  purpose?: string;
  fundSource: string;
  amount: string;
  payor: string;
  orNumber: string;
  remarks?: string;
};

type Collection = InsertCollection & {
  id: number;
};


interface CollectionFormProps {
  collection?: Collection;
  trigger?: React.ReactNode;
}

export function CollectionForm({ collection, trigger }: CollectionFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState("");
  const [idGenerationError, setIdGenerationError] = useState(false);
  const isEditMode = !!collection;

  const natureOptions = getAllNatureOptions();

const form = useForm<InsertCollection>({
  defaultValues: collection
    ? {
        transactionId: collection.transactionId,
        //transactionDate: new Date(collection.transactionDate),
        natureOfCollection: collection.natureOfCollection,
        category: collection.category,
        subcategory: collection.subcategory,
        purpose: collection.purpose || "",
        fundSource: collection.fundSource,
        amount: collection.amount,
        payor: collection.payor,
        orNumber: collection.orNumber,
        remarks: collection.remarks || "",
      }
    : {
        transactionId: "",
        transactionDate: new Date(),
        natureOfCollection: "",
        category: "",
        subcategory: "",
        purpose: "",
        fundSource: "General Fund",
        amount: "0",
        payor: "",
        orNumber: "",
        remarks: "",
      },
});


  // Reset form when dialog closes or collection prop changes
  useEffect(() => {
    if (!open) {
      form.reset();
    } else if (collection) {
      // Reset form with collection data when editing
      form.reset({
        transactionId: collection.transactionId,
        //transactionDate: new Date(collection.transactionDate),
        natureOfCollection: collection.natureOfCollection,
        category: collection.category,
        subcategory: collection.subcategory,
        purpose: collection.purpose || "",
        fundSource: collection.fundSource,
        amount: collection.amount,
        payor: collection.payor,
        orNumber: collection.orNumber,
        remarks: collection.remarks || "",
      });
    }
  }, [open, collection, form]);

  // Fetch new transaction ID when dialog opens (only for create mode)
  useEffect(() => {
    if (open && !isEditMode) {
      setIdGenerationError(false);
      fetch("/api/collections/generate-id")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to generate ID");
          return res.json();
        })
        .then((data) => {
          setTransactionId(data.transactionId);
          form.setValue("transactionId", data.transactionId);
        })
        .catch((error) => {
          setIdGenerationError(true);
          toast({
            variant: "destructive",
            title: "Error Generating Transaction ID",
            description:
              "Unable to generate transaction ID. Please close and reopen the form.",
          });
        });
    }
  }, [open, isEditMode, form, toast]);

  const saveCollection = useMutation({
    mutationFn: async (data: InsertCollection) => {
      if (isEditMode) {
        return apiRequest("PATCH", `/api/collections/${collection.id}`, data);
      } else {
        return apiRequest("POST", "/api/collections", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collections"] });
      toast({
        title: isEditMode ? "Collection Updated" : "Collection Added",
        description: isEditMode
          ? "Collection transaction has been successfully updated."
          : "Collection transaction has been successfully recorded.",
      });
      setOpen(false);
      if (!isEditMode) {
        form.reset();
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: isEditMode
          ? "Error Updating Collection"
          : "Error Adding Collection",
        description:
          error.message ||
          `Failed to ${isEditMode ? "update" : "record"} collection. Please try again.`,
      });
    },
  });

  const handleNatureChange = (value: string) => {
    const selected = natureOptions.find((opt) => opt.nature === value);
    if (selected) {
      form.setValue("natureOfCollection", selected.nature);
      form.setValue("category", selected.category);
      form.setValue("subcategory", selected.subcategory);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2" data-testid="button-add-collection">
            <Plus className="h-4 w-4" />
            Add Collection
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            {isEditMode
              ? "Edit Collection Transaction"
              : "Add Collection Transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the financial collection transaction details."
              : "Record a new financial collection transaction with auto-generated transaction ID."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => saveCollection.mutate(data))}
            className="space-y-4"
          >
            {/* Transaction ID - Auto-generated, Read-only */}
            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      className="bg-muted"
                      placeholder="Generating..."
                      data-testid="input-transaction-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Transaction Date */}
            <FormField
              control={form.control}
              name="transactionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? format(new Date(field.value), "yyyy-MM-dd")
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : null,
                        )
                      }
                      data-testid="input-transaction-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nature of Collection - Dropdown */}
            <FormField
              control={form.control}
              name="natureOfCollection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nature of Collection</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleNatureChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-nature">
                        <SelectValue placeholder="Select nature of collection" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted">
                        EXTERNAL SOURCES: TAX REVENUE
                      </div>
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Share from Local Taxes
                      </div>
                      {natureOptions
                        .filter(
                          (opt) => opt.subcategory === "Share from Local Taxes",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={opt.nature}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Share from National Taxes
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.subcategory === "Share from National Taxes",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={opt.nature}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Assistance and Subsidy
                      </div>
                      {natureOptions
                        .filter(
                          (opt) => opt.subcategory === "Assistance and Subsidy",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={opt.nature}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}

                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">
                        INTERNAL SOURCES: NON TAX REVENUE
                      </div>
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Service and Business Income
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.subcategory === "Service and Business Income",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={opt.nature}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}

                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">
                        NON-INCOME RECEIPTS
                      </div>
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Other Receipts
                      </div>
                      {natureOptions
                        .filter((opt) => opt.subcategory === "Other Receipts")
                        .map((opt) => (
                          <SelectItem
                            key={opt.nature}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purpose/Particulars/Description - Optional */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Purpose/Particulars/Description (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter purpose or description"
                      data-testid="input-purpose"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fund Source */}
            <FormField
              control={form.control}
              name="fundSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fund Source</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-fund-source">
                        <SelectValue placeholder="Select fund source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FUND_SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₱)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      data-testid="input-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payor */}
            <FormField
              control={form.control}
              name="payor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Municipal Treasury"
                      {...field}
                      data-testid="input-payor"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* OR Number */}
            <FormField
              control={form.control}
              name="orNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OR Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 13502301"
                      {...field}
                      data-testid="input-or-number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Remarks - Optional */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="e.g., 2 copies of barangay clearance fees"
                      data-testid="input-remarks"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  saveCollection.isPending ||
                  (!isEditMode && (idGenerationError || !transactionId))
                }
                data-testid={isEditMode ? "button-update" : "button-submit"}
              >
                {saveCollection.isPending
                  ? isEditMode
                    ? "Updating..."
                    : "Adding..."
                  : isEditMode
                    ? "Update Collection"
                    : "Add Collection"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
