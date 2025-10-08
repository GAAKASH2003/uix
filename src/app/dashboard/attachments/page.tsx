"use client";

import { useState, useEffect, useRef } from "react";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Edit, Trash2, RefreshCw, Eye, Copy, Upload } from "lucide-react";
import {
  attachmentService,
  AttachmentResponse,
  AttachmentCreate,
  AttachmentUpdate,
} from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttachmentsPage() {
  const [templates, setTemplates] = useState<AttachmentResponse[]>([]);

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [createloading, setcreateLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  const [attachmentForm, setAttachmentForm] = useState({
    name: "",
    description: "",
    isDemo: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAttachment, setSelectedAttachment] =
    useState<AttachmentResponse | null>(null);

  const openModal = useSearchParams().get("openModal");

  useEffect(() => {
    loadTemplates();
    if (openModal === "true") {
      setDialogOpen(true);
    }
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await attachmentService.getAttachments();
      setTemplates(data);
    } catch (error) {
      toast.error("Failed to load attachments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttachment = async () => {
    setcreateLoading(true);
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    try {
      const attachmentData: AttachmentCreate = {
        name: attachmentForm.name,
        description: attachmentForm.description,
        isDemo: attachmentForm.isDemo,
        user_id: user?.id || 0,
        attachmentFile: selectedFile,
      };
      console.log("attachmentData", attachmentData);

      await attachmentService.createAttachment(attachmentData);
      toast.success("Attachment created successfully");
      setDialogOpen(false);
      resetForms();
      loadTemplates();
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to create attachment"
      );
    } finally {
      setcreateLoading(false);
    }
  };

  const handleUpdateAttachment = async () => {
    setcreateLoading(true);
    if (!selectedAttachment) return;

    try {
      const attachmentData: AttachmentUpdate = {
        name: attachmentForm.name,
        description: attachmentForm.description,
        isDemo: attachmentForm.isDemo,
      };

      await attachmentService.updateAttachment(
        selectedAttachment.id,
        attachmentData
      );
      toast.success("Attachment updated successfully");
      setDialogOpen(false);
      resetForms();
      loadTemplates();
    } catch (error: any) {
      console.log(error.response);
      toast.error(
        error.response?.data?.detail || "Failed to update attachment"
      );
    } finally {
      setcreateLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    setcreateLoading(true);
    if (!confirm("Are you sure you want to delete this attachment?")) return;

    try {
      await attachmentService.deleteAttachment(attachmentId);
      toast.success("Attachment deleted successfully");
      loadTemplates();
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to delete attachment"
      );
    } finally {
      setcreateLoading(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Allow common file types for attachments
    const allowedTypes = [
      ".pdf",
      ".txt",
      ".docx",
      ".doc",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".zip",
      ".rar",
    ];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      toast.error(
        "Please select a supported file type (.pdf, .txt, .docx, .png, .jpg, .gif, .zip, .rar)"
      );
      return false;
    }
    console.log("file_size", file.size);
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("File size incompatible. Maximum size is 10MB.");
      return false;
    }

    setSelectedFile(file);
    // Auto-fill name from filename if not provided
    if (!attachmentForm.name) {
      setAttachmentForm((prev) => ({
        ...prev,
        name: file.name.replace(fileExtension, ""),
      }));
    }
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDownload = async (
    id: number,
    name: string,
    file_type: string
  ) => {
    try {
      await attachmentService.download(id, name, file_type);
    } catch (error: any) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      validateAndSetFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const resetForms = () => {
    setAttachmentForm({
      name: "",
      description: "",
      isDemo: false,
    });
    setSelectedFile(null);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openDialog = (
    mode: "create" | "edit",
    attachment?: AttachmentResponse
  ) => {
    setViewMode(mode);
    setSelectedAttachment(attachment || null);
    setDialogOpen(true);

    if (attachment && mode === "edit") {
      setAttachmentForm({
        name: attachment.name,
        description: attachment.description || "",
        isDemo: attachment.isDemo || false,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading) {
    // show a grid of skeleton cards matching final layout
    const skeletonCount = 6;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="border rounded-md p-4 h-40 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 w-2/3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attachments</h1>
          <p className="text-muted-foreground">
            Upload and manage attachments for your campaigns.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog("create")}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Payload
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-y-auto max-h-[90vh] w-[80%]">
              <DialogHeader>
                <DialogTitle>
                  {viewMode === "create" && "Create Attachment"}
                  {viewMode === "edit" && "Edit Attachment"}

                  {viewMode === "view" && selectedAttachment?.name}
                </DialogTitle>
                <DialogDescription>
                  {viewMode === "view"
                    ? "View attachment details and content."
                    : "Upload a new attachment"}
                </DialogDescription>
              </DialogHeader>

              {viewMode === "view" && selectedAttachment ? (
                <div className="space-y-4 w-full max-w-[90%] sm:max-w-3xl overflow-hidden">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">
                        Attachment Name
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedAttachment.name}
                      </p>
                    </div>
                  </div>

                  {selectedAttachment.description && (
                    <div className="w-full">
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {selectedAttachment.description}
                      </p>
                    </div>
                  )}

                  {/* <div>
                    <Label className="text-sm font-medium">Download here</Label>
                    <button
                      onClick={() =>
                        handleDownload(
                          selectedAttachment.id,
                          selectedAttachment.name,
                          selectedAttachment.file_type
                        )
                      }
                      className="text-blue-500 underline text-sm mt-1 block"
                    >
                      {selectedAttachment.name || "Download file"}
                    </button>
                  </div> */}
                </div>
              ) : (
                <Tabs
                  defaultValue={viewMode === "create" ? "create" : "edit"}
                  className="w-full"
                >
                  <TabsContent value="create" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="attachment_file">Upload File</Label>
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                            isDragOver
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          onDragOver={handleDragOver}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <input
                            ref={fileInputRef}
                            id="attachment_file"
                            aria-label="Select Attachment File"
                            type="file"
                            accept=".pdf,.txt,.docx,.doc,.png,.jpg,.jpeg,.gif,.zip,.rar"
                            onChange={handleFileSelect}
                            className="hidden"
                          />

                          {selectedFile ? (
                            <div className="space-y-2">
                              <div className="text-green-600 font-medium">
                                ✓ {selectedFile.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                  }
                                }}
                              >
                                Remove File
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                              <div className="text-sm font-medium">
                                {isDragOver
                                  ? "Drop your file here"
                                  : "Drag and drop a file here (.pdf,.txt,.docx,.png,.jpg,.gif,.zip,.rar)"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                or click to browse
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Choose File
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                        <div className="space-y-2">
                          <Label htmlFor="attachment_name">
                            Attachment Name
                          </Label>
                          <Input
                            id="attachment_name"
                            value={attachmentForm.name}
                            onChange={(e) =>
                              setAttachmentForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter attachment name (auto-filled from filename)"
                          />
                        </div>
                        {/* <div className="space-y-2">
                          <Label htmlFor="eml_template_type">
                            Template Type
                          </Label>
                          <Select
                            value={attachForm.template_type}
                            onValueChange={(value) =>
                              setAttachForm((prev) => ({
                                ...prev,
                                template_type: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom">Custom</SelectItem>
                              <SelectItem value="phishing">Phishing</SelectItem>
                              <SelectItem value="marketing">
                                Marketing
                              </SelectItem>
                              <SelectItem value="notification">
                                Notification
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div> */}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="attachment_description">
                          Description
                        </Label>
                        <Textarea
                          id="attachment_description"
                          value={attachmentForm.description}
                          maxLength={150}
                          onChange={(e) =>
                            setAttachmentForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Enter attachment description"
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      disabled={createloading}
                      onClick={
                        viewMode === "edit"
                          ? handleUpdateAttachment
                          : handleCreateAttachment
                      }
                      className="w-full"
                    >
                      {viewMode === "edit"
                        ? "Update Attachment"
                        : "Create Attachment"}
                    </Button>
                  </TabsContent>
                  <TabsContent value="edit">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                      <div className="space-y-2">
                        <Label htmlFor="attachment_name">Attachment Name</Label>
                        <Input
                          id="attachment_name"
                          value={attachmentForm.name}
                          onChange={(e) =>
                            setAttachmentForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter attachment name (auto-filled from filename)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="attachment_description">
                          Description
                        </Label>
                        <Textarea
                          id="attachment_description"
                          value={attachmentForm.description}
                          onChange={(e) =>
                            setAttachmentForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Enter attachment description"
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      disabled={createloading}
                      onClick={
                        viewMode === "edit"
                          ? handleUpdateAttachment
                          : handleCreateAttachment
                      }
                      className="w-full my-5"
                    >
                      {viewMode === "edit"
                        ? "Update Attachment"
                        : "Create Attachment"}
                    </Button>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((attachment) => (
          <Card
            key={attachment.id}
            className="relative flex flex-col justify-between h-full"
          >
            <CardHeader>
              <div className="flex flex-col justify-between items-start">
                <div className="flex justify-between w-full">
                  <CardTitle className="text-lg">{attachment.name}</CardTitle>
                  {!attachment?.is_admin && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog("edit", attachment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        disabled={createloading}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardDescription className="mt-1 ">
                  {attachment.description?.length &&
                  attachment.description?.length > 30
                    ? attachment.description?.substring(0, 30) + "..."
                    : attachment.description || "No description"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex flex-col justify-between h-full">
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAttachment(attachment);
                    setViewMode("view");
                    setDialogOpen(true);
                  }}
                  className="flex-1 "
                >
                  <Eye className="mr-2 h-3 w-3" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No attachments yet</h3>
              <p className="text-muted-foreground mt-1">
                Upload your first attachment to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Attachments</h1>
        <p className="text-muted-foreground">
          Uploaded and managed attachments by admin.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(
          (attachment) =>
            attachment.is_admin && (
              <Card
                key={attachment.id}
                className="relative flex flex-col justify-between h-full"
              >
                <CardHeader>
                  <div className="flex flex-col justify-between items-start">
                    <div className="flex justify-between w-full">
                      <CardTitle className="text-lg">
                        {attachment.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        {user?.is_admin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog("edit", attachment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteAttachment(attachment.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <CardDescription className="mt-1 ">
                      {attachment.description?.length &&
                      attachment.description?.length > 30
                        ? attachment.description?.substring(0, 30) + "..."
                        : attachment.description || "No description"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex flex-col justify-between h-full">
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAttachment(attachment);
                        setViewMode("view");
                        setDialogOpen(true);
                      }}
                      className="flex-1 "
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
        )}
      </div> */}
    </div>
  );
}
