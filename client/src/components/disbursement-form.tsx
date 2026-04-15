import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Upload,
  Camera,
  X,
  File,
  Eye,
  Loader2,
  Trash2,
  Download,
} from "lucide-react";
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

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://barangayfinancetrackbackenddeployment.onrender.com/api";

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
  supporting_doc?: string;
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
  allocationId: number = 1,
  supportingDoc?: string
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
    or_number: frontendData.dvNumber,
    remarks: frontendData.remarks || "",
  };

  if (supportingDoc) {
    backendData.supporting_doc = supportingDoc;
  }

  if (disbursementId) {
    backendData.id = parseInt(disbursementId);
  }

  return backendData;
}

/* ─── Supporting Doc Viewer Modal ─── */
function SupportingDocViewerModal({
  open,
  onClose,
  fileUrl,
  fileName,
}: {
  open: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName?: string;
}) {
  if (!open || !fileUrl) return null;

  const ext = fileUrl.split(".").pop()?.toLowerCase() ?? "";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext);
  const isPdf = ext === "pdf";
  const displayName = fileName || fileUrl.split("/").pop() || "document";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-3xl mx-auto rounded-lg flex flex-col overflow-hidden p-0"
        style={{ maxHeight: "92vh" }}
      >
        <DialogTitle className="sr-only">{displayName}</DialogTitle>
        <div className="flex items-center gap-3 px-5 py-3.5 border-b flex-shrink-0 pr-12">
          <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <p className="font-semibold text-sm leading-tight truncate flex-1">
            {displayName}
          </p>
          <a
            href={fileUrl}
            download={displayName}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-input bg-background hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {isImage ? (
            <div className="flex items-center justify-center w-full bg-muted/30 rounded-lg overflow-hidden min-h-[300px]">
              <img
                src={fileUrl}
                alt={displayName}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full rounded-lg overflow-hidden border" style={{ height: "75vh" }}>
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                title={displayName}
                className="w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 bg-muted/30 rounded-lg min-h-[200px]">
              <File className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                This file type cannot be previewed.
              </p>
              <a
                href={fileUrl}
                download={displayName}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Download file
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
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

  // Supporting doc state — single file
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Uploaded file_path returned from upload API
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  // Uploaded file_url for preview
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // Edit mode: existing doc from server
  const [existingDocUrl, setExistingDocUrl] = useState<string | null>(null);
  const [isFetchingDoc, setIsFetchingDoc] = useState(false);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);

  // Viewer modal
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
    return date.toISOString().split("T")[0];
  };

  // Reset all doc state
  const resetDocState = () => {
    if (pendingPreview?.startsWith("blob:")) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setUploadedFilePath(null);
    setUploadedFileUrl(null);
    setExistingDocUrl(null);
  };

  // Reset form when dialog closes
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
        resetDocState();
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

  // In edit mode: fetch existing supporting doc
  useEffect(() => {
    if (open && isEditMode && disbursement?.id) {
      setIsFetchingDoc(true);
      setExistingDocUrl(null);
      fetch(`${API_BASE_URL}/get-disbursement-docs/${disbursement.id}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data?.file_url) {
            setExistingDocUrl(data.file_url);
          }
        })
        .catch(() => {})
        .finally(() => setIsFetchingDoc(false));
    }
  }, [open, isEditMode, disbursement?.id]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (pendingPreview?.startsWith("blob:")) URL.revokeObjectURL(pendingPreview);
    };
  }, [pendingPreview]);

  // Generate transaction ID on open (create mode)
  useEffect(() => {
    if (open && !isEditMode) {
      setIdGenerationError(false);
      apiCall<{ transaction_id?: string; transactionId?: string; div_number?: string | number }>(
        api.disbursements.generateId
      )
        .then((result) => {
          if (result.error) throw new Error(result.error);
          const data = result.data as any;
          const txId = data?.transaction_id ?? data?.transactionId;
          const dvNumber = data?.div_number;
          if (txId) {
            setTransactionId(txId);
            form.setValue("transactionId", txId);
          }
          if (dvNumber) form.setValue("dvNumber", String(dvNumber));
        })
        .catch(() => {
          setIdGenerationError(true);
          toast({
            variant: "destructive",
            title: "Error Generating Transaction ID",
            description: "Unable to generate transaction ID. Please close and reopen the form.",
          });
        });
    }
  }, [open, isEditMode, form, toast]);

  /* ── File selection handler ── */
  const handleFileSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0]; // single file only

    // Revoke previous preview
    if (pendingPreview?.startsWith("blob:")) URL.revokeObjectURL(pendingPreview);

    const isImage = file.type.startsWith("image/");
    const preview = isImage ? URL.createObjectURL(file) : null;

    setPendingFile(file);
    setPendingPreview(preview);
    setUploadedFilePath(null);
    setUploadedFileUrl(null);

    // Auto-upload immediately
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_BASE_URL}/upload-disbursement-docs`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || "Upload failed");
      }

      const data = await response.json();
      // data = { file_path, file_url, message }
      setUploadedFilePath(data.file_path);
      setUploadedFileUrl(data.file_url);

      toast({ title: "File Uploaded", description: `"${file.name}" attached successfully.` });
    } catch (error: any) {
      setPendingFile(null);
      setPendingPreview(null);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Could not upload file. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  /* ── Remove pending file ── */
  const removePendingFile = () => {
    if (pendingPreview?.startsWith("blob:")) URL.revokeObjectURL(pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    setUploadedFilePath(null);
    setUploadedFileUrl(null);
  };

  /* ── Delete existing doc (edit mode) ── */
  const handleDeleteExistingDoc = async () => {
    if (!disbursement?.id) return;
    const confirmed = confirm("Are you sure you want to remove this supporting document?");
    if (!confirmed) return;

    setIsDeletingDoc(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/delete-disbursement-docs/${disbursement.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || "Delete failed");
      }
      setExistingDocUrl(null);
      toast({ title: "Document Removed", description: "Supporting document deleted." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete document.",
      });
    } finally {
      setIsDeletingDoc(false);
    }
  };

  /* ── View doc ── */
  const handleViewDoc = (url: string) => {
    setViewerUrl(url);
    setViewerOpen(true);
  };

  /* ── Save mutation ── */
  const saveDisbursement = useMutation({
    mutationFn: async (data: InsertDisbursement) => {
      // Determine supporting_doc value
      const supportingDoc = uploadedFilePath ?? undefined;

      const backendData = frontendToBackend(
        data,
        currentUserId,
        isEditMode ? disbursement.id : undefined,
        1,
        supportingDoc
      );

      const endpoint = isEditMode ? api.disbursements.update : api.disbursements.create;
      const method = isEditMode ? "PUT" : "POST";

      const result = await apiCall(endpoint, {
        method,
        body: JSON.stringify(backendData),
      });

      if (result.error) throw new Error(result.error);
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
      if (!isEditMode) form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: isEditMode ? "Error Updating Disbursement" : "Error Adding Disbursement",
        description: error.message || `Failed to ${isEditMode ? "update" : "record"} disbursement.`,
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

  /* ─── Determine what to show in the supporting doc section ─── */
  const showExistingDoc = isEditMode && !!existingDocUrl && !pendingFile;
  const showPendingDoc = !!pendingFile;
  const showUploadButtons = !showPendingDoc && !showExistingDoc;

  return (
    <>
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
              {isEditMode ? "Edit Disbursement Transaction" : "Add Disbursement Transaction"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the financial disbursement transaction details."
                : "Record a new financial disbursement transaction with auto-generated transaction ID."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => saveDisbursement.mutate(data))}
              className="space-y-4"
            >
              {/* Transaction ID */}
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
                      <Input type="date" {...field} data-testid="input-transaction-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nature of Disbursement */}
              <FormField
                control={form.control}
                name="natureOfDisbursement"
                rules={{ required: "Nature of disbursement is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nature of Disbursement</FormLabel>
                    <Select
                      onValueChange={(value) => { field.onChange(value); handleNatureChange(value); }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-nature">
                          <SelectValue placeholder="Select nature of disbursement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        <div className="px-2 py-1.5 text-sm font-semibold bg-muted">A. Personal Services</div>
                        {natureOptions.filter((opt) => opt.category === "A. Personal Services").map((opt) => (
                          <SelectItem key={`${opt.category}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">B. Maintenance and Other Operating Expenses (MOOE)</div>
                        {natureOptions.filter((opt) => opt.category === "B. Maintenance and Other Operating Expenses (MOOE)").map((opt) => (
                          <SelectItem key={`${opt.category}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">C. Capital Outlay</div>
                        {natureOptions.filter((opt) => opt.category === "C. Capital Outlay").map((opt) => (
                          <SelectItem key={`${opt.category}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">D. Special Purpose Appropriations (SPA)</div>
                        {natureOptions.filter((opt) => opt.category === "D. Special Purpose Appropriations (SPA)").map((opt) => (
                          <SelectItem key={`${opt.category}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">E. Basic Services - SOCIAL SERVICES</div>
                        <div className="px-4 py-1 text-xs font-medium text-muted-foreground">Day Care Services</div>
                        {natureOptions.filter((opt) => opt.subcategory === "Day Care Services").map((opt) => (
                          <SelectItem key={`${opt.subcategory}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-4 py-1 text-xs font-medium text-muted-foreground">Health and Nutrition Services</div>
                        {natureOptions.filter((opt) => opt.subcategory === "Health and Nutrition Services").map((opt) => (
                          <SelectItem key={`${opt.subcategory}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-4 py-1 text-xs font-medium text-muted-foreground">Peace and Order Services</div>
                        {natureOptions.filter((opt) => opt.subcategory === "Peace and Order Services").map((opt) => (
                          <SelectItem key={`${opt.subcategory}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-4 py-1 text-xs font-medium text-muted-foreground">Katarungang Pambarangay Services</div>
                        {natureOptions.filter((opt) => opt.subcategory === "Katarungang Pambarangay Services").map((opt) => (
                          <SelectItem key={`${opt.subcategory}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">F. Infrastructure Projects - ECONOMIC SERVICES</div>
                        {natureOptions.filter((opt) => opt.category === "F. Infrastructure Projects - 20% Development Fund - ECONOMIC SERVICES").map((opt) => (
                          <SelectItem key={`${opt.category}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-2 py-1.5 text-sm font-semibold bg-muted mt-2">G. Other Services</div>
                        <div className="px-4 py-1 text-xs font-medium text-muted-foreground">QRF Activities</div>
                        {natureOptions.filter((opt) => opt.subcategory === "Quick Response Fund (QRF) Activities").map((opt) => (
                          <SelectItem key={`${opt.subcategory}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                        <div className="px-4 py-1 text-xs font-medium text-muted-foreground">Other Community Services</div>
                        {natureOptions.filter((opt) => opt.subcategory === "Other Community Services").map((opt) => (
                          <SelectItem key={`${opt.subcategory}-${opt.nature}`} value={opt.nature} className="pl-8">{opt.nature}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Program Description */}
              <FormField
                control={form.control}
                name="programDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program/Project/Activity Description (Optional)</FormLabel>
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
                          <SelectItem key={source} value={source}>{source}</SelectItem>
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
                  validate: (value) => parseFloat(value) > 0 || "Amount must be greater than 0",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₱)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-amount" />
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
                      <Input placeholder="e.g., Day Care Worker - Maria Santos" {...field} data-testid="input-payee" />
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
              <div className="space-y-2" data-testid="section-dv-supporting-document">
                <div className="flex items-center gap-2">
                  <FormLabel className="mb-0">DV Supporting Document</FormLabel>
                  <span className="text-xs text-muted-foreground font-normal">(Optional · 1 file)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Attach a photo or file of the supporting document (receipt, voucher, etc.).
                </p>

                {/* Hidden inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  data-testid="input-dv-supporting-file"
                  onChange={(e) => handleFileSelected(e.target.files)}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  data-testid="input-dv-supporting-camera"
                  onChange={(e) => handleFileSelected(e.target.files)}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
                />

                {/* Loading existing doc */}
                {isEditMode && isFetchingDoc && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading existing document...
                  </div>
                )}

                {/* Upload buttons — shown when no file attached */}
                {showUploadButtons && !isFetchingDoc && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
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
                      disabled={isUploading}
                      data-testid="button-dv-camera"
                    >
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>
                )}

                {/* Uploading spinner */}
                {isUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading…
                  </div>
                )}

                {/* Pending file preview (newly selected) */}
                {showPendingDoc && !isUploading && (
                  <div className="relative border rounded-lg overflow-hidden bg-muted/40 group w-full max-w-xs" data-testid="dv-pending-file">
                    {pendingPreview ? (
                      <img
                        src={pendingPreview}
                        alt={pendingFile?.name}
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 gap-1 px-2 py-2">
                        <File className="h-7 w-7 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground text-center truncate w-full px-2">
                          {pendingFile?.name}
                        </span>
                      </div>
                    )}

                    {/* File name overlay for images */}
                    {pendingPreview && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                        <span className="text-xs text-white truncate block">{pendingFile?.name}</span>
                      </div>
                    )}

                    {/* Actions overlay */}
                    <div className="absolute top-1 right-1 flex gap-1">
                      {(uploadedFileUrl || pendingPreview) && (
                        <button
                          type="button"
                          onClick={() => handleViewDoc(uploadedFileUrl || pendingPreview || "")}
                          className="bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                          aria-label="View file"
                          data-testid="button-view-pending-file"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={removePendingFile}
                        className="bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition-colors"
                        aria-label="Remove file"
                        data-testid="button-remove-pending-file"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Upload status badge */}
                    {uploadedFilePath && (
                      <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                        ✓ Uploaded
                      </div>
                    )}
                  </div>
                )}

                {/* Existing doc (edit mode, from server) */}
                {showExistingDoc && !isFetchingDoc && (
                  <div
                    className="flex items-center gap-3 border rounded-lg p-3 bg-muted/30"
                    data-testid="dv-existing-file"
                  >
                    <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {existingDocUrl?.split("/").pop()}
                    </span>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 gap-1 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => handleViewDoc(existingDocUrl!)}
                        data-testid="button-view-existing-doc"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-xs">View</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 gap-1 text-destructive hover:bg-destructive/10"
                        onClick={handleDeleteExistingDoc}
                        disabled={isDeletingDoc}
                        data-testid="button-delete-existing-doc"
                      >
                        {isDeletingDoc
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />
                        }
                        <span className="hidden sm:inline text-xs">
                          {isDeletingDoc ? "Removing…" : "Remove"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 gap-1 text-blue-600 hover:bg-blue-50"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        data-testid="button-replace-existing-doc"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-xs">Replace</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replace button shown if existing doc but user wants new one */}
                {isEditMode && existingDocUrl && pendingFile && !isUploading && (
                  <p className="text-xs text-amber-600">
                    ⚠ A new file has been selected. It will replace the existing document when you save.
                  </p>
                )}
              </div>
              {/* ─── End DV Supporting Document ─── */}

              {/* Remarks */}
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
                    isUploading ||
                    (!isEditMode && (idGenerationError || !transactionId))
                  }
                  data-testid={isEditMode ? "button-update" : "button-submit"}
                >
                  {saveDisbursement.isPending
                    ? isEditMode ? "Updating..." : "Adding..."
                    : isEditMode ? "Update Disbursement" : "Add Disbursement"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Supporting Doc Viewer */}
      <SupportingDocViewerModal
        open={viewerOpen}
        onClose={() => { setViewerOpen(false); setViewerUrl(null); }}
        fileUrl={viewerUrl}
      />
    </>
  );
}