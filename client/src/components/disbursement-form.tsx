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

import { queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import {
  getAllDisbursementNatureOptions,
  DISBURSEMENT_FUND_SOURCES,
} from "../lib/disbursementCategories";
import { format } from "date-fns";
import { api, apiCall } from "../utils/api";

// Backend types
type BackendDisbursement = {
  id?: number;
  created_by: number;
  allocation_id: number;
  transaction_id: string;
  transaction_date: string;
  nature_of_disbursement: string;
  category: string;
  subcategory: string;
  program_description?: string;
  fund_source: string;
  amount: number;
  payee: string;
  dv_number: string;
  remarks?: string;
};

// Frontend types
type InsertDisbursement = {
  transactionId: string;
  transactionDate: string;
  natureOfDisbursement: string;
  category: string;
  subcategory: string;
  programDescription?: string;
  fundSource: string;
  amount: string;
  payee: string;
  dvNumber: string;
  remarks?: string;
};

type Disbursement = InsertDisbursement & {
  id: string;
};

interface DisbursementFormProps {
  disbursement?: Disbursement;
  trigger?: React.ReactNode;
}

// Convert frontend to backend format
function frontendToBackend(
  frontendData: InsertDisbursement,
  createdBy: number,
  disbursementId?: string,
  allocationId: number = 1
): BackendDisbursement {
  const backendData: BackendDisbursement = {
    created_by: createdBy,
    allocation_id: allocationId,
    transaction_id: frontendData.transactionId,
    transaction_date: frontendData.transactionDate,
    nature_of_disbursement: frontendData.natureOfDisbursement,
    category: frontendData.category,
    subcategory: frontendData.subcategory,
    program_description: frontendData.programDescription || "",
    fund_source: frontendData.fundSource,
    amount: parseFloat(frontendData.amount),
    payee: frontendData.payee,
    dv_number: frontendData.dvNumber,
    remarks: frontendData.remarks || "",
  };

  if (disbursementId) {
    backendData.id = parseInt(disbursementId);
  }

  return backendData;
}

export function DisbursementForm({
  disbursement,
  trigger,
}: DisbursementFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [transactionId, setTransactionId] = useState("");
  const [idGenerationError, setIdGenerationError] = useState(false);
  const isEditMode = !!disbursement;

  // TODO: Get this from your auth context/session
  const currentUserId = 1;

  const natureOptions = getAllDisbursementNatureOptions();

  const form = useForm<InsertDisbursement>({
    defaultValues: disbursement
      ? {
          transactionId: disbursement.transactionId,
          transactionDate: disbursement.transactionDate,
          natureOfDisbursement: disbursement.natureOfDisbursement,
          category: disbursement.category,
          subcategory: disbursement.subcategory,
          programDescription: disbursement.programDescription || "",
          fundSource: disbursement.fundSource,
          amount: disbursement.amount,
          payee: disbursement.payee,
          dvNumber: disbursement.dvNumber,
          remarks: disbursement.remarks || "",
        }
      : {
          transactionId: "",
          transactionDate: format(new Date(), "yyyy-MM-dd"),
          natureOfDisbursement: "",
          category: "",
          subcategory: "",
          programDescription: "",
          fundSource: "General Fund",
          amount: "0",
          payee: "",
          dvNumber: "",
          remarks: "",
        },
  });

  const toDateInputValue = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0]; // yyyy-MM-dd
};

  // Reset form when dialog closes or disbursement prop changes
  useEffect(() => {
    if (!open) {
      if (!isEditMode) {
        form.reset({
          transactionId: "",
          transactionDate: format(new Date(), "yyyy-MM-dd"),
          natureOfDisbursement: "",
          category: "",
          subcategory: "",
          programDescription: "",
          fundSource: "General Fund",
          amount: "0",
          payee: "",
          dvNumber: "",
          remarks: "",
        });
      }
    } else if (disbursement) {
      form.reset({
        transactionId: disbursement.transactionId,
        transactionDate: toDateInputValue(disbursement.transactionDate),
        natureOfDisbursement: disbursement.natureOfDisbursement,
        category: disbursement.category,
        subcategory: disbursement.subcategory,
        programDescription: disbursement.programDescription || "",
        fundSource: disbursement.fundSource,
        amount: disbursement.amount,
        payee: disbursement.payee,
        dvNumber: disbursement.dvNumber,
        remarks: disbursement.remarks || "",
      });
    }
  }, [open, disbursement, form, isEditMode]);

  // Fetch new transaction ID when dialog opens (only for create mode)
  useEffect(() => {
    if (open && !isEditMode) {
      setIdGenerationError(false);
      apiCall<{ transactionId: string }>(api.disbursements.generateId)
        .then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }
          const id = result.data?.transactionId ?? (result.data as any)?.transaction_id;
          if (id) {
            setTransactionId(id);
            form.setValue("transactionId", id);
          }
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

  const saveDisbursement = useMutation({
    mutationFn: async (data: InsertDisbursement) => {
      const backendData = frontendToBackend(
        data,
        currentUserId,
        isEditMode ? disbursement.id : undefined
      );

      const endpoint = isEditMode ? api.disbursements.update : api.disbursements.create;
      const method = isEditMode ? "PUT" : "POST";

      const result = await apiCall(endpoint, {
        method,
        body: JSON.stringify(backendData),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
      toast({
        title: isEditMode ? "Disbursement Updated" : "Disbursement Added",
        description: isEditMode
          ? "Disbursement transaction has been successfully updated."
          : "Disbursement transaction has been successfully recorded.",
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
          ? "Error Updating Disbursement"
          : "Error Adding Disbursement",
        description:
          error.message ||
          `Failed to ${isEditMode ? "update" : "record"} disbursement. Please try again.`,
      });
    },
  });

  const handleNatureChange = (value: string) => {
    const selected = natureOptions.find((opt) => opt.nature === value);
    if (selected) {
      form.setValue("natureOfDisbursement", selected.nature);
      form.setValue("category", selected.category);
      form.setValue("subcategory", selected.subcategory);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2" data-testid="button-add-disbursement">
            <Plus className="h-4 w-4" />
            Add Disbursement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            {isEditMode
              ? "Edit Disbursement Transaction"
              : "Add Disbursement Transaction"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the financial disbursement transaction details."
              : "Record a new financial disbursement transaction with auto-generated transaction ID."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              saveDisbursement.mutate(data),
            )}
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
                      {...field}
                      data-testid="input-transaction-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nature of Disbursement - Hierarchical Dropdown */}
            <FormField
              control={form.control}
              name="natureOfDisbursement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nature of Disbursement</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleNatureChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-nature">
                        <SelectValue placeholder="Select nature of disbursement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {/* A. Personal Services */}
                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted">
                        A. Personal Services
                      </div>
                      {natureOptions
                        .filter(
                          (opt) => opt.category === "A. Personal Services",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.category}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}

                      {/* B. MOOE */}
                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">
                        B. Maintenance and Other Operating Expenses (MOOE)
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.category ===
                            "B. Maintenance and Other Operating Expenses (MOOE)",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.category}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}

                      {/* C. Capital Outlay */}
                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">
                        C. Capital Outlay
                      </div>
                      {natureOptions
                        .filter((opt) => opt.category === "C. Capital Outlay")
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.category}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}

                      {/* D. SPA */}
                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">
                        D. Special Purpose Appropriations (SPA)
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.category ===
                            "D. Special Purpose Appropriations (SPA)",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.category}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}

                      {/* E. Social Services */}
                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">
                        E. Basic Services - SOCIAL SERVICES
                      </div>
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Day Care Services
                      </div>
                      {natureOptions
                        .filter(
                          (opt) => opt.subcategory === "Day Care Services",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.subcategory}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Health and Nutrition Services
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.subcategory === "Health and Nutrition Services",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.subcategory}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Peace and Order Services
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.subcategory === "Peace and Order Services",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.subcategory}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Katarungang Pambarangay Services
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.subcategory ===
                            "Katarungang Pambarangay Services",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.subcategory}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}

                      {/* F. Economic Services */}
                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">
                        F. Infrastructure Projects - ECONOMIC SERVICES
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.category ===
                            "F. Infrastructure Projects - 20% Development Fund - ECONOMIC SERVICES",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.category}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}

                      {/* G. Other Services */}
                      <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">
                        G. Other Services
                      </div>
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        QRF Activities
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.subcategory ===
                            "Quick Response Fund (QRF) Activities",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.subcategory}-${opt.nature}`}
                            value={opt.nature}
                            className="pl-8"
                          >
                            {opt.nature}
                          </SelectItem>
                        ))}
                      <div className="px-4 py-1 text-xs font-medium text-muted-foreground">
                        Other Community Services
                      </div>
                      {natureOptions
                        .filter(
                          (opt) =>
                            opt.subcategory === "Other Community Services",
                        )
                        .map((opt) => (
                          <SelectItem
                            key={`${opt.subcategory}-${opt.nature}`}
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

            {/* Program/Project/Activity Description - Optional */}
            <FormField
              control={form.control}
              name="programDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Program/Project/Activity Description (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="e.g., Conduct of day care sessions - hon of day care workers"
                      data-testid="input-program-description"
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
                      {DISBURSEMENT_FUND_SOURCES.map((source) => (
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

            {/* Payee */}
            <FormField
              control={form.control}
              name="payee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payee</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Day Care Worker - Maria Santos"
                      {...field}
                      data-testid="input-payee"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DV Number */}
            <FormField
              control={form.control}
              name="dvNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DV Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 2025-001"
                      {...field}
                      data-testid="input-dv-number"
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
                      placeholder="Additional notes or comments"
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
                  saveDisbursement.isPending ||
                  (!isEditMode && (idGenerationError || !transactionId))
                }
                data-testid={isEditMode ? "button-update" : "button-submit"}
              >
                {saveDisbursement.isPending
                  ? isEditMode
                    ? "Updating..."
                    : "Adding..."
                  : isEditMode
                    ? "Update Disbursement"
                    : "Add Disbursement"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}