import { db } from "./db";
import { revenues, expenses, fundOperations, budgetAllocations } from "../../shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed revenues
  await db.insert(revenues).values([
    {
      source: "Real Property Tax Collection",
      category: "Real Property Tax",
      amount: "250000.00",
      date: new Date("2024-10-15"),
      description: "Q4 2024 RPT Collection",
      referenceNumber: "OR-2024-001",
    },
    {
      source: "Business Permit Renewals",
      category: "Business Permits",
      amount: "180000.00",
      date: new Date("2024-10-20"),
      description: "Annual business permit renewals",
      referenceNumber: "OR-2024-002",
    },
    {
      source: "Market Stall Fees",
      category: "Fees & Charges",
      amount: "45000.00",
      date: new Date("2024-10-25"),
      description: "Monthly market stall rental fees",
      referenceNumber: "OR-2024-003",
    },
    {
      source: "National Tax Allocation",
      category: "National Tax Allocation",
      amount: "500000.00",
      date: new Date("2024-10-30"),
      description: "IRA Share - October 2024",
      referenceNumber: "NTA-2024-10",
    },
    {
      source: "Barangay Clearance Fees",
      category: "Fees & Charges",
      amount: "32000.00",
      date: new Date("2024-09-15"),
      description: "Clearance issuance fees",
      referenceNumber: "OR-2024-004",
    },
  ]);

  // Seed expenses
  await db.insert(expenses).values([
    {
      category: "General Public Services",
      subcategory: "Personnel",
      amount: "120000.00",
      date: new Date("2024-10-15"),
      description: "Barangay staff salaries - October 2024",
      payee: "Barangay Personnel",
      referenceNumber: "DV-2024-001",
    },
    {
      category: "Project Fund",
      subcategory: "Infrastructure",
      amount: "150000.00",
      date: new Date("2024-10-18"),
      description: "Road concreting materials",
      payee: "ABC Construction Supplies",
      referenceNumber: "DV-2024-002",
    },
    {
      category: "General Public Services",
      subcategory: "Utilities",
      amount: "25000.00",
      date: new Date("2024-10-20"),
      description: "Electricity and water bills",
      payee: "Utility Companies",
      referenceNumber: "DV-2024-003",
    },
    {
      category: "Economic Services",
      subcategory: "Agriculture",
      amount: "80000.00",
      date: new Date("2024-10-22"),
      description: "Farm input assistance program",
      payee: "Farmers Association",
      referenceNumber: "DV-2024-004",
    },
    {
      category: "General Public Services",
      subcategory: "Supplies",
      amount: "35000.00",
      date: new Date("2024-09-25"),
      description: "Office supplies and materials",
      payee: "Office Supplies Store",
      referenceNumber: "DV-2024-005",
    },
  ]);

  // Seed fund operations
  await db.insert(fundOperations).values([
    {
      fundType: "General Fund",
      openingBalance: "500000.00",
      receipts: "450000.00",
      disbursements: "380000.00",
      closingBalance: "570000.00",
      period: "Q3 2024",
      date: new Date("2024-09-30"),
    },
    {
      fundType: "SEF (Special Education Fund)",
      openingBalance: "120000.00",
      receipts: "75000.00",
      disbursements: "50000.00",
      closingBalance: "145000.00",
      period: "Q3 2024",
      date: new Date("2024-09-30"),
    },
  ]);

  // Seed budget allocations
  await db.insert(budgetAllocations).values([
    {
      category: "Infrastructure Projects",
      allocatedAmount: "800000.00",
      utilizedAmount: "450000.00",
      year: 2024,
    },
    {
      category: "Social Services",
      allocatedAmount: "300000.00",
      utilizedAmount: "180000.00",
      year: 2024,
    },
    {
      category: "Economic Programs",
      allocatedAmount: "200000.00",
      utilizedAmount: "120000.00",
      year: 2024,
    },
  ]);

  console.log("Database seeded successfully!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
