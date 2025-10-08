"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import {
  targetsService,
  groupsService,
  Target,
  TargetCreate,
  TargetUpdate,
  Group,
  GroupCreate,
  GroupUpdate,
} from "@/lib/auth";
import { useSearchParams } from "next/navigation";

const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  position: z.string().optional(),
  group_id: z.number().optional(),
  is_active: z.boolean(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type GroupForm = z.infer<typeof groupSchema>;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Target[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createloading, setcreateLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Target | null>(null);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<"employees" | "groups">(
    "employees"
  );

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      position: "",
      group_id: undefined,
      is_active: true,
    },
  });

  const editForm = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      position: "",
      group_id: undefined,
      is_active: true,
    },
  });

  const groupForm = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const editGroupForm = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const openModal = useSearchParams().get("openModal");

  useEffect(() => {
    fetchEmployees();
    fetchGroups();
    if (openModal === "true") {
      setIsCreateDialogOpen(true);
    }
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await targetsService.getTargets();
      setEmployees(data);
    } catch (error) {
      toast.error("Failed to fetch employees");
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const data = await groupsService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleCreateEmployee = async (data: EmployeeForm) => {
    setcreateLoading(true);
    try {
      await targetsService.createTarget(data);
      toast.success("Employee created successfully");
      setIsCreateDialogOpen(false);
      form.reset();
      fetchEmployees();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to create employee";
      toast.error(errorMessage);
    } finally {
      setcreateLoading(false);
    }
  };

  const handleEditEmployee = async (data: EmployeeForm) => {
    if (!editingEmployee) return;
    setcreateLoading(true);
    try {
      await targetsService.updateTarget(editingEmployee.id, data);
      toast.success("Employee updated successfully");
      setEditingEmployee(null);
      setIsEditDialogOpen(false);
      editForm.reset();
      fetchEmployees();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to update employee";
      toast.error(errorMessage);
    } finally {
      setcreateLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    setcreateLoading(true);
    try {
      await targetsService.deleteTarget(employeeId);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      toast.error("Failed to delete employee");
    } finally {
      setcreateLoading(false);
    }
  };

  const handleCreateGroup = async (data: GroupForm) => {
    setcreateLoading(true);
    try {
      await groupsService.createGroup(data);
      toast.success("Group created successfully");
      setIsCreateGroupDialogOpen(false);
      groupForm.reset();
      fetchGroups();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to create group";
      toast.error(errorMessage);
    } finally {
      setcreateLoading(false);
    }
  };

  const handleEditGroup = async (data: GroupForm) => {
    if (!editingGroup) return;
    setcreateLoading(true);
    try {
      await groupsService.updateGroup(editingGroup.id, data);
      toast.success("Group updated successfully");
      setEditingGroup(null);
      setIsEditGroupDialogOpen(false);
      editGroupForm.reset();
      fetchGroups();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to update group";
      toast.error(errorMessage);
    } finally {
      setcreateLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    setcreateLoading(true);
    try {
      await groupsService.deleteGroup(groupId);
      toast.success("Group deleted successfully");
      fetchGroups();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to delete group";
      toast.error(errorMessage);
    } finally {
      setcreateLoading(false);
    }
  };

  const openEditGroupDialog = (group: Group) => {
    setEditingGroup(group);
    setIsEditGroupDialogOpen(true);
    editGroupForm.reset({
      name: group.name,
      description: group.description || "",
      is_active: group.is_active,
    });
  };

  const getEmployeeCountForGroup = (groupId: number) => {
    return employees.filter((employee) => employee.group_id === groupId).length;
  };

  const openEditDialog = (employee: Target) => {
    setEditingEmployee(employee);
    setIsEditDialogOpen(true);
    editForm.reset({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      position: employee.position || "",
      group_id: employee.group_id || undefined,
      is_active: employee.is_active,
    });
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.position &&
        employee.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    const rows = 6;
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>

        {/* Card + table skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {/* Table header skeleton */}
              <div className="grid grid-cols-6 gap-4 p-4 border-b">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>

              {/* Table rows skeleton */}
              <div className="divide-y">
                {Array.from({ length: rows }).map((_, r) => (
                  <div
                    key={r}
                    className="grid grid-cols-6 gap-4 items-center p-4"
                  >
                    {/* First col with two lines */}
                    <div className="col-span-2 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>

                    {/* Middle columns */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />

                    {/* Action buttons */}
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Employees & Groups
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your organization's employees and groups for security
            awareness campaigns
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "employees" && (
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Add a new employee to your organization for security
                    awareness campaigns.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleCreateEmployee)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              maxLength={50}
                              placeholder="Enter first name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              maxLength={50}
                              placeholder="Enter last name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              maxLength={60}
                              placeholder="Enter email address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              maxLength={50}
                              placeholder="Enter job position"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="group_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group (Optional)</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(
                                value === "0" ? undefined : parseInt(value)
                              )
                            }
                            value={field.value?.toString() || "0"}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">No Group</SelectItem>
                              {groups.map((group) => (
                                <SelectItem
                                  key={group.id}
                                  value={group.id.toString()}
                                >
                                  {group.name}
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
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Active Status
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Enable or disable this employee for campaigns
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button disabled={createloading} type="submit">
                        Add Employee
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
          {activeTab === "groups" && (
            <Dialog
              open={isCreateGroupDialogOpen}
              onOpenChange={setIsCreateGroupDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Group</DialogTitle>
                  <DialogDescription>
                    Create a new group or department for organizing employees.
                  </DialogDescription>
                </DialogHeader>
                <Form {...groupForm}>
                  <form
                    onSubmit={groupForm.handleSubmit(handleCreateGroup)}
                    className="space-y-4"
                  >
                    <FormField
                      control={groupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter group name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={groupForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter group description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={groupForm.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Active Status
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Enable or disable this group for campaigns
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsCreateGroupDialogOpen(false);
                          groupForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Add Group</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("employees")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "employees"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Employees ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "groups"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Groups ({groups.length})
          </button>
        </nav>
      </div>

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <>
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>
                Search and manage your organization's employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Employees Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-gray-500">No employees found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {employee.first_name} {employee.last_name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.position || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                employee.is_active ? "default" : "secondary"
                              }
                            >
                              {employee.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{employee.group_name || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog
                                open={isEditDialogOpen}
                                onOpenChange={setIsEditDialogOpen}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditDialog(employee)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Employee</DialogTitle>
                                    <DialogDescription>
                                      Update employee information
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Form {...editForm}>
                                    <form
                                      onSubmit={editForm.handleSubmit(
                                        handleEditEmployee
                                      )}
                                      className="space-y-4"
                                    >
                                      <FormField
                                        control={editForm.control}
                                        name="first_name"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                              <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="last_name"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                              <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="email"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                              <Input type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="position"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <FormControl>
                                              <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="group_id"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Group</FormLabel>
                                            <Select
                                              onValueChange={(value) =>
                                                field.onChange(
                                                  value === "0"
                                                    ? undefined
                                                    : parseInt(value)
                                                )
                                              }
                                              value={
                                                field.value?.toString() || "0"
                                              }
                                            >
                                              <FormControl>
                                                <SelectTrigger className="w-full">
                                                  <SelectValue placeholder="Select a group" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="0">
                                                  No Group
                                                </SelectItem>
                                                {groups.map((group) => (
                                                  <SelectItem
                                                    key={group.id}
                                                    value={group.id.toString()}
                                                  >
                                                    {group.name}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={editForm.control}
                                        name="is_active"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                              <FormLabel className="text-base">
                                                Active Status
                                              </FormLabel>
                                              <div className="text-sm text-muted-foreground">
                                                Enable or disable this employee
                                                for campaigns
                                              </div>
                                            </div>
                                            <FormControl>
                                              <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <DialogFooter>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => {
                                            setEditingEmployee(null);
                                            setIsEditDialogOpen(false);
                                            editForm.reset();
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                        <Button type="submit">
                                          Update Employee
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Employee
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      {employee.first_name} {employee.last_name}
                                      ? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteEmployee(employee.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Groups Tab */}
      {activeTab === "groups" && (
        <Card>
          <CardHeader>
            <CardTitle>Group Management</CardTitle>
            <CardDescription>
              Search and manage your organization's groups and departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Groups Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-500">No groups found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          <div className="font-medium">{group.name}</div>
                        </TableCell>
                        <TableCell>{group.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getEmployeeCountForGroup(group.id)} employees
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={group.is_active ? "default" : "secondary"}
                          >
                            {group.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(group.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={isEditGroupDialogOpen}
                              onOpenChange={setIsEditGroupDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openEditGroupDialog(group)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Group</DialogTitle>
                                  <DialogDescription>
                                    Update group information
                                  </DialogDescription>
                                </DialogHeader>
                                <Form {...editGroupForm}>
                                  <form
                                    onSubmit={editGroupForm.handleSubmit(
                                      handleEditGroup
                                    )}
                                    className="space-y-4"
                                  >
                                    <FormField
                                      control={editGroupForm.control}
                                      name="name"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Group Name</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={editGroupForm.control}
                                      name="description"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={editGroupForm.control}
                                      name="is_active"
                                      render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                          <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                              Active Status
                                            </FormLabel>
                                            <div className="text-sm text-muted-foreground">
                                              Enable or disable this group for
                                              campaigns
                                            </div>
                                          </div>
                                          <FormControl>
                                            <Switch
                                              checked={field.value}
                                              onCheckedChange={field.onChange}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <DialogFooter>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingGroup(null);
                                          setIsEditGroupDialogOpen(false);
                                          editGroupForm.reset();
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button type="submit">
                                        Update Group
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Group
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {group.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteGroup(group.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
