import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FolderKanban } from "lucide-react";
import { EncoderLayout } from "../../components/encoder-layout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Badge } from "../../components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertDfurProjectSchema,
  type DfurProject,
  type InsertDfurProject,
} from "../../../../deleted/shared/schema";
import { queryClient, apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";

const natureOfCollectionOptions = [
  "Infrastructure",
  "Health",
  "Peace and Order",
  "Appropriation & Education",
  "Agriculture",
  "Social Welfare",
  "Aquatic Resources",
];

const statusOptions = [
  "Planned",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "In Progress":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "Planned":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    case "On Hold":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "Cancelled":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    default:
      return "bg-muted";
  }
};

export default function DFUR() {
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<DfurProject | null>(
    null,
  );
  const [deleteProject, setDeleteProject] = useState<DfurProject | null>(null);
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery<DfurProject[]>({
    queryKey: ["/api/dfur"],
  });

  const { data: transactionIdData } = useQuery<{ transactionId: string }>({
    queryKey: ["/api/dfur/generate-id"],
    enabled: open && !editingProject,
  });

  const form = useForm<InsertDfurProject>({
    resolver: zodResolver(insertDfurProjectSchema),
    defaultValues: {
      transactionId: "",
      transactionDate: new Date(),
      natureOfCollection: "",
      project: "",
      location: "",
      totalCostApproved: "0",
      dateStarted: new Date(),
      targetCompletionDate: new Date(),
      status: "Planned",
      totalCostIncurred: "0",
      numberOfExtensions: 0,
      remarks: "",
    },
  });

  useEffect(() => {
    if (transactionIdData && !editingProject) {
      form.setValue("transactionId", transactionIdData.transactionId);
    }
  }, [transactionIdData, editingProject, form]);

  useEffect(() => {
    if (editingProject) {
      form.reset({
        transactionId: editingProject.transactionId,
        transactionDate: new Date(editingProject.transactionDate),
        natureOfCollection: editingProject.natureOfCollection,
        project: editingProject.project,
        location: editingProject.location,
        totalCostApproved: editingProject.totalCostApproved,
        dateStarted: new Date(editingProject.dateStarted),
        targetCompletionDate: new Date(editingProject.targetCompletionDate),
        status: editingProject.status,
        totalCostIncurred: editingProject.totalCostIncurred,
        numberOfExtensions: editingProject.numberOfExtensions,
        remarks: editingProject.remarks || "",
      });
    } else {
      form.reset({
        transactionId: transactionIdData?.transactionId || "",
        transactionDate: new Date(),
        natureOfCollection: "",
        project: "",
        location: "",
        totalCostApproved: "0",
        dateStarted: new Date(),
        targetCompletionDate: new Date(),
        status: "Planned",
        totalCostIncurred: "0",
        numberOfExtensions: 0,
        remarks: "",
      });
    }
  }, [editingProject, form, transactionIdData]);

  const createProject = useMutation({
    mutationFn: async (data: InsertDfurProject) => {
      return apiRequest("POST", "/api/dfur", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dfur"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dfur/generate-id"] });
      toast({
        title: "DFUR Project Added",
        description: "Development fund project has been successfully added.",
      });
      setOpen(false);
      setEditingProject(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Adding Project",
        description:
          error.message || "Failed to add DFUR project. Please try again.",
      });
    },
  });

  const updateProject = useMutation({
    mutationFn: async (data: InsertDfurProject) => {
      if (!editingProject) throw new Error("No project selected for editing");
      return apiRequest("PATCH", `/api/dfur/${editingProject.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dfur"] });
      toast({
        title: "Project Updated",
        description: "DFUR project has been successfully updated.",
      });
      setOpen(false);
      setEditingProject(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Updating Project",
        description:
          error.message || "Failed to update project. Please try again.",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/dfur/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dfur"] });
      toast({
        title: "Project Deleted",
        description: "DFUR project has been successfully deleted.",
      });
      setDeleteProject(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error Deleting Project",
        description:
          error.message || "Failed to delete project. Please try again.",
      });
    },
  });

  const handleSubmit = (data: InsertDfurProject) => {
    if (editingProject) {
      updateProject.mutate(data);
    } else {
      createProject.mutate(data);
    }
  };

  const handleEdit = (project: DfurProject) => {
    setEditingProject(project);
    setOpen(true);
  };

  const handleDelete = (project: DfurProject) => {
    setDeleteProject(project);
  };

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      setEditingProject(null);
      form.reset();
    }
    setOpen(isOpen);
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalApproved =
    projects?.reduce((sum, p) => sum + parseFloat(p.totalCostApproved), 0) || 0;
  const totalIncurred =
    projects?.reduce((sum, p) => sum + parseFloat(p.totalCostIncurred), 0) || 0;
  const activeProjects =
    projects?.filter((p) => p.status === "In Progress").length || 0;

  return (
    <EncoderLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-poppins">
              Development Fund Utilization Report (DFUR)
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage development fund projects
            </p>
          </div>
          <Dialog open={open} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-dfur">
                <Plus className="h-4 w-4" />
                Add DFUR Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-poppins">
                  {editingProject ? "Edit DFUR Project" : "Add DFUR Project"}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              readOnly
                              className="bg-muted"
                              data-testid="input-transaction-id"
                            />
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
                              value={
                                field.value
                                  ? format(new Date(field.value), "yyyy-MM-dd")
                                  : ""
                              }
                              onChange={(e) =>
                                field.onChange(new Date(e.target.value))
                              }
                              data-testid="input-transaction-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="natureOfCollection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nature of Collection - ECONOMIC SERVICES
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-nature-of-collection">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {natureOfCollectionOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
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
                    name="project"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Project name"
                            {...field}
                            data-testid="input-project"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Project location"
                            {...field}
                            data-testid="input-location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalCostApproved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Cost Approved (₱)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              data-testid="input-total-cost-approved"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalCostIncurred"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Cost Incurred (₱)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              data-testid="input-total-cost-incurred"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dateStarted"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Started</FormLabel>
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
                              data-testid="input-date-started"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetCompletionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Completion Date</FormLabel>
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
                              data-testid="input-target-completion"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                      name="numberOfExtensions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. of Extensions</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                              data-testid="input-extensions"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes or remarks"
                            className="resize-none"
                            rows={3}
                            {...field}
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
                      onClick={() => handleDialogClose(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createProject.isPending || updateProject.isPending
                      }
                      data-testid="button-submit"
                    >
                      {createProject.isPending || updateProject.isPending
                        ? "Saving..."
                        : editingProject
                          ? "Update Project"
                          : "Add Project"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-base">
                <FolderKanban className="h-5 w-5 text-chart-1" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-4xl font-bold text-foreground"
                data-testid="text-total-projects"
              >
                {projects?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-base">
                Total Approved Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-3xl font-bold text-foreground"
                data-testid="text-total-approved"
              >
                {formatCurrency(totalApproved)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-base">
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-4xl font-bold text-foreground"
                data-testid="text-active-projects"
              >
                {activeProjects}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-poppins">DFUR Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-muted rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Nature</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">
                        Approved Cost
                      </TableHead>
                      <TableHead className="text-right">
                        Incurred Cost
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Extensions</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!projects || projects.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No DFUR projects found
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project) => (
                        <TableRow
                          key={project.id}
                          data-testid={`row-dfur-${project.id}`}
                        >
                          <TableCell className="font-mono text-sm">
                            {project.transactionId}
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {project.project}
                          </TableCell>
                          <TableCell className="text-sm">
                            {project.natureOfCollection}
                          </TableCell>
                          <TableCell className="text-sm">
                            {project.location}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(project.totalCostApproved)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(project.totalCostIncurred)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(project.status)}
                              variant="outline"
                            >
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {project.numberOfExtensions}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(project)}
                                data-testid={`button-edit-${project.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(project)}
                                data-testid={`button-delete-${project.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteProject}
          onOpenChange={(open) => !open && setDeleteProject(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete DFUR Project?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete project "
                {deleteProject?.project}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteProject &&
                  deleteProjectMutation.mutate(deleteProject.id)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EncoderLayout>
  );
}
