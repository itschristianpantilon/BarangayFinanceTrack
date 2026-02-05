import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download, Calendar } from "lucide-react";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
type Revenue = {
  id: string;
  date: string;
  source: string;
  category: string;
  amount: string;
};

type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: string;
};
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function ReceiptsExpenditures() {
  const currentDate = new Date();
  const [startDate, setStartDate] = useState(
    format(startOfMonth(currentDate), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(currentDate), "yyyy-MM-dd"),
  );

  const { data: revenues } = useQuery<Revenue[]>({
    queryKey: ["/api/revenues"],
  });

  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const filteredRevenues =
    revenues?.filter((r) => {
      const date = new Date(r.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    }) || [];

  const filteredExpenses =
    expenses?.filter((e) => {
      const date = new Date(e.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    }) || [];

  const totalReceipts = filteredRevenues.reduce(
    (sum, r) => sum + parseFloat(r.amount),
    0,
  );
  const totalExpenditures = filteredExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0,
  );
  const netBalance = totalReceipts - totalExpenditures;

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleExport = () => {
    // This would typically generate a PDF or Excel file
    alert("Export functionality would generate a formatted report here");
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">
            Statement of Receipts & Expenditures
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial statement for the selected period
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={handleExport}
          data-testid="button-export"
        >
          <Download className="h-4 w-4" />
          Export Report
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
            <CardTitle className="text-base font-medium text-muted-foreground">
              Total Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold text-chart-1"
              data-testid="text-total-receipts"
            >
              {formatCurrency(totalReceipts)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Total Expenditures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold text-destructive"
              data-testid="text-total-expenditures"
            >
              {formatCurrency(totalExpenditures)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold ${netBalance >= 0 ? "text-chart-1" : "text-destructive"}`}
              data-testid="text-net-balance"
            >
              {formatCurrency(netBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Receipts Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-poppins">Receipts</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No receipts in selected period
                  </TableCell>
                </TableRow>
              ) : (
                filteredRevenues.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell>
                      {format(new Date(revenue.date), "MMM dd, yyyy")}
                    </TableCell>
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
                <TableCell colSpan={3} className="font-semibold">
                  Total Receipts
                </TableCell>
                <TableCell className="text-right font-bold text-chart-1">
                  {formatCurrency(totalReceipts)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Expenditures Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-poppins">Expenditures</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No expenditures in selected period
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {format(new Date(expense.date), "MMM dd, yyyy")}
                    </TableCell>
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
                <TableCell colSpan={3} className="font-semibold">
                  Total Expenditures
                </TableCell>
                <TableCell className="text-right font-bold text-destructive">
                  {formatCurrency(totalExpenditures)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {/* Net Balance Summary */}
      <Card className="shadow-lg border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Net Balance</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(startDate), "MMM dd, yyyy")} -{" "}
                  {format(new Date(endDate), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            <p
              className={`text-4xl font-bold ${netBalance >= 0 ? "text-chart-1" : "text-destructive"}`}
            >
              {formatCurrency(netBalance)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
