import { useState } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
  LogOut,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { UserMenu } from "../../components/user-menu";
import logoPath from "../../assets/san_agustin.jpg";

/* -------------------- LOCAL STATIC TYPE -------------------- */

type UserWithoutPassword = {
  id: string;
  username: string;
  fullName: string;
  position: string;
  role:
    | "superadmin"
    | "admin"
    | "encoder"
    | "checker"
    | "reviewer"
    | "approver"
    | "viewer";
  isActive: "true" | "false";
  createdAt: Date;
  lastLogin: Date | null;
};

/* -------------------- STATIC DATA -------------------- */

const roles = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin (Kapitan/Secretary)" },
  { value: "encoder", label: "Encoder (Treasurer)" },
  { value: "checker", label: "Checker (Bookkeeper)" },
  { value: "reviewer", label: "Reviewer (Council)" },
  { value: "approver", label: "Approver" },
];

const initialUsers: UserWithoutPassword[] = [
  {
    id: "1",
    username: "admin01",
    fullName: "Juan Dela Cruz",
    position: "Barangay Captain",
    role: "admin",
    isActive: "true",
    createdAt: new Date(),
    lastLogin: null,
  },
  {
    id: "2",
    username: "encoder01",
    fullName: "Maria Santos",
    position: "Treasurer",
    role: "encoder",
    isActive: "true",
    createdAt: new Date(),
    lastLogin: null,
  },
];

/* -------------------- LAYOUT -------------------- */

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    setLocation("/login");
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    logout?.();
    setLocation("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src={logoPath}
              alt="Barangay Logo"
              className="h-12 w-12 rounded-full"
            />
            <div>
              <h2 className="text-sm font-bold">Barangay San Agustin</h2>
              <p className="text-xs text-muted-foreground">
                Financial Monitoring System
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          <Link href="/admin/users">
            <div className="flex items-center gap-2 p-2 rounded bg-blue-600 text-white">
              <Users className="h-4 w-4" /> Users
            </div>
          </Link>

          <Link href="/admin/activity-log">
            <div className="flex items-center gap-2 p-2 rounded hover:bg-muted">
              <Activity className="h-4 w-4" /> Activity Log
            </div>
          </Link>

          <Link href="/">
            <div className="flex items-center gap-2 p-2 rounded hover:bg-muted">
              <ArrowLeft className="h-4 w-4" /> Back to Main
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 text-destructive"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </nav>

        <div className="border-t p-3">
          <UserMenu />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

/* -------------------- PAGE -------------------- */

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithoutPassword[]>(initialUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(
    null,
  );

  const form = useForm<UserWithoutPassword>({
    defaultValues: {
      id: "",
      username: "",
      fullName: "",
      position: "",
      role: "encoder",
      isActive: "true",
      createdAt: new Date(),
      lastLogin: null,
    },
  });

  const handleAddUser = () => {
    setEditingUser(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UserWithoutPassword) => {
    setEditingUser(user);
    form.reset(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (!confirm("Delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const onSubmit = (data: UserWithoutPassword) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u)),
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          lastLogin: null,
        },
      ]);
    }
    setIsDialogOpen(false);
  };

  const badgeVariant = (role: string) =>
    role === "admin" || role === "superadmin" ? "secondary" : "outline";

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage system users and access
            </p>
          </div>
          <Button onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{users.length} users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>{u.position}</TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant(u.role)}>
                        {roles.find((r) => r.value === u.role)?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isActive === "true" ? (
                        <ShieldCheck className="text-green-600" />
                      ) : (
                        <ShieldOff className="text-red-600" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditUser(u)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add User"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <Input placeholder="Username" {...form.register("username")} />
              <Input placeholder="Full Name" {...form.register("fullName")} />
              <Input placeholder="Position" {...form.register("position")} />

              <Select
                onValueChange={(v) =>
                  form.setValue("role", v as UserWithoutPassword["role"])
                }
                defaultValue={form.getValues("role")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DialogFooter>
                <Button type="submit">
                  {editingUser ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
