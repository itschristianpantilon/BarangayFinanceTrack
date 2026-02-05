import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
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
} from "../../components/ui/table";
type Revenue = {
  id: string;
  amount: string;
  [key: string]: any;
};

type Expense = {
  id: string;
  amount: string;
  [key: string]: any;
};

type FundOperation = {
  id: string;
  closingBalance: string;
  [key: string]: any;
};

type BudgetAllocation = {
  id: string;
  category: string;
  allocatedAmount: string;
  utilizedAmount: string;
  [key: string]: any;
};

export default function Reports() {
  const { data: revenues } = useQuery<Revenue[]>({
    queryKey: ["/api/revenues"],
  });

  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: fundOperations } = useQuery<FundOperation[]>({
    queryKey: ["/api/fund-operations"],
  });

  const { data: budgetAllocations } = useQuery<BudgetAllocation[]>({
    queryKey: ["/api/budget-allocations"],
  });

  const totalRevenues =
    revenues?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
  const totalExpenses =
    expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
  const totalFundBalance =
    fundOperations?.reduce((sum, f) => sum + parseFloat(f.closingBalance), 0) ||
    0;

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleExport = (reportType: string) => {
    alert(`Exporting ${reportType} report...`);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground font-poppins">
          Financial Reports
        </h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive financial reports and analytics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-chart-1">
                  {formatCurrency(totalRevenues)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Fund Balance
                </p>
                <p className="text-2xl font-bold text-chart-3">
                  {formatCurrency(totalFundBalance)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-poppins">Available Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 hover-elevate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">
                    Statement of Receipts and Expenditures
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive income and expense report
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleExport("Receipts and Expenditures")}
                data-testid="button-export-receipts-expenditures"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 hover-elevate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">
                    Statement of Fund Operations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fund balances and cash flow by fund type
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleExport("Fund Operations")}
                data-testid="button-export-fund-operations"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 hover-elevate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Fund Utilization Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Detailed fund allocation and utilization
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleExport("Fund Utilization")}
                data-testid="button-export-fund-utilization"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 hover-elevate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold">Disbursement Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete disbursement history and details
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleExport("Disbursement Records")}
                data-testid="button-export-disbursements"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Allocation Summary */}
      {budgetAllocations && budgetAllocations.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">
              Budget Allocation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Utilized</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Utilization %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetAllocations.map((allocation) => {
                  const balance =
                    parseFloat(allocation.allocatedAmount) -
                    parseFloat(allocation.utilizedAmount);
                  const percentage =
                    (parseFloat(allocation.utilizedAmount) /
                      parseFloat(allocation.allocatedAmount)) *
                    100;
                  return (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium">
                        {allocation.category}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(allocation.allocatedAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(allocation.utilizedAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            percentage > 90
                              ? "text-destructive"
                              : "text-chart-1"
                          }
                        >
                          {percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
