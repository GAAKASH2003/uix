"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Calendar,
  Users,
  Mail,
  Globe,
  Clock,
  AlertTriangle,
  BarChart3,
  Target,
  FileText,
  Activity,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  campaignService,
  Campaign,
  CampaignCreate,
  CampaignUpdate,
  groupsService,
  emailTemplateService,
  phishletService,
  senderProfileService,
  targetsService,
  attachmentService,
  analyticsService,
} from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignsPage() {
  const { user } = useAuth();
  const getNowLocalForInput = () => {
    const d = new Date();
    d.setSeconds(0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const getLocalForInputWithOffset = (minutesOffset: number) => {
    const d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + minutesOffset);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [campaignResults, setCampaignResults] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [phishlets, setPhishlets] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [senderProfiles, setSenderProfiles] = useState<any[]>([]);
  const [targets, setTargets] = useState<any[]>([]);
  const [attachPreferences, setAttachPreferences] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CampaignCreate>({
    name: "",
    description: "",
    sender_profile_id: undefined,
    email_template_id: undefined,
    phishlet_id: undefined,
    attachment_id: undefined,
    target_type: "group",
    select_preference: "undefined",
    target_group_id: undefined,
    target_individuals: [],
    scheduled_at: undefined,
    launch_now: false,
  });
  const openModal = useSearchParams().get("openModal");

  const handleScheduledAtChange = (value: string) => {
    // Guard empty
    if (!value) {
      setFormData({ ...formData, scheduled_at: undefined });
      return;
    }
    const selected = new Date(value);
    const now = new Date();
    now.setSeconds(0, 0);
    const minAllowed = new Date(now.getTime() + 30 * 60 * 1000);
    if (selected < minAllowed) {
      const fixed = getLocalForInputWithOffset(30);
      setFormData({ ...formData, scheduled_at: fixed });
      toast.error("Please choose at least 30 minutes from now");
      return;
    }
    setFormData({ ...formData, scheduled_at: value });
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
    // if (!emlForm.name) {
    //   setEmlForm((prev) => ({
    //     ...prev,
    //     name: file.name.replace(".eml", ""),
    //   }));
    // }
    return true;
  };

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    loadData();
    if (openModal === "true") {
      setDialogOpen(true);
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        campaignsData,
        groupsData,
        templatesData,
        phishletsData,
        profilesData,
        targetsData,
        attachmentData,
      ] = await Promise.all([
        campaignService.getCampaigns(),
        groupsService.getGroups(),
        emailTemplateService.getTemplates(),
        phishletService.getPhishlets(),
        senderProfileService.getProfiles(),
        targetsService.getTargets(),
        attachmentService.getAttachments(),
      ]);

      setCampaigns(campaignsData);
      console.log("campaigns", campaignsData);
      setGroups(groupsData);
      setTemplates(templatesData);
      setPhishlets(phishletsData);
      console.log("attachments", attachmentData);
      setAttachments(attachmentData);
      setSenderProfiles(profilesData);
      setTargets(targetsData);
    } catch (error) {
      toast.error("Failed to load campaigns data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setViewMode("create");
    setSelectedCampaign(null);
    setFormData({
      name: "",
      description: "",
      sender_profile_id: undefined,
      email_template_id: undefined,
      phishlet_id: undefined,
      target_type: "group",
      target_group_id: undefined,
      target_individuals: [],
      scheduled_at: undefined,
      launch_now: false,
    });
    setDialogOpen(true);
  };

  const handleEdit = (campaign: Campaign) => {
    // Only allow editing if campaign is not running, scheduled, or completed
    if (["running", "scheduled", "completed"].includes(campaign.status)) {
      toast.error(
        "Cannot edit campaigns that are running, scheduled, or completed"
      );
      return;
    }

    setViewMode("edit");
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      sender_profile_id: campaign.sender_profile_id,
      email_template_id: campaign.email_template_id,
      phishlet_id: campaign.phishlet_id,
      target_type: campaign.target_type,
      attachment_id: campaign.attachment_id,
      target_group_id: campaign.target_group_id,
      target_individuals: campaign.target_individuals || [],
      scheduled_at: campaign.scheduled_at,
      launch_now: false,
    });
    setDialogOpen(true);
  };

  const handleView = async (campaign: Campaign) => {
    setViewMode("view");
    setSelectedCampaign(campaign);

    // Load campaign results for analytics
    try {
      const results = await campaignService.getCampaignResults(campaign.id);
      setCampaignResults(results);
    } catch (error) {
      console.error("Failed to load campaign results:", error);
      setCampaignResults([]);
    }

    setDialogOpen(true);
  };

  const handleRun = async (campaignId: number) => {
    try {
      await campaignService.runCampaign(campaignId);
      toast.success("Campaign started successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to start campaign");
    }
  };

  const handlePause = async (campaignId: number) => {
    try {
      await campaignService.pauseCampaign(campaignId);
      toast.success("Campaign paused successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to pause campaign");
    }
  };

  const handleDelete = async (campaignId: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      await campaignService.deleteCampaign(campaignId);
      toast.success("Campaign deleted successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete campaign");
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    if (!formData.sender_profile_id) {
      toast.error("Sender profile is required");
      return;
    }

    if (!formData.email_template_id) {
      toast.error("Email template is required");
      return;
    }

    if (formData.select_preference == "phislet" && !formData.phishlet_id) {
      toast.error("Phishlet is required");
      return;
    }
    if (formData.select_preference == "attachment" && !formData.attachment_id) {
      toast.error("attachment is required");
      return;
    }

    if (formData.target_type === "group" && !formData.target_group_id) {
      toast.error("Target group is required");
      return;
    }

    if (
      formData.target_type === "individual" &&
      (!formData.target_individuals || formData.target_individuals.length === 0)
    ) {
      toast.error("At least one target individual is required");
      return;
    }

    try {
      if (viewMode === "create") {
        await campaignService.createCampaign(formData);
        toast.success("Campaign created successfully");
      } else if (viewMode === "edit" && selectedCampaign) {
        await campaignService.updateCampaign(selectedCampaign.id, formData);
        toast.success("Campaign updated successfully");
      }
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to save campaign");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "paused":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResourceName = (
    id: any,
    type: "group" | "template" | "phishlet" | "profile" | "attachment"
  ) => {
    const resources = {
      group: groups,
      template: templates,
      phishlet: phishlets,
      profile: senderProfiles,
      attachment: attachments,
    };
    const resource = resources[type].find((r) => r.id === id);

    return resource?.name || `Unknown ${type}`;
  };

  const canEdit = (campaign: Campaign) => {
    return !["running", "scheduled", "completed"].includes(campaign.status);
  };

  const canRun = (campaign: Campaign) => {
    return ["scheduled", "paused"].includes(campaign.status);
  };

  const canPause = (campaign: Campaign) => {
    return campaign.status === "running";
  };

  if (loading) {
    const rows = 6;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              <Skeleton className="h-8 w-48" />
            </h1>
            <p className="text-muted-foreground font-mono">
              <Skeleton className="h-4 w-64 mt-2" />
            </p>
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-36" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-80" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* table header skeleton */}
                <div className="grid grid-cols-7 gap-4 py-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>

                {/* rows skeleton */}
                {Array.from({ length: rows }).map((_, r) => (
                  <div
                    key={r}
                    className="grid grid-cols-7 gap-4 items-center py-4 border-b"
                  >
                    <Skeleton className="h-4 w-full col-span-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2 justify-end col-span-1">
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">
            Campaigns
          </h1>
          <p className="text-muted-foreground font-mono">
            Create and manage your phishing simulation campaigns.
          </p>
        </div>
        <Button onClick={handleCreate} className="font-mono">
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>
      {/* {user?.role && (
        <Card>
          <>
            <CardHeader>
              <CardTitle className="font-mono">Admin Campaigns</CardTitle>
              <CardDescription className="font-mono">
                Managed and monitored campaigns by admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium font-mono">
                    No campaigns yet
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground font-mono">
                    Create your first campaign to get started with security
                    awareness training.
                  </p>
                  <Button onClick={handleCreate} className="mt-4 font-mono">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono">Name</TableHead>
                      <TableHead className="font-mono">Status</TableHead>
                      <TableHead className="font-mono">Target Type</TableHead>
                      <TableHead className="font-mono">Scheduled</TableHead>
                      <TableHead className="font-mono">Created</TableHead>
                      <TableHead className="font-mono">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map(
                      (campaign) =>
                        campaign.is_admin && (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-mono">
                              <div>
                                <div className="font-medium">
                                  {campaign.name}
                                </div>
                                {campaign.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {campaign.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`font-mono ${getStatusColor(
                                  campaign.status
                                )}`}
                              >
                                {campaign.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">
                              {campaign.target_type === "group"
                                ? "Group"
                                : "Individual"}
                            </TableCell>
                            <TableCell className="font-mono">
                              {campaign.scheduled_at
                                ? formatDate(campaign.scheduled_at)
                                : "Not scheduled"}
                            </TableCell>
                            <TableCell className="font-mono">
                              {formatDate(campaign.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(campaign)}
                                  title="View Campaign"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {canEdit(campaign) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(campaign)}
                                    title="Edit Campaign"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}

                                {canRun(campaign) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRun(campaign.id)}
                                    title="Run Campaign"
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                )}

                                {canPause(campaign) && user?.role && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePause(campaign.id)}
                                    title="Pause Campaign"
                                  >
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                )}
                                {user?.role && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(campaign.id)}
                                    title="Delete Campaign"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </>
        </Card>
      )} */}
      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-mono">
            {/* {user?.role ? "All" : "Your"} Campaigns */}
            Your Campaigns
          </CardTitle>
          <CardDescription className="font-mono">
            Manage and monitor your security awareness campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium font-mono">
                No campaigns yet
              </h3>
              <p className="mt-2 text-sm text-muted-foreground font-mono">
                Create your first campaign to get started with security
                awareness training.
              </p>
              <Button onClick={handleCreate} className="mt-4 font-mono">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="max-h-[700px] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">Name</TableHead>
                    <TableHead className="font-mono">Status</TableHead>
                    {/* {user?.role && (
                      <TableHead className="font-mono">Created by</TableHead>
                    )} */}
                    <TableHead className="font-mono">Target Type</TableHead>
                    <TableHead className="font-mono">Scheduled</TableHead>
                    <TableHead className="font-mono">Created</TableHead>
                    <TableHead className="font-mono">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map(
                    (campaign) =>
                      !campaign.is_admin && (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-mono">
                            <div>
                              <div className="font-medium">{campaign.name}</div>
                              {campaign.description && (
                                <div className="text-sm text-muted-foreground">
                                  {campaign.description.length > 0
                                    ? campaign.description.length > 30
                                      ? campaign.description.substring(0, 30) +
                                        "..."
                                      : campaign.description
                                    : "No description"}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`font-mono ${getStatusColor(
                                campaign.status
                              )}`}
                            >
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          {/* {user?.role && (
                            <TableCell className="font-mono">
                              {campaign.user_name}
                            </TableCell>
                          )} */}
                          <TableCell className="font-mono">
                            {campaign.target_type === "group"
                              ? "Group"
                              : "Individual"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {campaign.scheduled_at
                              ? formatDate(campaign.scheduled_at)
                              : "Not scheduled"}
                          </TableCell>
                          <TableCell className="font-mono">
                            {formatDate(campaign.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(campaign)}
                                title="View Campaign"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              {canEdit(campaign) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(campaign)}
                                  title="Edit Campaign"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}

                              {canRun(campaign) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRun(campaign.id)}
                                  title="Run Campaign"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}

                              {canPause(campaign) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePause(campaign.id)}
                                  title="Pause Campaign"
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(campaign.id)}
                                title="Delete Campaign"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Campaign Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={`w-[50%] min-w-[50%] max-h-[90vh] ${
            viewMode === "create" || viewMode === "edit" ? "h-fit" : "h-full"
          } flex flex-col overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className="font-mono">
              {viewMode === "create"
                ? "Create Campaign"
                : viewMode === "edit"
                ? "Edit Campaign"
                : "Campaign Details"}
            </DialogTitle>
            <DialogDescription className="font-mono">
              {viewMode === "create"
                ? "Create a new phishing simulation campaign"
                : viewMode === "edit"
                ? "Update campaign settings"
                : "View campaign information and analytics"}
            </DialogDescription>
          </DialogHeader>

          {viewMode === "view" && selectedCampaign ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details" className="font-mono">
                  Details
                </TabsTrigger>
                <TabsTrigger value="analytics" className="font-mono">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="results" className="font-mono">
                  Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-mono">Name</Label>
                    <p className="text-sm font-mono">{selectedCampaign.name}</p>
                  </div>
                  <div>
                    <Label className="font-mono">Status</Label>
                    <Badge
                      className={`font-mono ${getStatusColor(
                        selectedCampaign.status
                      )}`}
                    >
                      {selectedCampaign.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-mono">Description</Label>
                    <p className="text-sm font-mono break-words">
                      {selectedCampaign.description || "No description"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-mono">Target Type</Label>
                    <p className="text-sm font-mono">
                      {selectedCampaign.target_type === "group"
                        ? "Group"
                        : "Individual"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-mono">Sender Profile</Label>
                    <p className="text-sm font-mono">
                      {getResourceName(
                        selectedCampaign.sender_profile_id,
                        "profile"
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="font-mono">Email Template</Label>
                    <p className="text-sm font-mono">
                      {getResourceName(
                        selectedCampaign.email_template_id,
                        "template"
                      )}
                    </p>
                  </div>
                  {selectedCampaign.phishlet_id && (
                    <div>
                      <Label className="font-mono">Phishlet</Label>
                      <p className="text-sm font-mono">
                        {getResourceName(
                          selectedCampaign.phishlet_id || null,
                          "phishlet"
                        )}
                      </p>
                    </div>
                  )}
                  {selectedCampaign.attachment_id && (
                    <div>
                      <Label className="font-mono">Attachment</Label>
                      <p className="text-sm font-mono">
                        {getResourceName(
                          selectedCampaign.attachment_id || null,
                          "attachment"
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="font-mono">Scheduled At</Label>
                    <p className="text-sm font-mono">
                      {selectedCampaign.scheduled_at
                        ? formatDate(selectedCampaign.scheduled_at)
                        : "Not scheduled"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-mono">Created</Label>
                    <p className="text-sm font-mono">
                      {formatDate(selectedCampaign.created_at)}
                    </p>
                  </div>
                  <div>
                    <Label className="font-mono">Updated</Label>
                    <p className="text-sm font-mono">
                      {formatDate(selectedCampaign.updated_at)}
                    </p>
                  </div>
                </div>
                <br />
                {/* {campaignResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-mono">Target</TableHead>
                        <TableHead className="font-mono">Email Sent</TableHead>
                        <TableHead className="font-mono">Opened</TableHead>
                        {selectedCampaign.phishlet_id && (
                          <>
                            <TableHead className="font-mono">Clicked</TableHead>
                            <TableHead className="font-mono">
                              Submitted
                            </TableHead>
                          </>
                        )}
                        {selectedCampaign.attachment_id && (
                          <>
                            <TableHead className="font-mono">
                              Attachment sent
                            </TableHead>
                          </>
                        )}
                        <TableHead className="font-mono"> </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignResults.map((result, cmId) => (
                        <React.Fragment key={cmId}>
                          <TableRow
                            key={result.id}
                            className="cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => toggleRow(result.id)}
                          >
                            <TableCell className="font-mono">
                              {result.target_email}
                            </TableCell>
                            <TableCell className="font-mono">
                              <Badge
                                variant={
                                  result.email_sent ? "default" : "secondary"
                                }
                              >
                                {result.email_sent ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">
                              <Badge
                                variant={
                                  result.email_opened ? "default" : "secondary"
                                }
                              >
                                {result.email_opened ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            {selectedCampaign.phishlet_id && (
                              <>
                                <TableCell className="font-mono">
                                  <Badge
                                    variant={
                                      result.link_clicked
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {result.link_clicked ? "Yes" : "No"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono">
                                  <Badge
                                    variant={
                                      result.form_submitted
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {result.form_submitted ? "Yes" : "No"}
                                  </Badge>
                                </TableCell>
                              </>
                            )}
                            {selectedCampaign.attachment_id && (
                              <TableCell className="font-mono">
                                <Badge
                                  variant={
                                    result.email_sent ? "default" : "secondary"
                                  }
                                >
                                  {result.email_sent ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                            )}
                            <TableCell>
                              {expandedRowId === result.id ? (
                                <ChevronUp
                                  className="h-4 w-4"
                                  color={"white"}
                                />
                              ) : (
                                <ChevronDown
                                  className="h-4 w-4"
                                  color={"white"}
                                />
                              )}
                            </TableCell>
                          </TableRow>

                          {expandedRowId === result.id && (
                            <TableRow className="bg-muted/50">
                              <TableCell
                                colSpan={5}
                                className="font-mono text-sm"
                              >
                                <div>
                                  {result?.captured_data === null ? (
                                    <p className="text-sm font-mono text-muted-foreground">
                                      Data not captured yet
                                    </p>
                                  ) : (
                                    <div>
                                      {(
                                        result.captured_data
                                          .credentials as string[][]
                                      ).map((credential, i) => (
                                        <div key={i} className="mb-2">
                                          {credential.map((cred, j) => (
                                            <p
                                              key={j}
                                              className="text-sm font-mono text-muted-foreground"
                                            >
                                              {cred}
                                            </p>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium font-mono">
                      No results yet
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground font-mono">
                      Campaign results will appear here once the campaign is
                      running.
                    </p>
                  </div>
                )} */}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {/* Campaign Overview */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium font-mono">
                    Campaign Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-mono text-muted-foreground">
                              Total Targets
                            </p>
                            <p className="text-3xl font-bold font-mono text-blue-600">
                              {campaignResults.length || 0}
                            </p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                      <CardContent className="px-5 py-4">
                        <div className="flex items-center justify-between">
                          {/* Text Section */}

                          <div className="space-y-1">
                            <p className="text-sm font-mono text-muted-foreground">
                              Emails Sent
                            </p>
                            <p className="text-3xl font-bold font-mono text-green-600">
                              {
                                campaignResults.filter((r) => r.email_sent)
                                  .length
                              }
                            </p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-full">
                            <Mail className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-mono text-muted-foreground">
                              Opened
                            </p>
                            <p className="text-3xl font-bold font-mono text-yellow-600">
                              {
                                campaignResults.filter((r) => r.email_opened)
                                  .length
                              }
                            </p>
                          </div>
                          <div className="p-3 bg-yellow-100 rounded-full">
                            <Eye className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-mono text-muted-foreground">
                              Clicked
                            </p>
                            <p className="text-3xl font-bold font-mono text-red-600">
                              {
                                campaignResults.filter((r) => r.link_clicked)
                                  .length
                              }
                            </p>
                          </div>
                          <div className="p-3 bg-red-100 rounded-full">
                            <Target className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium font-mono">
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-mono">
                          Engagement Rates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono">Open Rate</span>
                            <span className="text-sm font-mono font-medium">
                              {campaignResults.length > 0
                                ? `${(
                                    (campaignResults.filter(
                                      (r) => r.email_opened
                                    ).length /
                                      campaignResults.length) *
                                    100
                                  ).toFixed(1)}%`
                                : "0%"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  campaignResults.length > 0
                                    ? (campaignResults.filter(
                                        (r) => r.email_opened
                                      ).length /
                                        campaignResults.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono">
                              Click Rate
                            </span>
                            <span className="text-sm font-mono font-medium">
                              {campaignResults.length > 0
                                ? `${(
                                    (campaignResults.filter(
                                      (r) => r.link_clicked
                                    ).length /
                                      campaignResults.length) *
                                    100
                                  ).toFixed(1)}%`
                                : "0%"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  campaignResults.length > 0
                                    ? (campaignResults.filter(
                                        (r) => r.link_clicked
                                      ).length /
                                        campaignResults.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono">
                              Submission Rate
                            </span>
                            <span className="text-sm font-mono font-medium">
                              {campaignResults.length > 0
                                ? `${(
                                    (campaignResults.filter(
                                      (r) => r.form_submitted
                                    ).length /
                                      campaignResults.length) *
                                    100
                                  ).toFixed(1)}%`
                                : "0%"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  campaignResults.length > 0
                                    ? (campaignResults.filter(
                                        (r) => r.form_submitted
                                      ).length /
                                        campaignResults.length) *
                                      100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base font-mono">
                          Risk Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono">
                              High Risk Targets
                            </span>
                            <span className="text-sm font-mono font-medium text-red-600">
                              {
                                campaignResults.filter((r) => r.form_submitted)
                                  .length
                              }
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            Targets who submitted credentials or sensitive
                            information
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono">
                              Medium Risk Targets
                            </span>
                            <span className="text-sm font-mono font-medium text-yellow-600">
                              {
                                campaignResults.filter(
                                  (r) => r.link_clicked && !r.form_submitted
                                ).length
                              }
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            Targets who clicked the phishing link but didn't
                            submit
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono">
                              Low Risk Targets
                            </span>
                            <span className="text-sm font-mono font-medium text-green-600">
                              {
                                campaignResults.filter(
                                  (r) => r.email_opened && !r.link_clicked
                                ).length
                              }
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            Targets who opened the email but didn't click
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono">
                              Safe Targets
                            </span>
                            <span className="text-sm font-mono font-medium text-blue-600">
                              {
                                campaignResults.filter((r) => !r.email_opened)
                                  .length
                              }
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            Targets who didn't open the email
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium font-mono">Quick Stats</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold font-mono text-blue-600">
                          {campaignResults.filter((r) => r.email_sent).length}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          Emails Delivered
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold font-mono text-green-600">
                          {campaignResults.filter((r) => r.email_opened).length}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          Emails Opened
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold font-mono text-red-600">
                          {
                            campaignResults.filter((r) => r.form_submitted)
                              .length
                          }
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          Form Submissions
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                {campaignResults.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-mono">Target</TableHead>
                        <TableHead className="font-mono">Email Sent</TableHead>
                        <TableHead className="font-mono">Opened</TableHead>
                        {selectedCampaign.phishlet_id && (
                          <>
                            <TableHead className="font-mono">Clicked</TableHead>
                            <TableHead className="font-mono">
                              Submitted
                            </TableHead>
                          </>
                        )}
                        {selectedCampaign.attachment_id && (
                          <>
                            <TableHead className="font-mono">
                              Attachment sent
                            </TableHead>
                          </>
                        )}
                        <TableHead className="font-mono"> </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignResults.map((result, cmId) => (
                        <React.Fragment key={cmId}>
                          <TableRow
                            key={result.id}
                            className="cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => toggleRow(result.id)}
                          >
                            <TableCell className="font-mono">
                              {result.target_email}
                            </TableCell>
                            <TableCell className="font-mono">
                              <Badge
                                variant={
                                  result.email_sent ? "default" : "secondary"
                                }
                              >
                                {result.email_sent ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono">
                              <Badge
                                variant={
                                  result.email_opened ? "default" : "secondary"
                                }
                              >
                                {result.email_opened ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            {selectedCampaign.phishlet_id && (
                              <>
                                <TableCell className="font-mono">
                                  <Badge
                                    variant={
                                      result.link_clicked
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {result.link_clicked ? "Yes" : "No"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono">
                                  <Badge
                                    variant={
                                      result.form_submitted
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {result.form_submitted ? "Yes" : "No"}
                                  </Badge>
                                </TableCell>
                              </>
                            )}
                            {selectedCampaign.attachment_id && (
                              <TableCell className="font-mono">
                                <Badge
                                  variant={
                                    result.email_sent ? "default" : "secondary"
                                  }
                                >
                                  {result.email_sent ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                            )}
                            <TableCell>
                              {expandedRowId === result.id ? (
                                <ChevronUp
                                  className="h-4 w-4"
                                  color={"white"}
                                />
                              ) : (
                                <ChevronDown
                                  className="h-4 w-4"
                                  color={"white"}
                                />
                              )}
                            </TableCell>
                          </TableRow>

                          {expandedRowId === result.id && (
                            <TableRow className="bg-muted/50">
                              <TableCell
                                colSpan={5}
                                className="font-mono text-sm"
                              >
                                <div>
                                  {result?.captured_data === null ? (
                                    <p className="text-sm font-mono text-muted-foreground">
                                      Data not captured yet
                                    </p>
                                  ) : (
                                    <div>
                                      {(
                                        result.captured_data
                                          .credentials as string[][]
                                      ).map((credential, i) => (
                                        <div key={i} className="mb-2">
                                          {credential.map((cred, j) => (
                                            <p
                                              key={j}
                                              className="text-sm font-mono text-muted-foreground"
                                            >
                                              {cred}
                                            </p>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium font-mono">
                      No results yet
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground font-mono">
                      Campaign results will appear here once the campaign is
                      running.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-6"
            >
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium font-mono">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-mono py-2">
                      Campaign Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter campaign name"
                      className="font-mono"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="font-mono py-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter campaign description"
                      className="font-mono"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Components */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium font-mono">
                  Campaign Components
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sender_profile" className="font-mono py-2">
                      Sender Profile *
                    </Label>
                    <Select
                      value={formData.sender_profile_id?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          sender_profile_id: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="font-mono">
                        <SelectValue placeholder="Select sender profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {senderProfiles
                          .filter((profile) => profile.is_active)
                          .map((profile) => (
                            <SelectItem
                              key={profile.id}
                              value={profile.id.toString()}
                            >
                              {profile.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="email_template" className="font-mono py-2">
                      Email Template *
                    </Label>
                    <Select
                      value={formData.email_template_id?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          email_template_id: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger className="font-mono">
                        <SelectValue placeholder="Select email template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates
                          .filter((template) => template.is_active)
                          .map((template) => (
                            <SelectItem
                              key={template.id}
                              value={template.id.toString()}
                            >
                              {template.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label
                      htmlFor="select_preference"
                      className="font-mono py-2"
                    >
                      Select Preference *
                    </Label>
                    <Select
                      value={formData.select_preference || ""}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          select_preference: value,
                        })
                      }
                    >
                      <SelectTrigger className="font-mono">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attachment">attachment</SelectItem>
                        <SelectItem value="phishlet">Phislet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.select_preference === "phishlet" && (
                    <div>
                      <Label htmlFor="phishlet" className="font-mono py-2">
                        Phishlet *
                      </Label>
                      <Select
                        value={formData.phishlet_id?.toString() || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            phishlet_id: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger className="font-mono">
                          <SelectValue placeholder="Select phishlet" />
                        </SelectTrigger>
                        <SelectContent>
                          {phishlets
                            .filter((phishlet) => phishlet.is_active)
                            .map((phishlet) => (
                              <SelectItem
                                key={phishlet.id}
                                value={phishlet.id.toString()}
                              >
                                {phishlet.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {/* {formData.select_preference === "attachment" && (
                    <div>
                      <Label
                        htmlFor="attachment Type"
                        className="font-mono py-2"
                      >
                        Attachment Type
                      </Label>
                      <Select
                        value={formData.attachment_type?.toString() || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            attachment_type: value,
                          })
                        }
                      >
                        <SelectTrigger className="font-mono">
                          <SelectValue placeholder="attachment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectContent>
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="custom">custom</SelectItem>
                          </SelectContent>
                        </SelectContent>
                      </Select>
                    </div>
                  )} */}
                  <div>
                    {formData.select_preference == "attachment" && (
                      <div>
                        <Label htmlFor="phishlet" className="font-mono py-2">
                          Attachment *
                        </Label>
                        <Select
                          value={formData.attachment_id?.toString() || ""}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              attachment_id: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="font-mono">
                            <SelectValue placeholder="Select attachment" />
                          </SelectTrigger>
                          <SelectContent>
                            {attachments
                              // .filter((attachment) => attachment.is_admin)
                              .map((attachment) => (
                                <SelectItem
                                  key={attachment.id}
                                  value={attachment.id.toString()}
                                >
                                  {attachment.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {/* {formData.attachment_type === "admin" && (
                      <div>
                        <Label htmlFor="attachment" className="font-mono py-2">
                          Attachment *
                        </Label>
                        <Select
                          value={formData.attachment_id?.toString() || ""}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              attachment_id: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="font-mono">
                            <SelectValue placeholder="Select attachment" />
                          </SelectTrigger>
                          <SelectContent>
                            {attachments
                              // .filter((attachment) => attachment.is_admin)
                              .map((attachment) => (
                                <SelectItem
                                  key={attachment.id}
                                  value={attachment.id.toString()}
                                >
                                  {attachment.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>

              {/* Target Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium font-mono">
                  Target Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target_type" className="font-mono py-2">
                      Target Type *
                    </Label>
                    <Select
                      value={formData.target_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, target_type: value })
                      }
                    >
                      <SelectTrigger className="font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">Group</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.target_type === "group" ? (
                    <div>
                      <Label htmlFor="target_group" className="font-mono py-2">
                        Target Group
                      </Label>
                      <Select
                        value={formData.target_group_id?.toString() || ""}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            target_group_id: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger className="font-mono">
                          <SelectValue placeholder="Select target group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups
                            .filter((group) => group.is_active)
                            .map((group) => (
                              <SelectItem
                                key={group.id}
                                value={group.id.toString()}
                              >
                                {group.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div>
                      <Label className="font-mono py-2">
                        Target Individuals
                      </Label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          const targetId = parseInt(value);
                          if (
                            !formData.target_individuals?.includes(targetId)
                          ) {
                            setFormData({
                              ...formData,
                              target_individuals: [
                                ...(formData.target_individuals || []),
                                targetId,
                              ],
                            });
                          }
                        }}
                      >
                        <SelectTrigger className="font-mono">
                          <SelectValue placeholder="Add target individual" />
                        </SelectTrigger>
                        <SelectContent>
                          {targets
                            .filter((target) => target.is_active)
                            .map((target) => (
                              <SelectItem
                                key={target.id}
                                value={target.id.toString()}
                              >
                                {target.first_name} {target.last_name} (
                                {target.email})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                {formData.target_type !== "group" &&
                  formData.target_individuals &&
                  formData.target_individuals.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-scroll bg-gray-900 text-gray-100 p-2 rounded">
                      {formData.target_individuals.map((targetId) => {
                        const target = targets.find((t) => t.id === targetId);
                        return target ? (
                          <div
                            key={targetId}
                            className="flex items-center justify-between p-2 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-mono">
                                {target.first_name} {target.last_name} (
                                {target.email.substring(0, 13) + "..."})
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  target_individuals:
                                    formData.target_individuals?.filter(
                                      (id) => id !== targetId
                                    ),
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
              </div>

              {/* Launch Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium font-mono">
                  Launch Configuration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="launch_now"
                      checked={formData.launch_now}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, launch_now: checked })
                      }
                    />
                    <Label htmlFor="launch_now" className="font-mono">
                      Launch Now
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">
                    When enabled, the campaign will start immediately. When
                    disabled, you can schedule the campaign for later.
                  </p>

                  {!formData.launch_now && (
                    <div>
                      <Label htmlFor="scheduled_at" className="font-mono py-2">
                        Schedule Campaign
                      </Label>
                      <Input
                        id="scheduled_at"
                        type="datetime-local"
                        min={getLocalForInputWithOffset(30)}
                        value={formData.scheduled_at || ""}
                        onChange={(e) =>
                          handleScheduledAtChange(e.target.value)
                        }
                        className="font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="font-mono"
                >
                  Cancel
                </Button>
                <Button type="submit" className="font-mono">
                  {viewMode === "create"
                    ? "Create Campaign"
                    : "Update Campaign"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
