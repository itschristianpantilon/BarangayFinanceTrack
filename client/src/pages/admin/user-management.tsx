import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { UserMenu } from "../../components/user-menu";
import { useToast } from "../../hooks/use-toast";
import { api, apiCall } from "../../utils/api";
import logoPath from "../../assets/san_agustin.jpg";

/* -------------------- TYPES -------------------- */

type UserRole =
  | "superadmin"
  | "admin"
  | "encoder"
  | "checker"
  | "reviewer"
  | "approver"
  | "viewer";

type User = {
  id: number;
  username: string;
  full_name: string;
  position: string;
  role: UserRole;
  is_active: boolean;
};

type UserFormData = {
  user_id?: number;
  username: string;
  password?: string;
  fullname: string;
  position: string;
  role: UserRole;
  is_active: "active" | "inactive";
};

/* -------------------- STATIC DATA -------------------- */

const roles = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin (Kapitan/Secretary)" },
  { value: "encoder", label: "Encoder (Treasurer)" },
  { value: "checker", label: "Checker (Bookkeeper)" },
  { value: "reviewer", label: "Reviewer (Council)" },
  { value: "approver", label: "Approver" },
  { value: "viewer", label: "Viewer" },
];

/* -------------------- LAYOUT -------------------- */

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

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
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormData>({
    defaultValues: {
      username: "",
      password: "",
      fullname: "",
      position: "",
      role: "encoder",
      is_active: "active",
    },
  });

  /* -------------------- FETCH USERS -------------------- */
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await apiCall<User[]>(api.users.getAll, {
        method: "GET",
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return;
      }

      if (data) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* -------------------- HANDLERS -------------------- */

  const handleAddUser = () => {
    setEditingUser(null);
    form.reset({
      username: "",
      password: "",
      fullname: "",
      position: "",
      role: "encoder",
      is_active: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.reset({
      user_id: user.id,
      username: user.username,
      password: "", // Leave blank - only update if filled
      fullname: user.full_name,
      position: user.position,
      role: user.role,
      is_active: user.is_active ? "active" : "inactive",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to deactivate ${user.username}?`)) {
      return;
    }

    try {
      const { data, error } = await apiCall(api.users.delete, {
        method: "PUT",
        body: JSON.stringify({ user_id: user.id }),
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return;
      }

      toast({
        title: "Success",
        description: "User deactivated successfully",
      });

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to deactivate user",
      });
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);

    try {
      if (editingUser) {
        // EDIT USER
        const payload: any = {
          user_id: data.user_id,
          fullname: data.fullname,
          position: data.position,
          role: data.role,
          is_active: data.is_active,
        };

        // Only include password if it's filled
        if (data.password && data.password.trim() !== "") {
          payload.password = data.password;
        }

        const { error } = await apiCall(api.users.edit, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error,
          });
          return;
        }

        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        // ADD USER
        if (!data.password || data.password.trim() === "") {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Password is required for new users",
          });
          return;
        }

        const { error } = await apiCall(api.users.add, {
          method: "POST",
          body: JSON.stringify({
            username: data.username,
            password: data.password,
            fullname: data.fullname,
            position: data.position,
            role: data.role,
            is_active: data.is_active,
          }),
        });

        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error,
          });
          return;
        }

        toast({
          title: "Success",
          description: "User added successfully",
        });
      }

      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const badgeVariant = (role: string) =>
    role === "admin" || role === "superadmin" ? "secondary" : "outline";

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage system users and access
            </p>
          </div>
          <Button onClick={handleAddUser} disabled={isLoading}>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {isLoading ? "Loading..." : `${users.length} users`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.position}</TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant(user.role)}>
                          {roles.find((r) => r.value === user.role)?.label ||
                            user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-sm">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <ShieldOff className="h-4 w-4" />
                            <span className="text-sm">Inactive</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditUser(user)}
                          title="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteUser(user)}
                          disabled={!user.is_active}
                          title="Deactivate user"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="Enter username"
                  {...form.register("username", {
                    required: "Username is required",
                  })}
                  disabled={!!editingUser} // Disable username edit
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Password {editingUser && "(leave blank to keep current)"}
                </label>
                <Input
                  type="password"
                  placeholder={
                    editingUser ? "Enter new password" : "Enter password"
                  }
                  {...form.register("password", {
                    required: editingUser ? false : "Password is required",
                  })}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Enter full name"
                  {...form.register("fullname", {
                    required: "Full name is required",
                  })}
                />
                {form.formState.errors.fullname && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.fullname.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  placeholder="Enter position"
                  {...form.register("position", {
                    required: "Position is required",
                  })}
                />
                {form.formState.errors.position && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.position.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  onValueChange={(v) =>
                    form.setValue("role", v as UserRole)
                  }
                  defaultValue={form.getValues("role")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  onValueChange={(v) =>
                    form.setValue("is_active", v as "active" | "inactive")
                  }
                  defaultValue={form.getValues("is_active")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingUser ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingUser ? "Update User" : "Create User"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}