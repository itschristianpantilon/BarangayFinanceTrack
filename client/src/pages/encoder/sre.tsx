import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Flag,
  Check,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  User,
  Clock,
  File,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { EncoderLayout } from "../../components/encoder-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";

import { format, startOfMonth, endOfMonth } from "date-fns";
import { CollectionForm } from "../../components/collection-form";
import { DisbursementForm } from "../../components/disbursement-form";
import { AboExcelUploadDialog } from "../../components/excel-upload-dialog";
import { queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { api, apiCall } from "../../utils/api";
import { exportSREToExcel } from "../../utils/exportSREToExcel";
import { useAuth } from "../../contexts/auth-context";

/* -------------------- BACKEND TYPES -------------------- */

type BackendCollection = {
  id: number;
  transaction_id: string;
  transaction_date: string;
  nature_of_collection: string;
  category: string;
  subcategory: string;
  purpose?: string;
  fund_source: string;
  amount: number;
  payor: string;
  or_number: string;
  remarks?: string;
  is_flagged?: boolean;
};

type BackendDisbursement = {
  id: number;
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
  is_flagged?: boolean;
};

type FlagComment = {
  id: number;
  comment_text: string;
  created_at: string;
  flagged_by: number;
  username: string;
};

/* -------------------- FRONTEND TYPES -------------------- */

export type Collection = {
  id: string;
  transactionId: string;
  transactionDate: string;
  natureOfCollection: string;
  payor: string;
  orNumber: string;
  amount: string;
  category: string;
  subcategory: string;
  purpose?: string;
  fundSource: string;
  remarks?: string;
  is_flagged?: boolean;
};

export type Disbursement = {
  id: string;
  transactionId: string;
  transactionDate: string;
  natureOfDisbursement: string;
  payee: string;
  dvNumber: string;
  amount: string;
  category: string;
  subcategory: string;
  programDescription?: string;
  fundSource: string;
  remarks?: string;
  is_flagged?: boolean;
};

type ViewType = "collection" | "disbursement";
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://barangayfinancetrackbackenddeployment.onrender.com/api";

/* -------------------- CONVERTERS -------------------- */

function backendCollectionToFrontend(backend: BackendCollection): Collection {
  return {
    id: backend.id.toString(),
    transactionId: backend.transaction_id,
    transactionDate: backend.transaction_date,
    natureOfCollection: backend.nature_of_collection,
    payor: backend.payor,
    orNumber: backend.or_number,
    amount: backend.amount.toString(),
    category: backend.category,
    subcategory: backend.subcategory,
    purpose: backend.purpose,
    fundSource: backend.fund_source,
    remarks: backend.remarks,
    is_flagged: backend.is_flagged,
  };
}

function backendDisbursementToFrontend(
  backend: BackendDisbursement,
): Disbursement {
  return {
    id: backend.id.toString(),
    transactionId: backend.transaction_id,
    transactionDate: backend.transaction_date,
    natureOfDisbursement: backend.nature_of_disbursement,
    payee: backend.payee,
    dvNumber: backend.or_number,
    amount: backend.amount.toString(),
    category: backend.category,
    subcategory: backend.subcategory,
    programDescription: backend.program_description,
    fundSource: backend.fund_source,
    remarks: backend.remarks,
    is_flagged: backend.is_flagged,
  };
}

/* -------------------- HELPERS -------------------- */

const formatCurrency = (value: number) =>
  `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
  recordId: string | null;
  flagType: "collection" | "disbursement";
  transactionId?: string;
}) {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "https://barangayfinancetrackbackenddeployment.onrender.com/api";

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
  // formater usename
  function formatUsername(username?: string) {
    const name = username?.toLowerCase() || "";

    //  specific first
    if (name.includes("approver1")) return "Brgy. Captain 1";
    if (name.includes("approver2")) return "Brgy. Captain 2";

    if (name.includes("newapprover")) return "New Brgy. Captain";

    // general approver (last)
    if (name.includes("approver")) return "Brgy. Captain";

    if (name.includes("bookkeeper") || name.includes("checker"))
      return "Bookkeeper";

    if (name.includes("reviewer")) return "Brgy. Council";

    return username;
  }

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
                <div
                  key={i}
                  className="h-20 bg-muted rounded-lg animate-pulse"
                />
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
                    <span className="font-medium">
                      {formatUsername(comment.username)}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {comment.created_at
                      ? format(
                          new Date(comment.created_at),
                          "MMM dd, yyyy hh:mm a",
                        )
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
/* -------------------- FILE VIEWER MODAL -------------------- */
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
  rowsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 md:px-0 py-3 border-t">
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        Showing{" "}
        <span className="font-medium">
          {startItem}–{endItem}
        </span>{" "}
        of <span className="font-medium">{totalItems}</span> records
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          data-testid="button-prev-page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-1 text-muted-foreground text-sm"
            >
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => onPageChange(page as number)}
              data-testid={`button-page-${page}`}
            >
              {page}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          data-testid="button-next-page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* -------------------- MOBILE COLLECTION CARD -------------------- */

function CollectionCard({
  collection,
  onDelete,
  onViewFlags,
}: {
  collection: Collection;
  onDelete: (id: string) => void;
  onViewFlags: (id: string, transactionId: string) => void;
}) {
  return (
    <div
      className={`border rounded-lg p-4 space-y-3 ${collection.is_flagged === true ? "bg-red-500/20 border-red-500" : ""}`}
      data-testid={`row-collection-${collection.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-mono text-xs text-muted-foreground truncate"
          data-testid={`text-transaction-id-${collection.id}`}
        >
          {collection.transactionId}
        </span>
        <span
          className="font-bold text-sm text-chart-1 flex-shrink-0"
          data-testid={`text-amount-${collection.id}`}
        >
          {formatCurrency(parseFloat(collection.amount))}
        </span>
      </div>

      <p
        className="text-sm font-medium leading-snug"
        data-testid={`text-nature-${collection.id}`}
      >
        {collection.natureOfCollection}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span className="truncate" data-testid={`text-payor-${collection.id}`}>
          {collection.payor}
        </span>
        <span
          className="flex-shrink-0"
          data-testid={`text-date-${collection.id}`}
        >
          {format(new Date(collection.transactionDate), "MMM dd, yyyy")}
        </span>
      </div>

      {collection.orNumber && (
        <p
          className="text-xs text-muted-foreground"
          data-testid={`text-or-number-${collection.id}`}
        >
          OR: {collection.orNumber}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1"
          onClick={() => onViewFlags(collection.id, collection.transactionId)}
          data-testid={`button-view-flags-collection-${collection.id}`}
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        <CollectionForm
          collection={collection}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              data-testid={`button-edit-collection-${collection.id}`}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          }
        />
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(collection.id)}
          data-testid={`button-delete-collection-${collection.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
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

  //  UPLOAD
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("data_type", "collections");

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

  //  VIEW
  const handleView = async () => {
    setIsViewing(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/get-validation-docs/${pageId}/collections`,
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
        `${API_BASE_URL}/delete-validation-docs/${pageId}/collections`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data_type: "collections" }),
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

/* -------------------- MOBILE DISBURSEMENT CARD -------------------- */

function DisbursementCard({
  disbursement,
  onDelete,
  onViewFlags,
}: {
  disbursement: Disbursement;
  onDelete: (id: string) => void;
  onViewFlags: (id: string, transactionId: string) => void;
}) {
  return (
    <div
      className={`border rounded-lg p-4 space-y-3 ${disbursement.is_flagged === true ? "bg-red-500/20 border-red-500" : ""}`}
      data-testid={`row-disbursement-${disbursement.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-mono text-xs text-muted-foreground truncate"
          data-testid={`text-transaction-id-${disbursement.id}`}
        >
          {disbursement.transactionId}
        </span>
        <span
          className="font-bold text-sm text-destructive flex-shrink-0"
          data-testid={`text-amount-${disbursement.id}`}
        >
          {formatCurrency(parseFloat(disbursement.amount))}
        </span>
      </div>

      <p
        className="text-sm font-medium leading-snug"
        data-testid={`text-nature-${disbursement.id}`}
      >
        {disbursement.natureOfDisbursement}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
        <span
          className="truncate"
          data-testid={`text-payee-${disbursement.id}`}
        >
          {disbursement.payee}
        </span>
        <span
          className="flex-shrink-0"
          data-testid={`text-date-${disbursement.id}`}
        >
          {format(new Date(disbursement.transactionDate), "MMM dd, yyyy")}
        </span>
      </div>

      {disbursement.dvNumber && (
        <p
          className="text-xs text-muted-foreground"
          data-testid={`text-dv-number-${disbursement.id}`}
        >
          DV: {disbursement.dvNumber}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1"
          onClick={() =>
            onViewFlags(disbursement.id, disbursement.transactionId)
          }
          data-testid={`button-view-flags-disbursement-${disbursement.id}`}
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        <DisbursementForm
          disbursement={disbursement}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              data-testid={`button-edit-disbursement-${disbursement.id}`}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          }
        />
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(disbursement.id)}
          data-testid={`button-delete-disbursement-${disbursement.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

/* -------------------- PAGE -------------------- */

const ROWS_PER_PAGE = 10;

export default function SRE() {
  const { user } = useAuth();
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(
    format(startOfMonth(currentDate), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(currentDate), "yyyy-MM-dd"),
  );
  const [activeView, setActiveView] = useState<ViewType>("collection");
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(
    null,
  );
  const [deleteDisbursementId, setDeleteDisbursementId] = useState<
    string | null
  >(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [collectionPage, setCollectionPage] = useState(1);
  const [disbursementPage, setDisbursementPage] = useState(1);

  // Flag comments dialog state
  const [flagDialog, setFlagDialog] = useState<{
    open: boolean;
    recordId: string | null;
    flagType: "collection" | "disbursement";
    transactionId?: string;
  }>({ open: false, recordId: null, flagType: "collection" });

  const { toast } = useToast();

  const openFlagDialog = (
    recordId: string,
    flagType: "collection" | "disbursement",
    transactionId: string,
  ) => {
    setFlagDialog({ open: true, recordId, flagType, transactionId });
  };

  /* Fetch collections */
  const { data: collections = [], isLoading: isLoadingCollections } = useQuery<
    Collection[]
  >({
    queryKey: ["collections"],
    queryFn: async () => {
      const result = await apiCall<{ data: BackendCollection[] }>(
        api.collections.getAll,
      );
      if (result.error) throw new Error(result.error);
      const data = result.data?.data || result.data || [];
      if (Array.isArray(data)) return data.map(backendCollectionToFrontend);
      return [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  /* Fetch disbursements */
  const { data: disbursements = [], isLoading: isLoadingDisbursements } =
    useQuery<Disbursement[]>({
      queryKey: ["disbursements"],
      queryFn: async () => {
        const result = await apiCall<{ data: BackendDisbursement[] }>(
          api.disbursements.getAll,
        );
        if (result.error) throw new Error(result.error);
        const data = result.data?.data || result.data || [];
        if (Array.isArray(data)) return data.map(backendDisbursementToFrontend);
        return [];
      },
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    });

  const collectionPageId = collections[0]?.id ?? "";

  /* Delete collection */
  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiCall(api.collections.delete, {
        method: "DELETE",
        body: JSON.stringify({ collection_id: parseInt(id) }),
      });
      if (result.error) throw new Error(result.error);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["collections"], (old: Collection[] = []) =>
        old.filter((item) => item.id !== deletedId),
      );
      queryClient.invalidateQueries({ queryKey: ["collections"] });
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
        description: error.message,
      });
    },
  });

  /* Delete disbursement */
  const deleteDisbursement = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiCall(api.disbursements.delete, {
        method: "DELETE",
        body: JSON.stringify({ disbursement_id: parseInt(id) }),
      });
      if (result.error) throw new Error(result.error);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["disbursements"], (old: Disbursement[] = []) =>
        old.filter((item) => item.id !== deletedId),
      );
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
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
        description: error.message,
      });
    },
  });

  /* Filtered data */
  const filteredCollections = collections.filter((c) => {
    const date = new Date(c.transactionDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  const filteredDisbursements = disbursements.filter((d) => {
    const date = new Date(d.transactionDate);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  /* Pagination derived values */
  const collectionTotalPages = Math.ceil(
    filteredCollections.length / ROWS_PER_PAGE,
  );
  const paginatedCollections = filteredCollections.slice(
    (collectionPage - 1) * ROWS_PER_PAGE,
    collectionPage * ROWS_PER_PAGE,
  );

  const disbursementTotalPages = Math.ceil(
    filteredDisbursements.length / ROWS_PER_PAGE,
  );
  const paginatedDisbursements = filteredDisbursements.slice(
    (disbursementPage - 1) * ROWS_PER_PAGE,
    disbursementPage * ROWS_PER_PAGE,
  );

  /* Reset pages when date filter changes */
  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setCollectionPage(1);
    setDisbursementPage(1);
  };
  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setCollectionPage(1);
    setDisbursementPage(1);
  };

  /* Reset page when switching views */
  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    setCollectionPage(1);
    setDisbursementPage(1);
  };

  const totalReceipts = filteredCollections.reduce(
    (sum, c) => sum + parseFloat(c.amount),
    0,
  );
  const totalExpenditures = filteredDisbursements.reduce(
    (sum, d) => sum + parseFloat(d.amount),
    0,
  );
  const netBalance = totalReceipts - totalExpenditures;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportSREToExcel({
        startDate,
        endDate,
        activeView, // ← add this
        collections: filteredCollections,
        disbursements: filteredDisbursements,
        totalReceipts,
        totalExpenditures,
        // netBalance no longer needed, remove it
      });
      toast({
        title: "Export Successful",
        description: "SRE Excel report downloaded.",
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };
  const skeletonRows = [1, 2, 3, 4];

  return (
    <EncoderLayout>
      <div className="p-4 md:p-8 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-foreground font-poppins leading-tight">
              Statement of Receipts &amp; Expenditures
              <span className="block md:inline md:ml-2 text-lg md:text-3xl">
                (SRE)
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              View and encode financial statements for the selected period
            </p>
          </div>
          <Button
            className="gap-2 flex-shrink-0"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            data-testid="button-export"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : "Export Excel"}
            </span>
            <span className="sm:hidden">{isExporting ? "..." : "Export"}</span>
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-3">
          <Button
            variant={activeView === "collection" ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={() => handleViewChange("collection")}
            data-testid="button-collection"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Collection</span>
          </Button>
          <Button
            variant={activeView === "disbursement" ? "default" : "outline"}
            className="flex-1 gap-2"
            onClick={() => handleViewChange("disbursement")}
            data-testid="button-disbursement"
          >
            <TrendingDown className="h-4 w-4" />
            <span>Disbursement</span>
          </Button>
        </div>

        {/* Date Range Filter */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-poppins text-base md:text-lg">
              <Calendar className="h-5 w-5" />
              Report Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="start-date" className="text-sm">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  data-testid="input-start-date"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-sm">
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  data-testid="input-end-date"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-3 md:gap-6 grid-cols-2 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Receipts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-lg md:text-3xl font-bold text-chart-1 text-wrap"
                data-testid="text-total-receipts"
              >
                {formatCurrency(totalReceipts)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Expenditures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-lg md:text-3xl font-bold text-destructive text-wrap"
                data-testid="text-total-expenditures"
              >
                {formatCurrency(totalExpenditures)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-lg md:text-3xl font-bold ${netBalance >= 0 ? "text-chart-1" : "text-destructive"} text-wrap`}
                data-testid="text-net-balance"
              >
                {formatCurrency(netBalance)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* LEFT SIDE (optional title or empty) */}
          <div />

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex flex-wrap items-center gap-3">
            {/*  DATA ACTION */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">
                Insert Data
              </span>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsUploadDialogOpen(true)}
                title="Upload Excel file (.xlsx, .csv) to import data"
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="hidden sm:inline">Upload Excel</span>
                <span className="sm:hidden">Excel</span>
              </Button>
            </div>

            {/*  DOCUMENT ACTION */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">
                Document
              </span>

              <PageFileActions
                pageId={collectionPageId}
                label="Collection Document"
                disabled={collections.length === 0}
              />
            </div>

            {/*  FORM ACTION */}
            <div className="flex items-center gap-2">
              {activeView === "collection" ? (
                <CollectionForm />
              ) : (
                <DisbursementForm />
              )}
            </div>
          </div>
        </div>

        <AboExcelUploadDialog
          type={activeView}
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
          createdBy={user?.id}
        />

        {/* ==================== COLLECTION TABLE/CARDS ==================== */}
        {activeView === "collection" && (
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="font-poppins text-base md:text-lg">
                Collection Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              {isLoadingCollections ? (
                <div className="space-y-3 px-4 md:px-0 pb-4">
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  {skeletonRows.map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-muted/60 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="md:hidden space-y-3 px-4 pt-2 pb-2">
                    {filteredCollections.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground text-sm">
                        No collection transactions recorded for this period
                      </p>
                    ) : (
                      <>
                        {paginatedCollections.map((collection) => (
                          <CollectionCard
                            key={collection.id}
                            collection={collection}
                            onDelete={setDeleteCollectionId}
                            onViewFlags={(id, txId) =>
                              openFlagDialog(id, "collection", txId)
                            }
                          />
                        ))}
                        {collectionPage === collectionTotalPages && (
                          <div className="border rounded-lg px-4 py-3 bg-muted/40 flex justify-between items-center">
                            <span className="text-sm font-semibold">
                              Total Collections
                            </span>
                            <span className="font-bold text-chart-1">
                              {formatCurrency(totalReceipts)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Nature of Collection</TableHead>
                          <TableHead>Payor</TableHead>
                          <TableHead>OR Number</TableHead>
                          <TableHead className="text-center">
                            Is Flagged
                          </TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCollections.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No collection transactions recorded for this
                              period
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedCollections.map((collection) => (
                            <TableRow
                              key={collection.id}
                              data-testid={`row-collection-${collection.id}`}
                              className={
                                collection.is_flagged === true
                                  ? "bg-red-500/20"
                                  : ""
                              }
                            >
                              <TableCell
                                className="font-medium"
                                data-testid={`text-transaction-id-${collection.id}`}
                              >
                                {collection.transactionId}
                              </TableCell>
                              <TableCell
                                data-testid={`text-date-${collection.id}`}
                              >
                                {format(
                                  new Date(collection.transactionDate),
                                  "MMM dd, yyyy",
                                )}
                              </TableCell>
                              <TableCell
                                data-testid={`text-nature-${collection.id}`}
                              >
                                {collection.natureOfCollection}
                              </TableCell>
                              <TableCell
                                data-testid={`text-payor-${collection.id}`}
                              >
                                {collection.payor}
                              </TableCell>
                              <TableCell
                                data-testid={`text-or-number-${collection.id}`}
                              >
                                {collection.orNumber}
                              </TableCell>
                              <TableCell className="text-center">
                                {collection.is_flagged === true ? (
                                  <p className="flex items-center justify-center gap-2 text-xs font-semibold">
                                    <Flag className="h-4 w-4 text-red-500" />{" "}
                                    Flagged
                                  </p>
                                ) : (
                                  <p className="flex items-center justify-center gap-2 text-xs font-semibold">
                                    <Check className="h-4 w-4 text-green-500" />{" "}
                                    Not Flagged
                                  </p>
                                )}
                              </TableCell>
                              <TableCell
                                className="text-right font-semibold text-chart-1"
                                data-testid={`text-amount-${collection.id}`}
                              >
                                {formatCurrency(parseFloat(collection.amount))}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                  {/* Eye / View Flag Comments */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      openFlagDialog(
                                        collection.id,
                                        "collection",
                                        collection.transactionId,
                                      )
                                    }
                                    data-testid={`button-view-flags-collection-${collection.id}`}
                                    title="View flag comments"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <CollectionForm
                                    collection={collection}
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
                                    onClick={() =>
                                      setDeleteCollectionId(collection.id)
                                    }
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
                      {filteredCollections.length > 0 && (
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={6} className="font-semibold">
                              Total Collections
                            </TableCell>
                            <TableCell className="text-right font-bold text-chart-1">
                              {formatCurrency(totalReceipts)}
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableFooter>
                      )}
                    </Table>
                  </div>

                  {/* Pagination */}
                  {filteredCollections.length > 0 && (
                    <Pagination
                      currentPage={collectionPage}
                      totalPages={collectionTotalPages}
                      totalItems={filteredCollections.length}
                      rowsPerPage={ROWS_PER_PAGE}
                      onPageChange={setCollectionPage}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* ==================== DISBURSEMENT TABLE/CARDS ==================== */}
        {activeView === "disbursement" && (
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="font-poppins text-base md:text-lg">
                Disbursement Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6 md:pt-0">
              {isLoadingDisbursements ? (
                <div className="space-y-3 px-4 md:px-0 pb-4">
                  <div className="h-10 bg-muted rounded animate-pulse" />
                  {skeletonRows.map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-muted/60 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  {/* Mobile: Cards */}
                  <div className="md:hidden space-y-3 px-4 pt-2 pb-2">
                    {filteredDisbursements.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground text-sm">
                        No disbursement transactions recorded for this period
                      </p>
                    ) : (
                      <>
                        {paginatedDisbursements.map((disbursement) => (
                          <DisbursementCard
                            key={disbursement.id}
                            disbursement={disbursement}
                            onDelete={setDeleteDisbursementId}
                            onViewFlags={(id, txId) =>
                              openFlagDialog(id, "disbursement", txId)
                            }
                          />
                        ))}
                        {disbursementPage === disbursementTotalPages && (
                          <div className="border rounded-lg px-4 py-3 bg-muted/40 flex justify-between items-center">
                            <span className="text-sm font-semibold">
                              Total Disbursements
                            </span>
                            <span className="font-bold text-destructive">
                              {formatCurrency(totalExpenditures)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Nature of Disbursement</TableHead>
                          <TableHead>Payee</TableHead>
                          <TableHead>DV Number</TableHead>
                          <TableHead className="text-center">
                            Is Flagged
                          </TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDisbursements.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No disbursement transactions recorded for this
                              period
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedDisbursements.map((disbursement) => (
                            <TableRow
                              key={disbursement.id}
                              data-testid={`row-disbursement-${disbursement.id}`}
                              className={
                                disbursement.is_flagged === true
                                  ? "bg-red-500/20"
                                  : ""
                              }
                            >
                              <TableCell
                                className="font-medium"
                                data-testid={`text-transaction-id-${disbursement.id}`}
                              >
                                {disbursement.transactionId}
                              </TableCell>
                              <TableCell
                                data-testid={`text-date-${disbursement.id}`}
                              >
                                {format(
                                  new Date(disbursement.transactionDate),
                                  "MMM dd, yyyy",
                                )}
                              </TableCell>
                              <TableCell
                                data-testid={`text-nature-${disbursement.id}`}
                              >
                                {disbursement.natureOfDisbursement}
                              </TableCell>
                              <TableCell
                                data-testid={`text-payee-${disbursement.id}`}
                              >
                                {disbursement.payee}
                              </TableCell>
                              <TableCell
                                data-testid={`text-dv-number-${disbursement.id}`}
                              >
                                {disbursement.dvNumber}
                              </TableCell>
                              <TableCell className="text-center">
                                {disbursement.is_flagged === true ? (
                                  <p className="flex items-center justify-center gap-2 text-xs font-semibold">
                                    <Flag className="h-4 w-4 text-red-500" />{" "}
                                    Flagged
                                  </p>
                                ) : (
                                  <p className="flex items-center justify-center gap-2 text-xs font-semibold">
                                    <Check className="h-4 w-4 text-green-500" />{" "}
                                    Not Flagged
                                  </p>
                                )}
                              </TableCell>
                              <TableCell
                                className="text-right font-semibold text-destructive"
                                data-testid={`text-amount-${disbursement.id}`}
                              >
                                {formatCurrency(
                                  parseFloat(disbursement.amount),
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center gap-2">
                                  {/* Eye / View Flag Comments */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      openFlagDialog(
                                        disbursement.id,
                                        "disbursement",
                                        disbursement.transactionId,
                                      )
                                    }
                                    data-testid={`button-view-flags-disbursement-${disbursement.id}`}
                                    title="View flag comments"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <DisbursementForm
                                    disbursement={disbursement}
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
                                    onClick={() =>
                                      setDeleteDisbursementId(disbursement.id)
                                    }
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
                      {filteredDisbursements.length > 0 && (
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={6} className="font-semibold">
                              Total Disbursements
                            </TableCell>
                            <TableCell className="text-right font-bold text-destructive">
                              {formatCurrency(totalExpenditures)}
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableFooter>
                      )}
                    </Table>
                  </div>

                  {/* Pagination */}
                  {filteredDisbursements.length > 0 && (
                    <Pagination
                      currentPage={disbursementPage}
                      totalPages={disbursementTotalPages}
                      totalItems={filteredDisbursements.length}
                      rowsPerPage={ROWS_PER_PAGE}
                      onPageChange={setDisbursementPage}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Collection Dialog */}
        <AlertDialog
          open={!!deleteCollectionId}
          onOpenChange={(open) => !open && setDeleteCollectionId(null)}
        >
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete Collection Transaction?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                collection transaction.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel
                data-testid="button-cancel-delete-collection"
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteCollectionId &&
                  deleteCollection.mutate(deleteCollectionId)
                }
                data-testid="button-confirm-delete-collection"
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
              >
                {deleteCollection.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Disbursement Dialog */}
        <AlertDialog
          open={!!deleteDisbursementId}
          onOpenChange={(open) => !open && setDeleteDisbursementId(null)}
        >
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete Disbursement Transaction?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                disbursement transaction.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <AlertDialogCancel
                data-testid="button-cancel-delete-disbursement"
                className="w-full sm:w-auto"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteDisbursementId &&
                  deleteDisbursement.mutate(deleteDisbursementId)
                }
                data-testid="button-confirm-delete-disbursement"
                className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
              >
                {deleteDisbursement.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Flag Comments Dialog */}
        <FlagCommentsDialog
          open={flagDialog.open}
          onOpenChange={(open) => setFlagDialog((prev) => ({ ...prev, open }))}
          recordId={flagDialog.recordId}
          flagType={flagDialog.flagType}
          transactionId={flagDialog.transactionId}
        />
      </div>
    </EncoderLayout>
  );
}
