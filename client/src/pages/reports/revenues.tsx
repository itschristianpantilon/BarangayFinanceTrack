import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, TrendingUp } from "lucide-react";
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

type Revenue = {
  id: number;
  source: string;
  category: string;
  amount: string;
  date: string | Date;
  description?: string;
  referenceNumber?: string;
};

// Define the schema for inserting a revenue record
export const insertRevenueSchema = z.object({
  source: z.string().min(1, "Source is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.union([z.string(), z.date()]),
  description: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export type InsertRevenue = z.infer<typeof insertRevenueSchema>;

import { queryClient, apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";

const revenueCategories = [
  "Real Property Tax",
  "Business Permits",
  "Fees & Charges",
  "Other Revenues",
  "National Tax Allocation",
];

export default function Revenues() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: revenues, isLoading } = useQuery<Revenue[]>({
    queryKey: ["/api/revenues"],
  });

  const form = useForm<InsertRevenue>({
    resolver: zodResolver(insertRevenueSchema),
    defaultValues: {
      source: "",
      category: "",
      amount: "0",
      date: new Date(),
      description: "",
      referenceNumber: "",
    },
  });

  const createRevenue = useMutation({
    mutationFn: async (data: InsertRevenue) => {
      return apiRequest("POST", "/api/revenues", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/revenues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-data"] });
      queryClient.invalidateQueries({ queryKey: ["/api/revenue-by-category"] });
      toast({
        title: "Revenue Added",
        description: "Revenue record has been successfully added.",
      });
      setOpen(false);
      form.reset();
    },
  });

  const filteredRevenues = revenues?.filter(
    (revenue) =>
      revenue.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revenue.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalRevenue =
    revenues?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;

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
            Revenue Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage barangay revenue sources
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-revenue">
              <Plus className="h-4 w-4" />
              Add Revenue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                Add New Revenue
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  createRevenue.mutate(data),
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter revenue source"
                          {...field}
                          data-testid="input-source"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {revenueCategories.map((cat) => (
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
                  name="referenceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="OR/AR Number"
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
                          placeholder="Additional details"
                          {...field}
                          value={field.value || ""}
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
                    disabled={createRevenue.isPending}
                    data-testid="button-submit"
                  >
                    {createRevenue.isPending ? "Adding..." : "Add Revenue"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Revenue Card */}
      <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-card-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <TrendingUp className="h-5 w-5 text-chart-1" />
            Total Revenue Collected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-4xl font-bold text-foreground"
            data-testid="text-total-revenue-collected"
          >
            {formatCurrency(totalRevenue)}
          </p>
        </CardContent>
      </Card>

      {/* Revenue Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-poppins">Revenue Records</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search revenues..."
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
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Reference #</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRevenues?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No revenue records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRevenues?.map((revenue) => (
                    <TableRow
                      key={revenue.id}
                      data-testid={`row-revenue-${revenue.id}`}
                    >
                      <TableCell>
                        {format(new Date(revenue.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {revenue.source}
                      </TableCell>
                      <TableCell>{revenue.category}</TableCell>
                      <TableCell>{revenue.referenceNumber || "—"}</TableCell>
                      <TableCell className="text-right font-semibold text-chart-1">
                        {formatCurrency(revenue.amount)}
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
