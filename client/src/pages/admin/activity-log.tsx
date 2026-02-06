import { useState, useEffect } from "react";
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
import { Users, Activity, LogOut, ArrowLeft, Loader2 } from "lucide-react";
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
  payee?: string;
  payor?: string;
  reviewComment?: string;
}

/* =======================
   STATIC DATA
======================= */
const MOCK_ADMIN_USER = {
  role: "admin",
};

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
            className="flex items-center gap-3 px-3 py-2.5 text-destructive hover:bg-destructive/10 rounded-md w-full"
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
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("http://127.0.0.1:5000/api/get-all-docs");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API data to match ActivityLog interface
      const transformedData: ActivityLog[] = data.map((item: any) => {
        // Determine transaction type based on transaction_id prefix
        let type = "collection";
        let description = "";
        let category = "";
        let amount = "0.00";
        let date = "";
        
        if (item.transaction_id?.startsWith("COLL-")) {
          type = "collection";
          description = item.nature_of_collection || "Collection";
          category = item.nature_of_collection || "Collection";
          amount = item.amount || "0.00";
          date = item.transaction_date || item.created_at;
        } else if (item.transaction_id?.startsWith("DISB-")) {
          type = "disbursement";
          description = item.nature_of_disbursement || "Disbursement";
          category = item.nature_of_disbursement || "Disbursement";
          amount = item.amount || "0.00";
          date = item.transaction_date || item.created_at;
        } else if (item.transaction_id?.startsWith("BUDG-")) {
          type = "budget_entry";
          description = item.expenditure_program || "Budget Entry";
          category = item.allocation_category || "Budget";
          amount = item.amount || "0.00";
          date = item.transaction_date || item.created_at;
        } else if (item.transaction_id?.startsWith("DFUR-")) {
          type = "dfur";
          description = item.project || "Development Fund Utilization";
          category = item.name_of_collection || "DFUR";
          amount = item.total_cost_incurred || item.total_cost_approved || "0.00";
          date = item.transaction_date || item.created_at;
        }
        
        // Determine status based on review_status and is_flagged
        let status: StatusKey = "pending";
        if (item.review_status === "approved") {
          status = "approved";
        } else if (item.is_flagged === 1) {
          status = "flagged";
        } else if (item.review_status === "pending") {
          status = "pending";
        }
        
        return {
          id: String(item.id),
          transactionId: item.transaction_id || "N/A",
          type,
          date,
          description,
          category,
          amount,
          status,
          payee: item.payee,
          payor: item.payor,
          reviewComment: item.review_comment,
        };
      });
      
      // Sort by date (newest first)
      transformedData.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
      
      setActivityLogs(transformedData);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold font-poppins">Activity Log</h1>
          <Button onClick={fetchActivityLogs} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              {loading
                ? "Loading transactions..."
                : `Showing ${activityLogs.length} transactions`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">
                  Loading activity logs...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive font-semibold mb-2">
                  Error loading data
                </p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchActivityLogs} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {activityLogs.map((activity) => (
                      <TableRow key={`${activity.transactionId}-${activity.id}`}>
                        <TableCell className="font-mono text-xs">
                          {activity.transactionId}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeBadge(activity.type)}>
                            {activity.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {activity.date
                            ? new Date(activity.date).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {activity.description}
                        </TableCell>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}