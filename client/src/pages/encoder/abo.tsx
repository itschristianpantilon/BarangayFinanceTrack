import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Upload,
  Eye,
  Loader2,
  Download,
  FileText,
  File,
} from "lucide-react";
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
  TableFooter,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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
import {
  BudgetEntryForm,
  BudgetEntry,
  InsertBudgetEntry,
} from "../../components/budget-entry-form";
import { AboExcelUploadDialog } from "../../components/excel-upload-dialog";

import { queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format, isValid, parseISO } from "date-fns";
import { EncoderLayout } from "../../components/encoder-layout";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://barangayfinancetrackbackenddeployment.onrender.com/api";

const ROWS_PER_PAGE = 10;

/* -------------------- TYPES -------------------- */

type BackendBudgetEntry = {
  id: string;
  transaction_id: string;
  transaction_date: string;
  category: string;
  subcategory: string;
  payee: string;
  dv_number: string;
  amount: number;
  fund_source: string;
  expenditure_program: string;
  program_description?: string;
  remarks?: string;
  allocation_id: number;
  created_by: number;
};

type BackendInsertBudgetEntry = {
  created_by: number;
  transaction_id: string;
  transaction_date: string;
  category: string;
  subcategory: string;
  amount: number;
  fund_source: string;
  payee: string;
  dv_number: string;
  expenditure_program: string;
  program_description?: string;
  remarks?: string;
  allocation_id: number;
};

/* -------------------- HELPERS -------------------- */

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "API request failed");
  }
  return response.json();
}

function backendToFrontend(backendEntry: BackendBudgetEntry): BudgetEntry {
  return {
    id: backendEntry.id,
    transactionId: backendEntry.transaction_id,
    transactionDate: backendEntry.transaction_date,
    category: backendEntry.category,
    subcategory: backendEntry.subcategory,
    payee: backendEntry.payee,
    dvNumber: backendEntry.dv_number,
    amount: backendEntry.amount.toString(),
    fundSource: backendEntry.fund_source,
    expenditureProgram: backendEntry.expenditure_program,
    programDescription: backendEntry.program_description,
    remarks: backendEntry.remarks,
  };
}

function frontendToBackend(
  frontendEntry: InsertBudgetEntry,
  createdBy: number,
  allocationId: number = 1,
  entryId?: string,
): BackendInsertBudgetEntry & { id?: string } {
  const backendData: BackendInsertBudgetEntry = {
    created_by: createdBy,
    transaction_id: frontendEntry.transactionId,
    transaction_date: frontendEntry.transactionDate,
    category: frontendEntry.category,
    subcategory: frontendEntry.subcategory,
    amount: parseFloat(frontendEntry.amount),
    fund_source: frontendEntry.fundSource,
    payee: frontendEntry.payee,
    dv_number: frontendEntry.dvNumber,
    expenditure_program: frontendEntry.expenditureProgram,
    program_description: frontendEntry.programDescription || "",
    remarks: frontendEntry.remarks || "",
    allocation_id: allocationId,
  };
  if (entryId) return { ...backendData, id: entryId };
  return backendData;
}

const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  if (isNaN(num)) return "₱0.00";
  return `₱${num.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

function safeFormatDate(
  dateStr: string | null | undefined,
  fallback = "—",
): string {
  if (!dateStr) return fallback;
  let date = parseISO(dateStr);
  if (!isValid(date)) date = new Date(dateStr);
  if (!isValid(date)) return fallback;
  return format(date, "MMM dd, yyyy");
}

function getFileExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split(".").pop()?.toLowerCase() ?? "";
  } catch {
    return url.split(".").pop()?.toLowerCase() ?? "";
  }
}

function getFileName(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "file");
  } catch {
    return url.split("/").pop() ?? "file";
  }
}

/* -------------------- FILE VIEWER MODAL -------------------- */

const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"];
const PDF_EXTS = ["pdf"];
const OFFICE_EXTS = ["xlsx", "xls", "doc", "docx", "ppt", "pptx", "csv"];

type FileViewerModalProps = {
  open: boolean;
  onClose: () => void;
  fileUrl: string | null;
  entryLabel?: string;
};

function FileViewerModal({
  open,
  onClose,
  fileUrl,
  entryLabel,
}: FileViewerModalProps) {
  if (!open || !fileUrl) return null;

  const ext = getFileExtension(fileUrl);
  const fileName = getFileName(fileUrl);
  const isImage = IMAGE_EXTS.includes(ext);
  const isPdf = PDF_EXTS.includes(ext);
  const isOffice = OFFICE_EXTS.includes(ext);

  const renderBody = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center w-full bg-muted/30 rounded-lg overflow-hidden min-h-[300px]">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-[65vh] object-contain rounded"
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div
          className="w-full rounded-lg overflow-hidden border"
          style={{ height: "80vh" }}
        >
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0`}
            title={fileName}
            className="w-full h-full"
            style={{ border: "none" }}
          />
        </div>
      );
    }

    const icon = isOffice ? (
      <FileSpreadsheet className="h-7 w-7 text-green-700" />
    ) : (
      <File className="h-7 w-7 text-muted-foreground" />
    );

    const bgClass = isOffice ? "bg-green-100" : "bg-muted";

    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 px-4 bg-muted/30 rounded-lg min-h-[220px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`h-14 w-14 rounded-xl ${bgClass} flex items-center justify-center`}
          >
            {icon}
          </div>
          <div>
            <p className="font-medium text-foreground truncate max-w-xs">
              {fileName}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This file type cannot be previewed in the browser.
            </p>
          </div>
        </div>
        <a
          href={fileUrl}
          download={fileName}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-muted transition-colors"
        >
          <Download className="h-4 w-4" />
          Download file
        </a>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-4xl mx-auto rounded-lg flex flex-col overflow-hidden p-0 [&>button]:top-3 [&>button]:right-3"
        style={{ maxHeight: "95vh" }}
      >
        <DialogTitle className="sr-only">
          {fileName} — Validation Document
        </DialogTitle>

        {/* Modal header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b flex-shrink-0 pr-12">
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm leading-tight truncate">
              {fileName}
            </p>
            {entryLabel && (
              <p className="text-xs text-muted-foreground truncate">
                Validation document — {entryLabel}
              </p>
            )}
          </div>
          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-input bg-background hover:bg-muted transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-auto p-5">{renderBody()}</div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------- PAGINATION -------------------- */

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 border-t">
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-medium">{startItem}</span>–
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> entries
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="h-8 w-8 flex items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0 text-sm"
              onClick={() => onPageChange(page as number)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* -------------------- PAGE-LEVEL FILE ACTIONS -------------------- */

function PageFileActions({
  pageId,
  label,
  disabled: externalDisabled,
}: {
  pageId: string;
  label?: string;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);

  const { toast } = useToast();

  const handleUploadClick = () => fileInputRef.current?.click();

  // ✅ UPLOAD
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("data_type", "budget_entries");

      const response = await fetch(
        `${API_BASE_URL}/upload-validation-docs/${pageId}`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || "Upload failed");
      }

      setHasFile(true);

      toast({
        title: "File Uploaded",
        description: `"${file.name}" has been attached.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description:
          error.message || "Could not upload file. Please try again.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ✅ VIEW
  const handleView = async () => {
    setIsViewing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/get-validation-docs/${pageId}/budget_entries`,
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || "No file found");
      }

      const data = await response.json();
      const url: string = data.file_url;

      if (!url) throw new Error("No file URL returned");

      setFileUrl(url);
      setViewerOpen(true);
      setHasFile(true);
    } catch (error: any) {
      setHasFile(false);

      toast({
        variant: "destructive",
        title: "No File Found",
        description: error.message || "No document is attached to this record.",
      });
    } finally {
      setIsViewing(false);
    }
  };

  // DELETE (NEW)
  const handleDelete = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to remove this document?",
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/delete-validation-docs/${pageId}/budget_entries`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data_type: "budget_entries" }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || "Delete failed");
      }

      setHasFile(false);
      setFileUrl(null);
      setViewerOpen(false);

      toast({
        title: "File Removed",
        description: "The document has been deleted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description:
          error.message || "Could not delete file. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".xlsx,.xls,.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.csv"
        onChange={handleFileChange}
        data-testid="file-input-abo-page"
      />

      {/* UPLOAD */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
        onClick={handleUploadClick}
        disabled={isUploading || externalDisabled}
        title="Upload document (PDF, DOCX, Images, Excel)"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isUploading ? "Uploading…" : "Upload Document"}
        </span>
      </Button>

      {/* VIEW */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
        onClick={handleView}
        disabled={isViewing || externalDisabled}
        title="View uploaded document"
      >
        {isViewing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isViewing ? "Loading…" : "View Document"}
        </span>
      </Button>

      {/* DELETE (only show if file exists) */}
      {hasFile && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          onClick={handleDelete}
          disabled={isDeleting || externalDisabled}
          title="Remove uploaded document"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {isDeleting ? "Removing…" : "Remove"}
          </span>
        </Button>
      )}

      {/* VIEWER MODAL */}
      <FileViewerModal
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setFileUrl(null);
        }}
        fileUrl={fileUrl}
        entryLabel={label}
      />
    </>
  );
}

/* -------------------- MOBILE ENTRY CARD -------------------- */

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: BudgetEntry;
  onEdit: (e: BudgetEntry) => void;
  onDelete: (e: BudgetEntry) => void;
}) {
  return (
    <div
      className="border rounded-lg p-4 space-y-3 bg-card"
      data-testid={`row-entry-${entry.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground truncate">
          {entry.transactionId}
        </span>
        <span className="font-bold text-sm text-chart-1 flex-shrink-0">
          {formatCurrency(entry.amount)}
        </span>
      </div>
      <div>
        <p className="font-medium text-sm leading-snug">{entry.category}</p>
        {entry.subcategory && (
          <p className="text-xs text-muted-foreground truncate">
            {entry.subcategory}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span className="truncate">{entry.payee}</span>
        <span className="flex-shrink-0">
          {safeFormatDate(entry.transactionDate)}
        </span>
      </div>
      {entry.dvNumber && (
        <p className="text-xs text-muted-foreground">DV: {entry.dvNumber}</p>
      )}
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1"
          onClick={() => onEdit(entry)}
          data-testid={`button-edit-entry-${entry.id}`}
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(entry)}
          data-testid={`button-delete-entry-${entry.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function ABO() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedEntry, setSelectedEntry] = useState<BudgetEntry | undefined>(
    undefined,
  );
  const [entryToDelete, setEntryToDelete] = useState<BudgetEntry | undefined>(
    undefined,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const currentUserId = 1;
  const allocationId = 1;

  const { data: entries = [], isLoading } = useQuery<BudgetEntry[]>({
    queryKey: ["budget-entries"],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const response = await apiFetch("/get-budget-entries", {
        method: "POST",
        body: JSON.stringify({ year: currentYear }),
      });
      const data = response.data || response;
      if (Array.isArray(data)) return data.map(backendToFrontend);
      return [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  // Always use the first entry's id as the stable anchor for the
  // single page-level validation document. The backend stays unchanged —
  // upload/view always targets this one row id regardless of pagination.
  const aboPageId = entries[0]?.id ?? "";

  useEffect(() => {
    setCurrentPage(1);
  }, [entries.length]);

  const totalPages = Math.ceil(entries.length / ROWS_PER_PAGE);
  const paginatedEntries = entries.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  const createMutation = useMutation({
    mutationFn: async (data: InsertBudgetEntry) => {
      const backendData = frontendToBackend(data, currentUserId, allocationId);
      return apiFetch("/post-budget-entries", {
        method: "POST",
        body: JSON.stringify(backendData),
      });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["budget-entries"] });
      toast({
        title: "Budget Entry Added",
        description: "Budget entry has been successfully added to ABO.",
      });
      setDialogOpen(false);
      setSelectedEntry(undefined);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Adding Budget Entry",
        description: error.message || "Failed to add budget entry.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: InsertBudgetEntry;
    }) => {
      const backendData = frontendToBackend(
        data,
        currentUserId,
        allocationId,
        id,
      );
      return apiFetch("/put-budget-entries", {
        method: "PUT",
        body: JSON.stringify(backendData),
      });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["budget-entries"] });
      toast({
        title: "Budget Entry Updated",
        description: "Budget entry has been successfully updated.",
      });
      setDialogOpen(false);
      setSelectedEntry(undefined);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Updating Budget Entry",
        description: error.message || "Failed to update budget entry.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch("/delete-budget-entries", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["budget-entries"] });
      toast({
        title: "Budget Entry Deleted",
        description: "Budget entry has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setEntryToDelete(undefined);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Budget Entry",
        description: error.message || "Failed to delete budget entry.",
      });
    },
  });

  useEffect(() => {
    if (!dialogOpen) {
      setSelectedEntry(undefined);
      setMode("create");
    }
  }, [dialogOpen]);

  const handleCreate = () => {
    setMode("create");
    setSelectedEntry(undefined);
    setDialogOpen(true);
  };
  const handleEdit = (entry: BudgetEntry) => {
    setMode("edit");
    setSelectedEntry(entry);
    setDialogOpen(true);
  };
  const handleDelete = (entry: BudgetEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };
  const handleSubmit = (data: InsertBudgetEntry) => {
    if (mode === "create") createMutation.mutate(data);
    else if (mode === "edit" && selectedEntry)
      updateMutation.mutate({ id: selectedEntry.id, data });
  };

  const totalAllocated = entries.reduce((sum, e) => {
    const num = parseFloat(e.amount);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <EncoderLayout>
      <div className="px-4 py-4 md:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-poppins leading-tight">
              Annual Budget Ordinance
              <span className="block md:inline md:ml-2 text-lg md:text-3xl">
                (ABO)
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage annual budget allocations and appropriations
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* DATA ACTIONS */}
            <div className="flex items-center gap-2 border-r pr-3">
              <span className="text-xs text-gray-500 hidden sm:inline">
                Insert Data
              </span>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setUploadDialogOpen(true)}
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Upload Excel
              </Button>
            </div>

            {/* DOCUMENT ACTIONS */}
            <div className="flex items-center gap-2 border-r pr-3">
              <span className="text-xs text-gray-500 hidden sm:inline">
                Document
              </span>

              <PageFileActions
                pageId={aboPageId}
                label="Upload Document"
                disabled={isLoading || entries.length === 0}
              />
            </div>

            {/* CREATE */}
            <Button size="sm" className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base font-medium text-muted-foreground">
              Total Budget Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-2xl md:text-3xl font-bold text-chart-1"
              data-testid="text-total-allocated"
            >
              {formatCurrency(totalAllocated.toString())}
            </p>
          </CardContent>
        </Card>

        {/* Budget Entries */}
        <Card className="border-none p-0">
          <CardHeader className="pb-3 px-0 md:px-6">
            <CardTitle className="font-poppins text-base md:text-lg">
              Budget Entries — {new Date().getFullYear()}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            {isLoading ? (
              <div className="space-y-3 px-4 md:px-0 pb-4">
                <div className="h-10 bg-muted rounded animate-pulse" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted/60 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground px-4">
                <p className="text-base md:text-lg mb-2">
                  No budget entries found
                </p>
                <p className="text-sm">
                  Click "Add Budget Entry" to create your first budget
                  allocation
                </p>
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="md:hidden space-y-3 px-0 pt-2 pb-2">
                  {paginatedEntries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
                <div className="md:hidden">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={entries.length}
                    itemsPerPage={ROWS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </div>
                <div className="md:hidden border rounded-lg px-4 py-3 mt-3 bg-muted/40 flex justify-between items-center">
                  <span className="text-sm font-semibold">
                    Total Budget Allocation
                  </span>
                  <span className="font-bold text-chart-1">
                    {formatCurrency(totalAllocated.toString())}
                  </span>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Expenditure Program</TableHead>
                        <TableHead>Payee</TableHead>
                        <TableHead>DV Number</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedEntries.map((entry) => (
                        <TableRow
                          key={entry.id}
                          data-testid={`row-entry-${entry.id}`}
                        >
                          <TableCell className="font-medium">
                            {entry.transactionId}
                          </TableCell>
                          <TableCell>
                            {safeFormatDate(entry.transactionDate)}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="font-medium">{entry.category}</div>
                            <div className="text-sm text-muted-foreground truncate">
                              {entry.subcategory}
                            </div>
                          </TableCell>
                          <TableCell>{entry.payee}</TableCell>
                          <TableCell>{entry.dvNumber}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(entry.amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex gap-1.5 justify-center flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(entry)}
                                data-testid={`button-edit-entry-${entry.id}`}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(entry)}
                                data-testid={`button-delete-entry-${entry.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
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
                          Total Budget Allocation:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(totalAllocated.toString())}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableFooter>
                  </Table>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={entries.length}
                    itemsPerPage={ROWS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <AboExcelUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          createdBy={currentUserId}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-[600px] mx-auto rounded-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                {mode === "create" ? "Add Budget Entry" : "Edit Budget Entry"}
              </DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "Enter the details for the new budget allocation entry."
                  : "Update the details of this budget allocation entry."}
              </DialogDescription>
            </DialogHeader>
            <BudgetEntryForm
              mode={mode}
              entry={selectedEntry}
              onSubmit={handleSubmit}
              isPending={createMutation.isPending || updateMutation.isPending}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this budget entry? This action
                cannot be undone.
                {entryToDelete && (
                  <div className="mt-4 p-3 bg-muted rounded-md space-y-1 text-left">
                    <div>
                      <strong>Transaction ID:</strong>{" "}
                      {entryToDelete.transactionId}
                    </div>
                    <div>
                      <strong>Amount:</strong>{" "}
                      {formatCurrency(entryToDelete.amount)}
                    </div>
                    <div>
                      <strong>Payee:</strong> {entryToDelete.payee}
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel
                data-testid="button-cancel-delete"
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  entryToDelete && deleteMutation.mutate(entryToDelete.id)
                }
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EncoderLayout>
  );
}
