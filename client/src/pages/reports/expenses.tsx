import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, TrendingDown } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { queryClient, apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";

// Local types for Expenses
export type Expense = {
  id: string;
  category: string;
  subcategory: string;
  amount: string;
  date: Date;
  description: string;
  payee?: string;
  referenceNumber?: string;
};

export type InsertExpense = Omit<Expense, "id">;

const insertExpenseSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.date(),
  description: z.string().min(1, "Description is required"),
  payee: z.string().optional(),
  referenceNumber: z.string().optional(),
});

// Sample expense data
const expensesStatic: Expense[] = [
  {
    id: "1",
    category: "Project Fund",
    subcategory: "Infrastructure",
    amount: "50000",
    date: new Date("2026-01-05"),
    description: "Repair barangay hall roof",
    payee: "ABC Construction",
    referenceNumber: "DV-001",
  },
  {
    id: "2",
    category: "Economic Services",
    subcategory: "Agriculture",
    amount: "25000",
    date: new Date("2026-01-10"),
    description: "Purchase seeds for farm program",
    payee: "Green Farms",
    referenceNumber: "DV-002",
  },
  {
    id: "3",
    category: "General Public Services",
    subcategory: "Utilities",
    amount: "10000",
    date: new Date("2026-01-12"),
    description: "Electricity bill payment",
    payee: "MERALCO",
    referenceNumber: "DV-003",
  },
];


const expenseCategories = {
  "Project Fund": ["Infrastructure", "Equipment", "Programs"],
  "Economic Services": ["Agriculture", "Trade & Industry", "Tourism"],
  "General Public Services": [
    "Personnel",
    "Utilities",
    "Supplies",
    "Maintenance",
  ],
};

export default function Expenses() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { toast } = useToast();

const expenses = expensesStatic;
const isLoading = false;


  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      category: "",
      subcategory: "",
      amount: "0",
      date: new Date(),
      description: "",
      payee: "",
      referenceNumber: "",
    },
  });

  const createExpense = useMutation({
    mutationFn: async (data: InsertExpense) => {
      return apiRequest("POST", "/api/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/expense-by-category"] });
      toast({
        title: "Expense Added",
        description: "Expense record has been successfully added.",
      });
      setOpen(false);
      form.reset();
      setSelectedCategory("");
    },
  });

  const filteredExpenses = expenses?.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.payee?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalExpenses =
    expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">
            Expense Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage barangay disbursements
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-expense">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                Add New Expense
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  createExpense.mutate(data),
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedCategory(value);
                          form.setValue("subcategory", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(expenseCategories).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedCategory}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-subcategory">
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedCategory &&
                            expenseCategories[
                              selectedCategory as keyof typeof expenseCategories
                            ]?.map((sub) => (
                              <SelectItem key={sub} value={sub}>
                                {sub}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? format(new Date(field.value), "yyyy-MM-dd")
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                          data-testid="input-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="payee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payee</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Recipient name"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-payee"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="DV/Check Number"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-reference"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Purpose of expense"
                          {...field}
                          data-testid="input-description"
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
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createExpense.isPending}
                    data-testid="button-submit"
                  >
                    {createExpense.isPending ? "Adding..." : "Add Expense"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Expenses Card */}
      <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-card-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Total Expenses Disbursed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-4xl font-bold text-foreground"
            data-testid="text-total-expenses-disbursed"
          >
            {formatCurrency(totalExpenses)}
          </p>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-poppins">Expense Records</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead>Reference #</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No expense records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses?.map((expense) => (
                    <TableRow
                      key={expense.id}
                      data-testid={`row-expense-${expense.id}`}
                    >
                      <TableCell>
                        {format(new Date(expense.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {expense.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {expense.subcategory}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.payee || "—"}</TableCell>
                      <TableCell>{expense.referenceNumber || "—"}</TableCell>
                      <TableCell className="text-right font-semibold text-destructive">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
