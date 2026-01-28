import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Users, Activity, LogOut, ArrowLeft } from "lucide-react";
import { UserMenu } from "../../components/user-menu";
import logoPath from "../../assets/san_agustin.jpg";

/* =======================
   TYPES
======================= */
type StatusKey = "pending" | "approved" | "flagged";

interface ActivityLog {
  id: string;
  transactionId: string;
  type: string;
  date: string;
  description: string;
  category: string;
  amount: string;
  status: StatusKey;
}

/* =======================
   STATIC DATA
======================= */
const MOCK_ADMIN_USER = {
  role: "admin",
};

const STATIC_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "1",
    transactionId: "TXN-2025-001",
    type: "collection",
    date: "2025-01-10",
    description: "Barangay clearance payment",
    category: "Clearance Fees",
    amount: "150.00",
    status: "approved",
  },
  {
    id: "2",
    transactionId: "TXN-2025-002",
    type: "disbursement",
    date: "2025-01-11",
    description: "Office supplies purchase",
    category: "Office Expenses",
    amount: "2450.75",
    status: "pending",
  },
  {
    id: "3",
    transactionId: "TXN-2025-003",
    type: "budget_entry",
    date: "2025-01-12",
    description: "Q1 Operational Budget",
    category: "Budget Allocation",
    amount: "50000.00",
    status: "approved",
  },
];

/* =======================
   LAYOUT
======================= */
interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: "users" | "activity";
}

function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const user = MOCK_ADMIN_USER;

  const handleLogout = () => {
    setLocation("/login");
  };

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r bg-card flex flex-col overflow-y-auto">
        <div className="p-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={logoPath}
              alt="Barangay San Agustin Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-sm font-bold font-poppins">
                Barangay San Agustin
              </h2>
              <p className="text-xs text-muted-foreground">
                Financial Monitoring System
              </p>
              <p className="text-xs text-muted-foreground">Iba, Zambales</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-bold font-poppins">Admin Panel</h3>
          <p className="text-xs text-muted-foreground">
            {currentPage === "users" ? "User Management" : "Activity Log"}
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/admin/users">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
                currentPage === "users"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-muted"
              }`}
            >
              <Users className="h-4 w-4" />
              Users
            </div>
          </Link>

          <Link href="/admin/activity-log">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
                currentPage === "activity"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-muted"
              }`}
            >
              <Activity className="h-4 w-4" />
              Activity Log
            </div>
          </Link>

          <div className="border-t my-3" />

          <Link href="/">
            <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-md">
              <ArrowLeft className="h-4 w-4" />
              Back to Main Page
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-destructive hover:bg-destructive/10 rounded-md"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>

        <div className="p-3 border-t">
          <UserMenu />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}

/* =======================
   PAGE
======================= */
export default function ActivityLogPage() {
  const [limit] = useState(100);

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `₱${num.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      collection: "bg-green-600 text-white",
      disbursement: "bg-orange-600 text-white",
      budget_entry: "bg-blue-600 text-white",
      dfur: "bg-purple-600 text-white",
    };
    return map[type] ?? "bg-gray-400 text-white";
  };

  const getStatusBadge = (status: StatusKey) => {
    const map: Record<StatusKey, string> = {
      pending: "bg-gray-400 text-white",
      approved: "bg-green-600 text-white",
      flagged: "bg-red-600 text-white",
    };
    return map[status];
  };

  return (
    <AdminLayout currentPage="activity">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold font-poppins">Activity Log</h1>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest {limit} transactions (static data)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {STATIC_ACTIVITY_LOGS.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-mono text-xs">
                      {activity.transactionId}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeBadge(activity.type)}>
                        {activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(activity.date).toLocaleDateString("en-PH")}
                    </TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell>{activity.category}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(activity.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(activity.status)}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
