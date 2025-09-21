"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Copy,
  Globe,
} from "lucide-react";
import {
  phishletService,
  Phishlet,
  PhishletCreate,
  PhishletCloneRequest,
} from "@/lib/auth";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";

export default function PhishletsPage() {
  const { user } = useAuth();
  const [phishlets, setPhishlets] = useState<Phishlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPhishlet, setSelectedPhishlet] = useState<Phishlet | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"edit" | "clone" | "view">("clone");
  const [cloning, setCloning] = useState(false);

  // Form states
  const [phishletForm, setPhishletForm] = useState({
    name: "",
    description: "",
    original_url: "",
    capture_credentials: true,
    capture_other_data: true,
    redirect_url: "",
    is_active: true,
  });

  const [cloneForm, setCloneForm] = useState({
    original_url: "",
    name: "",
    description: "",
    capture_credentials: true,
    capture_other_data: true,
    redirect_url: "",
  });

  const openModal = useSearchParams().get("openModal");

  useEffect(() => {
    loadPhishlets();
    if (openModal === "true") {
      setDialogOpen(true);
    }
  }, []);

  const loadPhishlets = async () => {
    try {
      const data = await phishletService.getPhishlets();
      setPhishlets(data);
    } catch (error) {
      toast.error("Failed to load phishlets");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhishlet = async () => {
    if (!selectedPhishlet) return;

    try {
      const phishletData = {
        name: phishletForm.name,
        description: phishletForm.description,
        capture_credentials: phishletForm.capture_credentials,
        capture_other_data: phishletForm.capture_other_data,
        redirect_url: phishletForm.redirect_url || undefined,
        is_active: phishletForm.is_active,
      };

      await phishletService.updatePhishlet(selectedPhishlet.id, phishletData);
      toast.success("Phishlet updated successfully");
      setDialogOpen(false);
      resetForms();
      loadPhishlets();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update phishlet");
    }
  };

  const handleCloneWebsite = async () => {
    setCloning(true);
    try {
      const cloneData: PhishletCloneRequest = {
        original_url: cloneForm.original_url,
        name: cloneForm.name,
        description: cloneForm.description,
        capture_credentials: cloneForm.capture_credentials,
        capture_other_data: cloneForm.capture_other_data,
        redirect_url: cloneForm.redirect_url || undefined,
      };

      await phishletService.cloneWebsite(cloneData);
      // toast.success('Website cloned successfully');
      setDialogOpen(false);
      resetForms();
      loadPhishlets();
    } catch (error: any) {
      console.log(error);
      // toast.error(error.response?.data?.detail || "Failed to clone website");
    } finally {
      setCloning(false);
    }
  };

  const handleDeletePhishlet = async (phishletId: number) => {
    if (!confirm("Are you sure you want to delete this phishlet?")) return;

    try {
      await phishletService.deletePhishlet(phishletId);
      toast.success("Phishlet deleted successfully");
      loadPhishlets();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete phishlet");
    }
  };

  const resetForms = () => {
    setPhishletForm({
      name: "",
      description: "",
      original_url: "",
      capture_credentials: true,
      capture_other_data: true,
      redirect_url: "",
      is_active: true,
    });
    setCloneForm({
      original_url: "",
      name: "",
      description: "",
      capture_credentials: true,
      capture_other_data: true,
      redirect_url: "",
    });
  };

  const openDialog = (mode: "edit" | "clone", phishlet?: Phishlet) => {
    setViewMode(mode);
    setSelectedPhishlet(phishlet || null);
    setDialogOpen(true);

    if (phishlet && mode === "edit") {
      setPhishletForm({
        name: phishlet.name,
        description: phishlet.description || "",
        original_url: phishlet.original_url,
        capture_credentials: phishlet.capture_credentials,
        capture_other_data: phishlet.capture_other_data,
        redirect_url: phishlet.redirect_url || "",
        is_active: phishlet.is_active,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const openUrl = (url: string) => {
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading phishlets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Phishlets</h1>
          <p className="text-muted-foreground">
            Create and manage cloned websites for your campaigns.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/phishlets/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Phishlet
            </Link>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => openDialog("clone")}>
                <Globe className="mr-2 h-4 w-4" />
                Quick Clone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
              <DialogHeader>
                <DialogTitle>
                  {viewMode === "edit" && "Edit Phishlet"}
                  {viewMode === "clone" && "Quick Clone Website"}
                  {viewMode === "view" && selectedPhishlet?.name}
                </DialogTitle>
                <DialogDescription>
                  {viewMode === "clone"
                    ? "Quickly clone an existing website to create a phishlet for your campaigns."
                    : viewMode === "view"
                    ? "View phishlet details and configuration."
                    : "Edit phishlet settings."}
                </DialogDescription>
              </DialogHeader>

              {viewMode === "view" && selectedPhishlet ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">
                        Phishlet Name
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedPhishlet.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            selectedPhishlet.is_active ? "default" : "secondary"
                          }
                        >
                          {selectedPhishlet.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedPhishlet.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedPhishlet.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Original URL</Label>
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-muted-foreground flex-1 break-all">
                        {selectedPhishlet.original_url}
                      </p>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(selectedPhishlet.original_url)
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUrl(selectedPhishlet.original_url)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedPhishlet.clone_url && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Clone URL</Label>
                      <div className="flex items-start gap-2">
                        <p className="text-sm text-muted-foreground flex-1 break-all">
                          {selectedPhishlet.clone_url}
                        </p>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(selectedPhishlet.clone_url!)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUrl(selectedPhishlet.clone_url!)}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPhishlet.redirect_url && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Redirect URL
                      </Label>
                      <p className="text-sm text-muted-foreground break-all">
                        {selectedPhishlet.redirect_url}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">
                        Capture Settings
                      </Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              selectedPhishlet.capture_credentials
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {selectedPhishlet.capture_credentials
                              ? "Credentials"
                              : "No Credentials"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              selectedPhishlet.capture_other_data
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {selectedPhishlet.capture_other_data
                              ? "Form Data"
                              : "No Form Data"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Form Fields</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedPhishlet.form_fields &&
                        selectedPhishlet.form_fields.length > 0
                          ? `${selectedPhishlet.form_fields.length} field(s) detected`
                          : "No form fields detected"}
                      </p>
                    </div>
                  </div>

                  {selectedPhishlet.form_fields &&
                    selectedPhishlet.form_fields.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">
                          Detected Form Fields
                        </Label>
                        <div className="mt-2 p-3 bg-muted rounded-md max-h-40 overflow-y-auto overflow-x-hidden">
                          <div className="space-y-2">
                            {selectedPhishlet.form_fields.map(
                              (field, index) => (
                                <div
                                  key={index}
                                  className="text-xs p-2 bg-background rounded border"
                                >
                                  <div className="font-medium break-words">
                                    {field.name ||
                                      field.id ||
                                      `Field ${index + 1}`}
                                  </div>
                                  <div className="text-muted-foreground break-words">
                                    Type: {field.type} | Required:{" "}
                                    {field.required ? "Yes" : "No"}
                                    {field.placeholder &&
                                      ` | Placeholder: ${field.placeholder}`}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(
                        selectedPhishlet.created_at
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated:{" "}
                      {new Date(
                        selectedPhishlet.updated_at
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clone_url">Website URL to Clone *</Label>
                    <Input
                      id="clone_url"
                      type="url"
                      value={cloneForm.original_url}
                      onChange={(e) =>
                        setCloneForm((prev) => ({
                          ...prev,
                          original_url: e.target.value,
                        }))
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="clone_name">Phishlet Name *</Label>
                      <Input
                        id="clone_name"
                        value={cloneForm.name}
                        onChange={(e) =>
                          setCloneForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter phishlet name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clone_redirect_url">
                        Redirect URL (Optional)
                      </Label>
                      <Input
                        id="clone_redirect_url"
                        type="url"
                        value={cloneForm.redirect_url}
                        onChange={(e) =>
                          setCloneForm((prev) => ({
                            ...prev,
                            redirect_url: e.target.value,
                          }))
                        }
                        placeholder="https://example.com/redirect"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clone_description">Description</Label>
                    <Textarea
                      id="clone_description"
                      value={cloneForm.description}
                      onChange={(e) =>
                        setCloneForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter phishlet description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="clone_capture_credentials"
                        checked={cloneForm.capture_credentials}
                        onCheckedChange={(checked: boolean) =>
                          setCloneForm((prev) => ({
                            ...prev,
                            capture_credentials: checked,
                          }))
                        }
                      />
                      <Label htmlFor="clone_capture_credentials">
                        Capture Credentials
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="clone_capture_other_data"
                        checked={cloneForm.capture_other_data}
                        onCheckedChange={(checked: boolean) =>
                          setCloneForm((prev) => ({
                            ...prev,
                            capture_other_data: checked,
                          }))
                        }
                      />
                      <Label htmlFor="clone_capture_other_data">
                        Capture Other Form Data
                      </Label>
                    </div>
                  </div>
                  <Button
                    onClick={handleCloneWebsite}
                    className="w-full"
                    disabled={
                      cloning || !cloneForm.original_url || !cloneForm.name
                    }
                  >
                    {cloning ? "Cloning Website..." : "Clone Website"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {phishlets.map((phishlet) => (
          <Card key={phishlet.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{phishlet.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {phishlet.description || "No description"}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDialog("edit", phishlet)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePhishlet(phishlet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={phishlet.is_active ? "default" : "secondary"}>
                  {phishlet.is_active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-1">
                  {phishlet.capture_credentials && (
                    <Badge variant="outline" className="text-xs">
                      Credentials
                    </Badge>
                  )}
                  {phishlet.capture_other_data && (
                    <Badge variant="outline" className="text-xs">
                      Form Data
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Original URL:</span>
                  {(!phishlet?.is_admin || user?.is_admin) && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(phishlet.original_url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUrl(phishlet.original_url)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {phishlet.original_url}
                </p>
              </div>

              {phishlet.clone_url && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Clone URL:</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(phishlet.clone_url!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUrl(phishlet.clone_url!)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {phishlet.clone_url}
                  </p>
                </div>
              )}

              {phishlet.form_fields && phishlet.form_fields.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {phishlet.form_fields.length} form field(s) detected
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPhishlet(phishlet);
                    setViewMode("view");
                    setDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-3 w-3" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {phishlets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No phishlets yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first phishlet to get started with website cloning.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* <div>
          <h1 className="text-2xl font-bold tracking-tight">Phishlets</h1>
          <p className="text-muted-foreground">
            Created and managed cloned websites by admin.
          </p>
        </div>
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {phishlets.map((phishlet) => ( phishlet?.is_admin && (
          <Card key={phishlet.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{phishlet.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {phishlet.description || "No description"}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDialog("edit", phishlet)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePhishlet(phishlet.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={phishlet.is_active ? "default" : "secondary"}>
                  {phishlet.is_active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex gap-1">
                  {phishlet.capture_credentials && (
                    <Badge variant="outline" className="text-xs">
                      Credentials
                    </Badge>
                  )}
                  {phishlet.capture_other_data && (
                    <Badge variant="outline" className="text-xs">
                      Form Data
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Original URL:</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(phishlet.original_url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUrl(phishlet.original_url)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {phishlet.original_url}
                </p>
              </div>

              {phishlet.clone_url && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Clone URL:</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(phishlet.clone_url!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUrl(phishlet.clone_url!)}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {phishlet.clone_url}
                  </p>
                </div>
              )}

              {phishlet.form_fields && phishlet.form_fields.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {phishlet.form_fields.length} form field(s) detected
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPhishlet(phishlet);
                    setViewMode("view");
                    setDialogOpen(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-3 w-3" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )))}
      </div> */}
    </div>
  );
}
