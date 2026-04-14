import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Plus, Edit, Upload, Camera, X, FileImage, File } from "lucide-react";
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
  or_number: string;
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

// DV Supporting Document file type
type DVSupportingFile = {
  file: File;
  preview: string; // object URL or data URL for images
  isImage: boolean;
};

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
    or_number: frontendData.dvNumber, // ✅ CORRECT
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

  // DV Supporting Document state
  const [dvSupportingFiles, setDvSupportingFiles] = useState<DVSupportingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // TODO: Get this from your auth context/session
  const currentUserId = 1;

  const natureOptions = getAllDisbursementNatureOptions();

  const form = useForm<InsertDisbursement>({
    mode: "onSubmit",
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
        // Clear supporting documents on close
        dvSupportingFiles.forEach((f) => URL.revokeObjectURL(f.preview));
        setDvSupportingFiles([]);
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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      dvSupportingFiles.forEach((f) => {
        if (f.preview.startsWith("blob:")) URL.revokeObjectURL(f.preview);
      });
    };
  }, [dvSupportingFiles]);

  // Fetch new transaction ID when dialog opens (only for create mode)
  useEffect(() => {
    if (open && !isEditMode) {
      setIdGenerationError(false);

      apiCall<{
        transaction_id?: string;
        transactionId?: string;
        div_number?: string | number;
      }>(api.disbursements.generateId)
        .then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }

          const data = result.data as any;

          const transactionId =
            data?.transaction_id ?? data?.transactionId;

          const dvNumber = data?.div_number;

          if (transactionId) {
            setTransactionId(transactionId);
            form.setValue("transactionId", transactionId);
          }

          if (dvNumber) {
            form.setValue("dvNumber", String(dvNumber));
          }
        })
        .catch(() => {
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

  // Handle file selection (upload or camera)
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: DVSupportingFile[] = [];

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const preview = isImage ? URL.createObjectURL(file) : "";
      newFiles.push({ file, preview, isImage });
    });

    setDvSupportingFiles((prev) => [...prev, ...newFiles]);
  };

  // Remove a supporting document
  const removeFile = (index: number) => {
    setDvSupportingFiles((prev) => {
      const toRemove = prev[index];
      if (toRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(toRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const saveDisbursement = useMutation({
    mutationFn: async (data: InsertDisbursement) => {
      const backendData = frontendToBackend(
        data,
        currentUserId,
        isEditMode ? disbursement.id : undefined
      );

      const endpoint = isEditMode ? api.disbursements.update : api.disbursements.create;
      const method = isEditMode ? "PUT" : "POST";

      // If there are supporting documents, use FormData to include files
      if (dvSupportingFiles.length > 0) {
        const formData = new FormData();
        formData.append("data", JSON.stringify(backendData));
        dvSupportingFiles.forEach((f, idx) => {
          formData.append(`supporting_document_${idx}`, f.file, f.file.name);
        });

        const result = await apiCall(endpoint, {
          method,
          body: formData,
          // Do NOT set Content-Type header — browser sets it with boundary automatically
        });

        if (result.error) throw new Error(result.error);
        return result.data;
      }

      // No files — send JSON as before
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
              rules={{ required: "Transaction ID is required" }}
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
              rules={{ required: "Transaction date is required" }}
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
              rules={{ required: "Nature of disbursement is required" }}
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
              rules={{ required: "Fund source is required" }}
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
              rules={{
                required: "Amount is required",
                validate: (value) =>
                  parseFloat(value) > 0 || "Amount must be greater than 0",
              }}
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
              rules={{ required: "Payee is required" }}
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
              rules={{ required: "DV Number is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DV Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 2025-001"
                      {...field}
                      readOnly={!isEditMode}
                      className={!isEditMode ? "bg-muted" : ""}
                      data-testid="input-dv-number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ─── DV Supporting Document ─── */}
            <div className="space-y-3" data-testid="section-dv-supporting-document">

                <FormLabel>DV Supporting Document{" "}</FormLabel>
                <span className="text-muted-foreground font-normal">(Optional)</span>

              <p className="text-xs text-muted-foreground">
                Attach photos or files of the supporting document (receipts, vouchers, etc.).
              </p>

              {/* Upload / Camera buttons */}
              <div className="flex gap-2 flex-wrap">
                {/* Hidden file input for general upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  multiple
                  className="hidden"
                  data-testid="input-dv-supporting-file"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  // Reset value so same file can be re-selected
                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                />

                {/* Hidden camera input — capture="environment" opens rear camera on mobile */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  data-testid="input-dv-supporting-camera"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-dv-upload"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => cameraInputRef.current?.click()}
                  data-testid="button-dv-camera"
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>

              {/* Preview list */}
              {dvSupportingFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-3">
                  {dvSupportingFiles.map((f, idx) => (
                    <div
                      key={idx}
                      className="relative group border rounded-md overflow-hidden bg-muted"
                      data-testid={`dv-supporting-file-${idx}`}
                    >
                      {f.isImage ? (
                        <img
                          src={f.preview}
                          alt={f.file.name}
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-24 gap-1 px-2">
                          <File className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground text-center truncate w-full">
                            {f.file.name}
                          </span>
                        </div>
                      )}

                      {/* File name overlay for images */}
                      {f.isImage && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
                          <span className="text-xs text-white truncate block">
                            {f.file.name}
                          </span>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                        aria-label={`Remove ${f.file.name}`}
                        data-testid={`button-remove-file-${idx}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* ─── End DV Supporting Document ─── */}

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