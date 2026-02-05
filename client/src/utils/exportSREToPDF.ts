import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Collection, Disbursement } from '../pages/encoder/sre';

export interface ExportSREData {
  startDate: string;
  endDate: string;
  collections: Collection[];
  disbursements: Disbursement[];
  totalReceipts: number;
  totalExpenditures: number;
  netBalance: number;
}

function formatCurrency(value: number): string {
  // Use PHP instead of the peso symbol to avoid encoding issues
  return `PHP ${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function exportSREToPDF(data: ExportSREData): void {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 14;
  const marginRight = 14;
  const marginBottom = 15;
  
  let yPosition = 15;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Statement of Receipts & Expenditures', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const periodText = `Period: ${formatDate(data.startDate)} to ${formatDate(data.endDate)}`;
  doc.text(periodText, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 12;

  // Summary Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', marginLeft, yPosition);
  
  yPosition += 6;
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Amount']],
    body: [
      ['Total Receipts', formatCurrency(data.totalReceipts)],
      ['Total Expenditures', formatCurrency(data.totalExpenditures)],
      ['Net Balance', formatCurrency(data.netBalance)],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 120, halign: 'left' },
      1: { fontStyle: 'bold', halign: 'right', cellWidth: 80 },
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 1) {
        if (data.row.index === 0) {
          // Receipts - green
          data.cell.styles.textColor = [22, 163, 74];
        } else if (data.row.index === 1) {
          // Expenditures - red
          data.cell.styles.textColor = [220, 38, 38];
        } else if (data.row.index === 2) {
          // Net Balance - conditional
          const netBalance = parseFloat(data.cell.text[0].replace(/[PHP,\s]/g, ''));
          data.cell.styles.textColor = netBalance >= 0 ? [22, 163, 74] : [220, 38, 38];
        }
      }
    },
    margin: { left: marginLeft, right: marginRight },
  });

  // Get the Y position after the summary table
  yPosition = (doc as any).lastAutoTable.finalY + 12;

  // Check if we need a new page before collections
  if (yPosition > pageHeight - marginBottom - 40) {
    doc.addPage();
    yPosition = 15;
  }

  // Collection Transactions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Collection Transactions', marginLeft, yPosition);
  
  yPosition += 6;

  if (data.collections.length > 0) {
    const collectionRows = data.collections.map(c => [
      c.transactionId,
      formatDate(c.transactionDate),
      c.natureOfCollection,
      c.payor,
      c.orNumber,
      formatCurrency(parseFloat(c.amount)),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Transaction ID', 'Date', 'Nature', 'Payor', 'OR #', 'Amount']],
      body: collectionRows,
      foot: [['', '', '', '', 'Total:', formatCurrency(data.totalReceipts)]],
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'left',
      },
      footStyles: {
        fillColor: [243, 244, 246],
        textColor: 0,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'right',
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center' },
        1: { cellWidth: 28, halign: 'center' },
        2: { cellWidth: 70 },
        3: { cellWidth: 60 },
        4: { cellWidth: 30, halign: 'center' },
        5: { halign: 'right', cellWidth: 42 },
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 5) {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.section === 'foot' && data.column.index === 5) {
          data.cell.styles.textColor = [22, 163, 74];
        }
      },
      margin: { left: marginLeft, right: marginRight },
      pageBreak: 'auto',
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('No collection transactions recorded for this period', marginLeft, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 12;
  }

  // Check if we need a new page before disbursements
  if (yPosition > pageHeight - marginBottom - 40) {
    doc.addPage();
    yPosition = 15;
  }

  // Disbursement Transactions
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Disbursement Transactions', marginLeft, yPosition);
  
  yPosition += 6;

  if (data.disbursements.length > 0) {
    const disbursementRows = data.disbursements.map(d => [
      d.transactionId,
      formatDate(d.transactionDate),
      d.natureOfDisbursement,
      d.payee,
      d.dvNumber,
      formatCurrency(parseFloat(d.amount)),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Transaction ID', 'Date', 'Nature', 'Payee', 'DV #', 'Amount']],
      body: disbursementRows,
      foot: [['', '', '', '', 'Total:', formatCurrency(data.totalExpenditures)]],
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'left',
      },
      footStyles: {
        fillColor: [243, 244, 246],
        textColor: 0,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'right',
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center' },
        1: { cellWidth: 28, halign: 'center' },
        2: { cellWidth: 70 },
        3: { cellWidth: 60 },
        4: { cellWidth: 30, halign: 'center' },
        5: { halign: 'right', cellWidth: 42 },
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 5) {
          data.cell.styles.textColor = [220, 38, 38];
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.section === 'foot' && data.column.index === 5) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      },
      margin: { left: marginLeft, right: marginRight },
      pageBreak: 'auto',
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128, 128, 128);
    doc.text('No disbursement transactions recorded for this period', marginLeft, yPosition);
    doc.setTextColor(0, 0, 0);
  }

  // Footer with generation date and page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    
    const footerText = `Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    
    doc.text(footerText, marginLeft, pageHeight - 7);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight, pageHeight - 7, { align: 'right' });
  }

  // Save the PDF
  const filename = `SRE_Report_${data.startDate}_to_${data.endDate}.pdf`;
  doc.save(filename);
}