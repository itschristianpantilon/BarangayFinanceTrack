import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Briefcase } from "lucide-react";
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
// Types and schema for FundOperation (static, local version)
import { z } from "zod";

export const insertFundOperationSchema = z.object({
  fundType: z.string(),
  period: z.string(),
  date: z.date(),
  openingBalance: z.string(),
  receipts: z.string(),
  disbursements: z.string(),
  closingBalance: z.string(),
});

export type InsertFundOperation = z.infer<typeof insertFundOperationSchema>;

export type FundOperation = {
  id: number;
  fundType: string;
  period: string;
  date: string | Date;
  openingBalance: string;
  receipts: string;
  disbursements: string;
  closingBalance: string;
};
import { queryClient, apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";

const fundTypes = [
  "General Fund",
  "SEF (Special Education Fund)",
  "Trust Fund",
  "20% Development Fund",
];

export default function FundOperations() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: operations, isLoading } = useQuery<FundOperation[]>({
    queryKey: ["/api/fund-operations"],
  });

  const form = useForm<InsertFundOperation>({
    resolver: zodResolver(insertFundOperationSchema),
    defaultValues: {
      fundType: "",
      openingBalance: "0",
      receipts: "0",
      disbursements: "0",
      closingBalance: "0",
      period: "",
      date: new Date(),
    },
  });

  const createFundOperation = useMutation({
    mutationFn: async (data: InsertFundOperation) => {
      return apiRequest("POST", "/api/fund-operations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fund-operations"] });
      toast({
        title: "Fund Operation Added",
        description: "Fund operation record has been successfully added.",
      });
      setOpen(false);
      form.reset();
    },
  });

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAmountChange = () => {
    const opening = parseFloat(form.getValues("openingBalance")) || 0;
    const receipts = parseFloat(form.getValues("receipts")) || 0;
    const disbursements = parseFloat(form.getValues("disbursements")) || 0;
    const closing = opening + receipts - disbursements;
    form.setValue("closingBalance", closing.toFixed(2));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">
            Statement of Fund Operations
          </h1>
          <p className="text-muted-foreground mt-1">
            Track fund balances and cash flow by fund type
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-fund-operation">
              <Plus className="h-4 w-4" />
              Add Fund Operation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-poppins">
                Add Fund Operation
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  createFundOperation.mutate(data),
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="fundType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fund Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-fund-type">
                            <SelectValue placeholder="Select fund type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fundTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Q1 2024, January 2024"
                          {...field}
                          data-testid="input-period"
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
                  name="openingBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Balance (₱)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleAmountChange();
                          }}
                          data-testid="input-opening-balance"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receipts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receipts (₱)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleAmountChange();
                          }}
                          data-testid="input-receipts"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="disbursements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disbursements (₱)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleAmountChange();
                          }}
                          data-testid="input-disbursements"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closingBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Balance (₱)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          readOnly
                          className="bg-muted"
                          data-testid="input-closing-balance"
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
                    disabled={createFundOperation.isPending}
                    data-testid="button-submit"
                  >
                    {createFundOperation.isPending
                      ? "Adding..."
                      : "Add Operation"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 border-card-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <Briefcase className="h-5 w-5 text-chart-3" />
            Total Fund Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-4xl font-bold text-foreground"
            data-testid="text-total-fund-balance"
          >
            {formatCurrency(
              operations?.reduce(
                (sum, op) => sum + parseFloat(op.closingBalance),
                0,
              ) || 0,
            )}
          </p>
        </CardContent>
      </Card>

      {/* Fund Operations Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-poppins">
            Fund Operations Records
          </CardTitle>
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
                  <TableHead>Fund Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Opening Balance</TableHead>
                  <TableHead className="text-right">Receipts</TableHead>
                  <TableHead className="text-right">Disbursements</TableHead>
                  <TableHead className="text-right">Closing Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No fund operation records found
                    </TableCell>
                  </TableRow>
                ) : (
                  operations?.map((operation) => (
                    <TableRow
                      key={operation.id}
                      data-testid={`row-fund-operation-${operation.id}`}
                    >
                      <TableCell>
                        {format(new Date(operation.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {operation.fundType}
                      </TableCell>
                      <TableCell>{operation.period}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(operation.openingBalance)}
                      </TableCell>
                      <TableCell className="text-right text-chart-1">
                        {formatCurrency(operation.receipts)}
                      </TableCell>
                      <TableCell className="text-right text-destructive">
                        {formatCurrency(operation.disbursements)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(operation.closingBalance)}
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
