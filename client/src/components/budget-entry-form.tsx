import { z } from "zod";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useQuery } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { api, apiCall } from "../utils/api";

export type BudgetEntry = {
  id: string;
  transactionId: string;
  transactionDate: string;
  expenditureProgram: string;
  category: string;
  subcategory: string;
  programDescription?: string;
  fundSource: string;
  amount: string;
  payee: string;
  dvNumber: string;
  remarks?: string;
};

export type InsertBudgetEntry = Omit<BudgetEntry, "id">;


const EXPENDITURE_PROGRAMS = [
  {
    category: "A. Personal Services",
    subcategories: [
      "Honoraria",
      "Cash gift",
      "Mid year bonus",
      "Year end bonus",
      "Productivity Enhancement Incentive (PEI)",
      "Annual leave benefits",
    ],
  },
  {
    category: "B. Maintenance and Other Operating Expenses (MOOE)",
    subcategories: [
      "Traveling Expenses",
      "Training Expenses",
      "Office Supplies Expenses",
      "Accountable Forms Expenses",
      "Electricity Expenses",
      "Auditing Services",
      "Bookkeeping Services",
      "Fuel, Oil, and Lubricants",
      "Other supplies and materials expenses",
      "Drugs and Medicines expenses",
      "Uniforms and Clothing Expenses",
      "Representation Expense",
      "Fidelity Bond Premiums",
      "Repairs and Maintenance- Building and Other Structures Maintenance and Repair Expenses",
      "Transportation Equipment",
      "Other Professional Services",
      "Other Personal services",
      "Other General Services",
      "Janitorial Services",
      "Waste Segregation Management",
      "Insurance Premium",
      "Discretionary Fund",
      "Membership Dues and Contributions to Organizations",
      "Donations",
      "Other MOOE",
    ],
  },
  {
    category: "C. Capital Outlay",
    subcategories: [
      "Land Improvements",
      "Infrastructure Assets- Buildings and Other Structures",
      "Machinery and Equipment",
      "Transportation Equipment",
      "Furniture, Fixtures and Books",
      "Other P.P.E",
    ],
  },
  {
    category: "D. Special Purpose Appropriations (SPA)",
    subcategories: ["Appropriation for SK", "Other Authorized SPAs"],
  },
  {
    category: "E. Basic Services - Social Services",
    subcategories: [
      "Day Care Services: Subsidy to Day Care Worker",
      "Health and Nutrition Services: Subsidy to BHWs and Brgy, Nutrition Scholars",
      "Peace and Order Services: Subsidy to BPATS",
      "Katarungang Pambarangay Services: Subsidy to Lupon Members",
    ],
  },
  {
    category: "F. Infrastructure Projects - 20% Development Fund",
    subcategories: [
      "Rehabilitation/Repair of Barangay Jail",
      "Construction Extension shed of Brgy. Covered Court",
      "Construction/Extension of Barangay Shed or Hall",
      "Construction of Kitchen & Stock Room",
      "Improvement of Rooftop",
      "Construction of Welcome Signage",
      "Construction of Canals",
      "Installation of CCTV Cameras",
      "Repair of Barangay Hall, Covered Court, & Fence",
      "Fabrication & Repair of Signages",
    ],
  },
  {
    category: "G. Other Services",
    subcategories: [
      "Quick Response Fund (QRF) Activities",
      "Purchase of food commodities",
      "Disaster Preparedness, Prevention and Mitigation Response Rehabilitation and Recovery",
      "Purchase of expandable items",
      "Declogging and Dredging of Canals",
      "Tree and Bushes pruning",
      "Conducting fire and Earthquake Drill",
      "Senior Citizen/PWDs Services",
      "BCPC",
      "Others",
    ],
  },
];

const FUND_SOURCES = [
  "General Fund",
  "5% DRRMF",
  "Trust Fund",
  "20% Development Fund",
];

const insertBudgetEntrySchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  transactionDate: z.string().min(1, "Transaction date is required"),

  expenditureProgram: z.string().min(1, "Expenditure program is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),

  programDescription: z.string().optional(),

  fundSource: z.string().min(1, "Fund source is required"),

  amount: z
    .string()
    .refine((val) => parseFloat(val) > 0, "Amount must be greater than 0"),

  payee: z.string().min(1, "Payee is required"),
  dvNumber: z.string().min(1, "DV number is required"),

  remarks: z.string().optional(),
});


interface BudgetEntryFormProps {
  mode: "create" | "edit";
  entry?: BudgetEntry;
  onSubmit: (data: InsertBudgetEntry) => void;
  isPending: boolean;
  onCancel: () => void;
}

export function BudgetEntryForm({
  mode,
  entry,
  onSubmit,
  isPending,
  onCancel,
}: BudgetEntryFormProps) {
const { data: transactionIdData } = useQuery<{
  transactionId: string;
  dvNumber: string;
}>({
  queryKey: ["budget-entries-generate-id"],
  queryFn: async () => {
    const { data, error } = await apiCall<{
      transaction_id: string;
      div_number: number;
    }>(api.budgetEntries.generateId);

    if (error) throw new Error(error);

    return {
      transactionId: data.transaction_id,
      dvNumber: String(data.div_number), // ensure string for form
    };
  },
  enabled: mode === "create",
});

const toDateInputValue = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return date.toISOString().split("T")[0]; // yyyy-MM-dd
};



  const form = useForm<InsertBudgetEntry>({
    resolver: zodResolver(insertBudgetEntrySchema),
    defaultValues: {
      transactionId: "",
      transactionDate: "",
      expenditureProgram: "",
      category: "",
      subcategory: "",
      programDescription: "",
      fundSource: "",
      amount: "0",
      payee: "",
      dvNumber: "",
      remarks: "",
    },
  });

  // Reset form when mode changes or entry changes
useEffect(() => {
  if (mode === "create") {
    form.reset({
      transactionId: transactionIdData?.transactionId || "",
      dvNumber: transactionIdData?.dvNumber || "",
      transactionDate: "",
      expenditureProgram: "",
      category: "",
      subcategory: "",
      programDescription: "",
      fundSource: "",
      amount: "",
      payee: "",
      remarks: "",
    });
  } else if (mode === "edit" && entry) {
    form.reset({
      transactionId: entry.transactionId,
      transactionDate: toDateInputValue(entry.transactionDate),
      expenditureProgram: entry.expenditureProgram,
      category: entry.category,
      subcategory: entry.subcategory,
      programDescription: entry.programDescription || "",
      fundSource: entry.fundSource,
      amount: entry.amount,
      payee: entry.payee,
      dvNumber: entry.dvNumber,
      remarks: entry.remarks || "",
    });
  }
}, [mode, entry, transactionIdData, form]);


  // Update transaction ID when it's generated
useEffect(() => {
  if (mode === "create" && transactionIdData) {
    form.setValue("transactionId", transactionIdData.transactionId);
    form.setValue("dvNumber", transactionIdData.dvNumber);
  }
}, [transactionIdData, mode, form]);


  const selectedCategory = form.watch("category");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction ID</FormLabel>
              <FormControl>
                <Input {...field} disabled data-testid="input-transaction-id" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transaction Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  data-testid="input-transaction-date"
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
              <FormLabel>Expenditure Program Category</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("subcategory", "");
                  const selected = EXPENDITURE_PROGRAMS.find(
                    (p) => p.category === value,
                  );
                  if (selected && selected.subcategories.length > 0) {
                    form.setValue(
                      "expenditureProgram",
                      selected.subcategories[0],
                    );
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPENDITURE_PROGRAMS.map((program) => (
                    <SelectItem key={program.category} value={program.category}>
                      {program.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedCategory && (
          <FormField
            control={form.control}
            name="subcategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expenditure Program Subcategory</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("expenditureProgram", value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-subcategory">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXPENDITURE_PROGRAMS.find(
                      (p) => p.category === selectedCategory,
                    )?.subcategories.map((sub) => (
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
        )}

        <FormField
          control={form.control}
          name="programDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Program/Project/Activity Description (Optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="e.g., Conduct of day care sessions, Provision of medicines, etc."
                  rows={3}
                  data-testid="input-program-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fundSource"
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
                  {FUND_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
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
          name="payee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Name of payee"
                  data-testid="input-payee"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dvNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DV Number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled
                  data-testid="input-dv-number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


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
                  rows={2}
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
            onClick={onCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            data-testid="button-submit"
          >
            {isPending
              ? "Saving..."
              : mode === "create"
                ? "Add Budget Entry"
                : "Update Budget Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
