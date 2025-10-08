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
  emailTemplateService,
  EmailTemplate,
  EmailTemplateCreate,
  AITemplateGenerateRequest,
} from "@/lib/auth";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  const { user } = useAuth();
  const [adminTemplates, setAdminTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createloading, setcreateLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [viewMode, setViewMode] = useState<"create" | "edit" | "ai" | "view">(
    "create"
  );

  // Form states
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    subject: "",
    html_content: "",
    text_content: "",
    template_type: "custom",
    isDemo: false,
    is_active: true,
  });

  const [aiForm, setAiForm] = useState({
    name: "",
    description: "",
    prompt: "",
    subject_line: "",
    template_type: "phishing",
    tone: "professional",
    target_audience: "",
    include_html: true,
    include_text: true,
  });

  const [emlForm, setEmlForm] = useState({
    name: "",
    description: "",
    template_type: "custom",
    is_active: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openModal = useSearchParams().get("openModal");
  console.log(openModal);

  useEffect(() => {
    loadTemplates();
    if (openModal === "true") {
      setDialogOpen(true);
    }
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await emailTemplateService.getTemplates();
      const adminData = await emailTemplateService.getAdminTemplates();
      setTemplates(data);
      console.log(data);
      setAdminTemplates(adminData);
    } catch (error) {
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setcreateLoading(true);
      const templateData: EmailTemplateCreate = {
        name: templateForm.name,
        description: templateForm.description,
        subject: templateForm.subject,
        html_content: templateForm.html_content,
        text_content: templateForm.text_content,
        isDemo: templateForm.isDemo,
        template_type: templateForm.template_type,
        is_active: templateForm.is_active,
      };

      if (
        !templateData.name ||
        !templateData.description ||
        !templateData.subject ||
        !templateData.html_content ||
        !templateData.text_content
      ) {
        toast.error(
          "Name, description, subject,html_content and text_content are required!"
        );
        setcreateLoading(false);
        return;
      }

      await emailTemplateService.createTemplate(templateData);
      toast.success("Email template created successfully");
      setDialogOpen(false);
      resetForms();
      loadTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create template");
    } finally {
      setcreateLoading(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    setcreateLoading(true);
    try {
      const templateData = {
        name: templateForm.name,
        description: templateForm.description,
        subject: templateForm.subject,
        html_content: templateForm.html_content,
        text_content: templateForm.text_content,
        template_type: templateForm.template_type,
        is_active: templateForm.is_active,
      };

      if (
        !templateData.name ||
        !templateData.description ||
        !templateData.subject ||
        !templateData.html_content ||
        !templateData.text_content
      ) {
        toast.error(
          "Name, description, subject,html_content and text_content are required!"
        );
        setcreateLoading(false);
        return;
      }

      await emailTemplateService.updateTemplate(
        selectedTemplate.id,
        templateData
      );
      // toast.success("Email template updated successfully");
      setDialogOpen(false);
      resetForms();
      loadTemplates();
    } catch (error: any) {
      console.log(error.response);
      //toast.error(error.response?.data?.detail || "Failed to update template");
    } finally {
      setcreateLoading(false);
    }
  };

  const handleGenerateAITemplate = async () => {
    setcreateLoading(true);
    try {
      const aiData: AITemplateGenerateRequest = {
        name: aiForm.name,
        description: aiForm.description,
        prompt: aiForm.prompt,
        subject_line: aiForm.subject_line,
        template_type: aiForm.template_type,
        tone: aiForm.tone,
        target_audience: aiForm.target_audience,
        include_html: aiForm.include_html,
        include_text: aiForm.include_text,
      };

      if (!aiForm.name || !aiForm.description || !aiForm.prompt) {
        toast.error("Name, description, prompt are required!");
        setcreateLoading(false);
        return;
      }

      await emailTemplateService.generateAITemplate(aiData);
      toast.success("AI template generated successfully");
      setDialogOpen(false);
      resetForms();
      loadTemplates();
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to generate AI template"
      );
    } finally {
      setcreateLoading(false);
    }
  };

  const handleRegenerateTemplate = async (templateId: number) => {
    setcreateLoading(true);
    try {
      await emailTemplateService.regenerateAITemplate(templateId);
      toast.success("Template regenerated successfully");
      loadTemplates();
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to regenerate template"
      );
    } finally {
      setcreateLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    setcreateLoading(true);
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await emailTemplateService.deleteTemplate(templateId);
      toast.success("Template deleted successfully");
      loadTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete template");
    } finally {
      setcreateLoading(false);
    }
  };

  const handleImportEML = async () => {
    setcreateLoading(true);
    if (!selectedFile) {
      toast.error("Please select a .eml file");
      return;
    }

    try {
      const importData = {
        name: emlForm.name || undefined,
        description: emlForm.description || undefined,
        template_type: emlForm.template_type,
        is_active: emlForm.is_active,
      };

      if (!importData.name || !importData.description) {
        toast.error("Name, description are required!");
        setcreateLoading(false);
        return;
      }

      const result = await emailTemplateService.importEMLTemplate(
        selectedFile,
        importData
      );

      // Show detailed success message
      let contentInfo = "";
      if (
        result.import_summary &&
        result.import_summary.content_types_found &&
        result.import_summary.content_types_found.length > 0
      ) {
        contentInfo = ` (${result.import_summary.content_types_found.join(
          " + "
        )} content)`;
      }

      toast.success(`Email template imported successfully${contentInfo}`);
      setDialogOpen(false);
      setSelectedFile(null);
      resetForms();
      loadTemplates();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to import template";
      toast.error(errorMessage);
    } finally {
      setcreateLoading(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".eml")) {
      toast.error("Please select a .eml file");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("File size too large. Maximum size is 10MB");
      return false;
    }

    setSelectedFile(file);
    // Auto-fill name from filename if not provided
    if (!emlForm.name) {
      setEmlForm((prev) => ({
        ...prev,
        name: file.name.replace(".eml", ""),
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
    setTemplateForm({
      name: "",
      description: "",
      subject: "",
      html_content: "",
      text_content: "",
      isDemo: false,
      template_type: "custom",
      is_active: true,
    });
    setAiForm({
      name: "",
      description: "",
      prompt: "",
      subject_line: "",
      template_type: "phishing",
      tone: "professional",
      target_audience: "",
      include_html: true,
      include_text: true,
    });
    setEmlForm({
      name: "",
      description: "",
      template_type: "custom",
      is_active: true,
    });
    setSelectedFile(null);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openDialog = (
    mode: "create" | "edit" | "ai",
    template?: EmailTemplate
  ) => {
    setViewMode(mode);
    setSelectedTemplate(template || null);
    setDialogOpen(true);

    if (template && mode === "edit") {
      setTemplateForm({
        name: template.name,
        description: template.description || "",
        subject: template.subject,
        html_content: template.html_content || "",
        text_content: template.text_content || "",
        isDemo: template.isDemo,
        template_type: template.template_type,
        is_active: template.is_active,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading) {
    const count = 6;
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="border rounded-md p-4 h-44 flex flex-col justify-between"
            >
              {/* Card header */}
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

              {/* Card content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-3 w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage email templates for your campaigns.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => openDialog("create")}
                disabled={createloading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-y-auto max-h-[90vh] w-fit">
              <DialogHeader>
                <DialogTitle>
                  {viewMode === "create" && "Create Email Template"}
                  {viewMode === "edit" && "Edit Email Template"}
                  {viewMode === "ai" && "Generate AI Template"}
                  {viewMode === "view" && selectedTemplate?.name}
                </DialogTitle>
                <DialogDescription>
                  {viewMode === "ai"
                    ? "Use AI to generate a professional email template based on your requirements."
                    : viewMode === "view"
                    ? "View email template details and content."
                    : "Create a new email template with custom content."}
                </DialogDescription>
              </DialogHeader>

              {viewMode === "view" && selectedTemplate ? (
                <div className="space-y-4 w-full max-w-[90%] sm:max-w-3xl overflow-hidden">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">
                        Template Name
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTemplate.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">
                        Template Type
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTemplate.template_type}
                      </p>
                    </div>
                  </div>

                  {selectedTemplate.description && (
                    <div className="w-full">
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        {selectedTemplate.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Subject Line</Label>
                    <pre className="text-sm text-muted-foreground mt-1 break-words whitespace-pre-words">
                      {selectedTemplate.subject}
                    </pre>
                  </div>

                  {selectedTemplate.ai_model_used && (
                    <div>
                      <Label className="text-sm font-medium">
                        AI Model Used
                      </Label>
                      <pre className="text-sm text-muted-foreground mt-1 break-words whitespace-pre-words">
                        {selectedTemplate.ai_model_used}
                      </pre>
                    </div>
                  )}

                  {selectedTemplate.html_content && (
                    <div className="w-full ">
                      <Label className="text-sm font-medium">
                        HTML Content
                      </Label>
                      <div className="text-xs text-muted-foreground mb-1">
                        Rich formatting version - displayed by modern email
                        clients
                      </div>
                      <div className="mt-1 p-3 bg-muted rounded-md max-h-20 overflow-y-auto w-full break-words">
                        <p className="text-xs whitespace-pre-wrap ">
                          {selectedTemplate.html_content}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedTemplate.text_content && (
                    <div className="w-full">
                      <Label className="text-sm font-medium">
                        Plain Text Content
                      </Label>
                      <div className="text-xs text-muted-foreground mb-1">
                        Simple text version - displayed by text-only email
                        clients
                      </div>
                      <div className="mt-1 p-3 bg-muted rounded-md max-h-40 overflow-y-auto w-full break-words">
                        <p className="text-xs whitespace-pre-wrap">
                          {selectedTemplate.text_content}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Tabs
                  defaultValue={viewMode === "ai" ? "ai" : "manual"}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="manual">Manual Template</TabsTrigger>
                    <TabsTrigger value="ai">AI Generation</TabsTrigger>
                    <TabsTrigger value="import">Import .EML</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                          id="name"
                          required
                          maxLength={50}
                          value={templateForm.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTemplateForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter template name"
                        />
                      </div>
                      {/* <div className="space-y-2">
                      <Label htmlFor="template_type">Template Type</Label>
                      <Select value={templateForm.template_type} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, template_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="phishing">Phishing</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div> */}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        maxLength={400}
                        value={templateForm.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter template description"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Line</Label>
                      <Input
                        id="subject"
                        required
                        value={templateForm.subject}
                        maxLength={100}
                        onChange={(e) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            subject: e.target.value,
                          }))
                        }
                        placeholder="Enter email subject"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="html_content">HTML Content</Label>
                        <Textarea
                          id="html_content"
                          required
                          value={templateForm.html_content}
                          onChange={(e) =>
                            setTemplateForm((prev) => ({
                              ...prev,
                              html_content: e.target.value,
                            }))
                          }
                          placeholder="Enter HTML content"
                          rows={8}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="text_content">Plain Text Content</Label>
                        <Textarea
                          id="text_content"
                          required
                          value={templateForm.text_content}
                          onChange={(e) =>
                            setTemplateForm((prev) => ({
                              ...prev,
                              text_content: e.target.value,
                            }))
                          }
                          placeholder="Enter plain text content"
                          rows={8}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={templateForm.is_active}
                        onCheckedChange={(checked: boolean) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            is_active: checked,
                          }))
                        }
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <Button
                      disabled={createloading}
                      onClick={
                        viewMode === "edit"
                          ? handleUpdateTemplate
                          : handleCreateTemplate
                      }
                      className="w-full"
                    >
                      {viewMode === "edit"
                        ? "Update Template"
                        : "Create Template"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="ai" className="space-y-4">
                    {user?.ai_model && user?.ai_is_active ? (
                      <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="ai_name">Template Name</Label>
                            <Input
                              id="ai_name"
                              required
                              value={aiForm.name}
                              onChange={(e) =>
                                setAiForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              placeholder="Enter template name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ai_template_type">
                              Template Type
                            </Label>
                            <Select
                              value={aiForm.template_type}
                              onValueChange={(value) =>
                                setAiForm((prev) => ({
                                  ...prev,
                                  template_type: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="phishing">
                                  Phishing
                                </SelectItem>
                                <SelectItem value="marketing">
                                  Marketing
                                </SelectItem>
                                <SelectItem value="notification">
                                  Notification
                                </SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ai_description">Description</Label>
                          <Textarea
                            id="ai_description"
                            required
                            value={aiForm.description}
                            onChange={(e) =>
                              setAiForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Enter template description"
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="ai_tone">Tone</Label>
                            <Select
                              value={aiForm.tone}
                              onValueChange={(value) =>
                                setAiForm((prev) => ({ ...prev, tone: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="professional">
                                  Professional
                                </SelectItem>
                                <SelectItem value="casual">Casual</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="friendly">
                                  Friendly
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ai_subject_line">
                              Subject Line (Optional)
                            </Label>
                            <Input
                              id="ai_subject_line"
                              required
                              value={aiForm.subject_line}
                              maxLength={150}
                              onChange={(e) =>
                                setAiForm((prev) => ({
                                  ...prev,
                                  subject_line: e.target.value,
                                }))
                              }
                              placeholder="Enter subject line or let AI generate"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ai_target_audience">
                            Target Audience (Optional)
                          </Label>
                          <Input
                            id="ai_target_audience"
                            value={aiForm.target_audience}
                            required
                            maxLength={100}
                            onChange={(e) =>
                              setAiForm((prev) => ({
                                ...prev,
                                target_audience: e.target.value,
                              }))
                            }
                            placeholder="e.g., IT professionals, executives, employees"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ai_prompt">AI Prompt</Label>
                          <Textarea
                            id="ai_prompt"
                            value={aiForm.prompt}
                            required
                            onChange={(e) =>
                              setAiForm((prev) => ({
                                ...prev,
                                prompt: e.target.value,
                              }))
                            }
                            placeholder="Describe the email you want to generate..."
                            rows={4}
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="include_html"
                              checked={aiForm.include_html}
                              onCheckedChange={(checked: boolean) =>
                                setAiForm((prev) => ({
                                  ...prev,
                                  include_html: checked,
                                }))
                              }
                            />
                            <Label htmlFor="include_html">Include HTML</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="include_text"
                              checked={aiForm.include_text}
                              onCheckedChange={(checked: boolean) =>
                                setAiForm((prev) => ({
                                  ...prev,
                                  include_text: checked,
                                }))
                              }
                            />
                            <Label htmlFor="include_text">Include Text</Label>
                          </div>
                        </div>
                        <Button
                          onClick={handleGenerateAITemplate}
                          className="w-full"
                          disabled={createloading}
                        >
                          Generate AI Template
                        </Button>
                      </>
                    ) : (
                      <div className="container">
                        <p className="text-sm m-3 text-muted-foreground">
                          Update AI Settings in your profile to enable this
                          option
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="import" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="eml_file">Select .EML File</Label>
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
                            id="eml_file"
                            aria-label="Select .EML File"
                            type="file"
                            accept=".eml"
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
                                  ? "Drop your .eml file here"
                                  : "Drag and drop a .eml file here"}
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
                        <p className="text-xs text-muted-foreground">
                          Select a .eml file to import. The file will be parsed
                          to extract subject, HTML, and text content. Maximum
                          file size: 10MB.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="eml_name">Template Name</Label>
                          <Input
                            id="eml_name"
                            value={emlForm.name}
                            maxLength={100}
                            onChange={(e) =>
                              setEmlForm((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter template name (auto-filled from filename)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="eml_template_type">
                            Template Type
                          </Label>
                          <Select
                            value={emlForm.template_type}
                            onValueChange={(value) =>
                              setEmlForm((prev) => ({
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
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eml_description">Description</Label>
                        <Textarea
                          id="eml_description"
                          value={emlForm.description}
                          maxLength={150}
                          onChange={(e) =>
                            setEmlForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Enter template description"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="eml_is_active"
                          checked={emlForm.is_active}
                          onCheckedChange={(checked: boolean) =>
                            setEmlForm((prev) => ({
                              ...prev,
                              is_active: checked,
                            }))
                          }
                        />
                        <Label htmlFor="eml_is_active">Active</Label>
                      </div>

                      <Button
                        onClick={handleImportEML}
                        className="w-full"
                        disabled={!selectedFile}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Import Template
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="relative flex flex-col justify-between h-full"
          >
            <CardHeader>
              <div className="flex flex-col justify-between items-start">
                <div className="flex justify-between w-full">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex gap-1">
                    {!template?.is_admin && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog("edit", template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          disabled={createloading}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardDescription className="mt-1 ">
                  {template.description?.length &&
                  template.description?.length > 30
                    ? template.description?.substring(0, 30) + "..."
                    : template.description || "No description"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <Badge variant={template.is_active ? "default" : "secondary"}>
                  {template.is_active ? "Active" : "Inactive"}
                </Badge>
                {/* {template.is_admin && (
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    Admin
                  </Badge>
                )} */}
                <Badge variant="outline">{template.template_type}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Subject:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(template.subject)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {template.subject}
                </p>
              </div>

              {template.ai_model_used && (
                <div className="text-xs text-muted-foreground">
                  AI Model: {template.ai_model_used}
                </div>
              )}

              <div className="flex gap-1 pt-2 flex-wrap">
                {template.template_type === "ai_generated" && (
                  <Button
                    variant="outline"
                    disabled={createloading}
                    size="sm"
                    onClick={() => handleRegenerateTemplate(template.id)}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2" />
                    Regenerate
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setViewMode("view");
                    setDialogOpen(true);
                  }}
                  className="flex-1 "
                >
                  <Eye className="mr-2" />
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
              <h3 className="text-lg font-semibold">No templates yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first email template to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {/* <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Admin Email Templates
        </h1>
        <p className="text-muted-foreground">
          Created and managed email templates by admin.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map(
          (template) =>
           (
              <Card
                key={template.id}
                className="relative flex flex-col justify-between h-full"
              >
                <CardHeader>
                  <div className="flex flex-col justify-between items-start">
                    <div className="flex justify-between w-full">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex gap-1">
                        {user?.is_admin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog("edit", template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <CardDescription className="mt-1 ">
                      {template.description?.length &&
                      template.description?.length > 30
                        ? template.description?.substring(0, 30) + "..."
                        : template.description || "No description"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={template.is_active ? "default" : "secondary"}
                    >
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{template.template_type}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Subject:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(template.subject)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {template.subject}
                    </p>
                  </div>

                  {template.ai_model_used && (
                    <div className="text-xs text-muted-foreground">
                      AI Model: {template.ai_model_used}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {template.template_type === "ai_generated" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateTemplate(template.id)}
                        className="flex-1"
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Regenerate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate(template);
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
