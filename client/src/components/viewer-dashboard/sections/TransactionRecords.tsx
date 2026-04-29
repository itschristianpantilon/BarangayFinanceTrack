import { TrendingUp, TrendingDown, FileDown } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import { formatDate, formatCurrencyCompact, safeParseAmount } from "../../../utils/formatters";
import type { Collection, Disbursement } from "../../../types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TransactionRecordsProps = {
  collections: Collection[] | undefined;
  disbursements: Disbursement[] | undefined;
  isLoadingCollections: boolean;
  isLoadingDisbursements: boolean;
};

function formatCurrencyPDF(value: number): string {
  return `PHP ${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDatePDF(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function exportCollectionsToPDF(collections: Collection[]) {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 14;
  const marginRight = 14;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Collection Transactions", pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth / 2,
    22,
    { align: "center" }
  );

  const totalReceipts = collections.reduce(
    (sum, c) => sum + safeParseAmount(c.amount),
    0
  );

  // 5 columns — A4 landscape usable width = 297 - 14 - 14 = 269mm
  // Date(32) + Nature(105) + Payor(75) + Is Flagged(27) + Amount(30) = 269
  const rows = collections.map((c) => [
    formatDatePDF(c.transaction_date),
    c.nature_of_collection || c.category || "—",
    c.payor ?? "—",
    c.is_flagged ? "Flagged" : "Not Flagged",
    formatCurrencyPDF(safeParseAmount(c.amount)),
  ]);

  autoTable(doc, {
    startY: 28,
    head: [["Date", "Nature of Collection", "Payor", "Is Flagged", "Amount (PHP)"]],
    body: rows,
    foot: [["", "", "", "TOTAL", formatCurrencyPDF(totalReceipts)]],
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5, halign: "left", cellPadding: 3 },
    footStyles: {
      fillColor: [236, 253, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 32, halign: "center" },
      1: { cellWidth: 105 },
      2: { cellWidth: 75 },
      3: { cellWidth: 27, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        data.cell.styles.textColor = [22, 163, 74];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 3) {
        const isFlag = data.cell.text[0] === "Flagged";
        data.cell.styles.textColor = isFlag ? [220, 38, 38] : [107, 114, 128];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "foot" && data.column.index === 4) {
        data.cell.styles.textColor = [22, 163, 74];
      }
    },
    margin: { left: marginLeft, right: marginRight },
    pageBreak: "auto",
  });

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight, pageHeight - 7, {
      align: "right",
    });
  }

  doc.save(`Collections_${new Date().toISOString().split("T")[0]}.pdf`);
}

function exportDisbursementsToPDF(disbursements: Disbursement[]) {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 14;
  const marginRight = 14;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Disbursement Transactions", pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth / 2,
    22,
    { align: "center" }
  );

  const totalExpenditures = disbursements.reduce(
    (sum, d) => sum + safeParseAmount(d.amount),
    0
  );

  // 5 columns — Date(32) + Nature(105) + Payee(75) + Is Flagged(27) + Amount(30) = 269
  const rows = disbursements.map((d) => [
    formatDatePDF(d.transaction_date),
    d.nature_of_disbursement || d.category || "—",
    d.payee ?? "—",
    d.is_flagged ? "Flagged" : "Not Flagged",
    formatCurrencyPDF(safeParseAmount(d.amount)),
  ]);

  autoTable(doc, {
    startY: 28,
    head: [["Date", "Nature of Disbursement", "Payee", "Is Flagged", "Amount (PHP)"]],
    body: rows,
    foot: [["", "", "", "TOTAL", formatCurrencyPDF(totalExpenditures)]],
    theme: "grid",
    headStyles: {
      fillColor: [245, 158, 11],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5, halign: "left", cellPadding: 3 },
    footStyles: {
      fillColor: [255, 251, 235],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 9,
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 32, halign: "center" },
      1: { cellWidth: 105 },
      2: { cellWidth: 75 },
      3: { cellWidth: 27, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        data.cell.styles.textColor = [220, 38, 38];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.column.index === 3) {
        const isFlag = data.cell.text[0] === "Flagged";
        data.cell.styles.textColor = isFlag ? [220, 38, 38] : [107, 114, 128];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "foot" && data.column.index === 4) {
        data.cell.styles.textColor = [220, 38, 38];
      }
    },
    margin: { left: marginLeft, right: marginRight },
    pageBreak: "auto",
  });

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight, pageHeight - 7, {
      align: "right",
    });
  }

  doc.save(`Disbursements_${new Date().toISOString().split("T")[0]}.pdf`);
}

export default function TransactionRecords({
  collections,
  disbursements,
  isLoadingCollections,
  isLoadingDisbursements,
}: TransactionRecordsProps) {
  return (
    <section>
      <SectionHeader
        title="Transaction Records"
        subtitle="Recent financial activities"
        gradientFrom="from-violet-500"
        gradientTo="to-violet-600"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Collections Table */}
        <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white truncate">
                    Collections <span className="font-extrabold">(Koleksyon ng Pondo)</span>
                  </h3>
                  <p className="text-emerald-100 text-xs sm:text-sm truncate">
                    Recent income transactions
                  </p>
                </div>
              </div>
              <button
                onClick={() => collections && exportCollectionsToPDF(collections)}
                disabled={!collections || collections.length === 0 || isLoadingCollections}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-all shrink-0"
                title="Export to PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[320px] sm:max-h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 z-10">
                <tr className="uppercase text-slate-600">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">Date</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">Category</th>
                  <th className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingCollections ? (
                  <tr>
                    <td colSpan={3} className="py-8 sm:py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <span className="text-xs sm:text-sm">Loading collections...</span>
                      </div>
                    </td>
                  </tr>
                ) : collections && collections.length > 0 ? (
                  collections.slice(0, 10).map((collection) => (
                    <tr
                      key={collection.id}
                      className="border-b border-slate-100 hover:bg-emerald-50/50 transition-all"
                    >
                      <td className="py-2 sm:py-3 px-3 sm:px-6 text-slate-600 whitespace-nowrap font-medium">
                        {formatDate(collection.transaction_date)}
                      </td>
                      <td
                        className="py-2 sm:py-3 px-3 sm:px-6 font-semibold text-slate-900 max-w-[120px] sm:max-w-xs truncate"
                        title={collection.nature_of_collection || collection.category}
                      >
                        {collection.nature_of_collection || collection.category}
                      </td>
                      <td className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold text-emerald-600 whitespace-nowrap">
                        {formatCurrencyCompact(safeParseAmount(collection.amount))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 sm:py-12 text-center text-slate-500 text-xs sm:text-sm"
                    >
                      No collections data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disbursements Table */}
        <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 sm:p-3 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white truncate">
                    Disbursements <span className="font-extrabold">(Paglalabas ng Pondo)</span>
                  </h3>
                  <p className="text-amber-100 text-xs sm:text-sm truncate">
                    Recent expense transactions
                  </p>
                </div>
              </div>
              <button
                onClick={() => disbursements && exportDisbursementsToPDF(disbursements)}
                disabled={!disbursements || disbursements.length === 0 || isLoadingDisbursements}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-all shrink-0"
                title="Export to PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[320px] sm:max-h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200 z-10">
                <tr className="uppercase text-slate-600">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">Date</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-6 font-bold">Category</th>
                  <th className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingDisbursements ? (
                  <tr>
                    <td colSpan={3} className="py-8 sm:py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
                        <span className="text-xs sm:text-sm">Loading disbursements...</span>
                      </div>
                    </td>
                  </tr>
                ) : disbursements && disbursements.length > 0 ? (
                  disbursements.slice(0, 10).map((disbursement) => (
                    <tr
                      key={disbursement.id}
                      className="border-b border-slate-100 hover:bg-amber-50/50 transition-all"
                    >
                      <td className="py-2 sm:py-3 px-3 sm:px-6 text-slate-600 whitespace-nowrap font-medium">
                        {formatDate(disbursement.transaction_date)}
                      </td>
                      <td
                        className="py-2 sm:py-3 px-3 sm:px-6 font-semibold text-slate-900 max-w-[120px] sm:max-w-xs truncate"
                        title={disbursement.nature_of_disbursement || disbursement.category}
                      >
                        {disbursement.nature_of_disbursement || disbursement.category}
                      </td>
                      <td className="text-right py-2 sm:py-3 px-3 sm:px-6 font-bold text-amber-600 whitespace-nowrap">
                        {formatCurrencyCompact(safeParseAmount(disbursement.amount))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 sm:py-12 text-center text-slate-500 text-xs sm:text-sm"
                    >
                      No disbursements data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}