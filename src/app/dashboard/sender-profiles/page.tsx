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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Send, Mail, Key } from "lucide-react";
import {
  senderProfileService,
  SenderProfile,
  SenderProfileCreate,
  SenderProfileUpdate,
} from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
export default function SenderProfilesPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SenderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createloading, setcreateLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState<SenderProfile | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    auth_type: "smtp",
    from_address: "",
    from_name: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    oauth_client_id: "",
    oauth_client_secret: "",
    oauth_refresh_token: "",
    is_active: true,
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await senderProfileService.getProfiles();
      setProfiles(data);
    } catch (error) {
      toast.error("Failed to load sender profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    setcreateLoading(true);
    try {
      const profileData: SenderProfileCreate = {
        name: profileForm.name,
        auth_type: profileForm.auth_type,
        from_address: profileForm.from_address,
        from_name: profileForm.from_name || undefined,
        smtp_host:
          profileForm.auth_type === "smtp" ? profileForm.smtp_host : undefined,
        smtp_port:
          profileForm.auth_type === "smtp" ? profileForm.smtp_port : undefined,
        smtp_username:
          profileForm.auth_type === "smtp"
            ? profileForm.smtp_username
            : undefined,
        smtp_password:
          profileForm.auth_type === "smtp"
            ? profileForm.smtp_password
            : undefined,
        oauth_client_id:
          profileForm.auth_type === "oauth"
            ? profileForm.oauth_client_id
            : undefined,
        oauth_client_secret:
          profileForm.auth_type === "oauth"
            ? profileForm.oauth_client_secret
            : undefined,
        oauth_refresh_token:
          profileForm.auth_type === "oauth"
            ? profileForm.oauth_refresh_token
            : undefined,
        is_active: profileForm.is_active,
      };

      if (
        !profileForm.name ||
        !profileForm.auth_type ||
        !profileForm.from_address
      ) {
        toast.error(
          "Name, authentication type, and from address are required!"
        );
        setcreateLoading(false);
        return;
      }

      // Validate for SMTP profile setup
      if (profileForm.auth_type === "smtp") {
        if (
          !profileForm.smtp_host ||
          !profileForm.smtp_port ||
          !profileForm.smtp_username ||
          !profileForm.smtp_password
        ) {
          toast.error(
            "For SMTP auth, all SMTP fields (host, port, username, password) are required!"
          );
          setcreateLoading(false);
          return;
        }
        // Optional: Add SMTP-specific validations (e.g., port should be a valid number)
        if (
          isNaN(Number(profileForm.smtp_port)) ||
          Number(profileForm.smtp_port) <= 0
        ) {
          toast.error("SMTP port should be a valid positive number.");
          setcreateLoading(false);
          return;
        }
      }

      // Validate for OAuth profile setup
      if (profileForm.auth_type === "oauth") {
        if (
          !profileForm.oauth_client_id ||
          !profileForm.oauth_client_secret ||
          !profileForm.oauth_refresh_token
        ) {
          toast.error(
            "For OAuth auth, all OAuth fields (client ID, client secret, refresh token) are required!"
          );
          setcreateLoading(false);
          return;
        }
      }

      await senderProfileService.createProfile(profileData);
      toast.success("Sender profile created successfully");
      setDialogOpen(false);
      resetForm();
      loadProfiles();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to create profile");
    } finally {
      setcreateLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setcreateLoading(true);
    if (!selectedProfile) return;

    try {
      const profileData: SenderProfileUpdate = {
        name: profileForm.name,
        auth_type: profileForm.auth_type,
        from_address: profileForm.from_address,
        from_name: profileForm.from_name || undefined,
        smtp_host:
          profileForm.auth_type === "smtp" ? profileForm.smtp_host : undefined,
        smtp_port:
          profileForm.auth_type === "smtp" ? profileForm.smtp_port : undefined,
        smtp_username:
          profileForm.auth_type === "smtp"
            ? profileForm.smtp_username
            : undefined,
        smtp_password:
          profileForm.auth_type === "smtp" && profileForm.smtp_password
            ? profileForm.smtp_password
            : undefined,
        oauth_client_id:
          profileForm.auth_type === "oauth"
            ? profileForm.oauth_client_id
            : undefined,
        oauth_client_secret:
          profileForm.auth_type === "oauth" && profileForm.oauth_client_secret
            ? profileForm.oauth_client_secret
            : undefined,
        oauth_refresh_token:
          profileForm.auth_type === "oauth" && profileForm.oauth_refresh_token
            ? profileForm.oauth_refresh_token
            : undefined,
        is_active: profileForm.is_active,
      };

      if (
        !profileForm.name ||
        !profileForm.auth_type ||
        !profileForm.from_address
      ) {
        toast.error(
          "Name, authentication type, and from address are required!"
        );
        setcreateLoading(false);
        return;
      }

      // Validate for SMTP profile setup
      if (profileForm.auth_type === "smtp") {
        if (
          !profileForm.smtp_host ||
          !profileForm.smtp_port ||
          !profileForm.smtp_username ||
          !profileForm.smtp_password
        ) {
          toast.error(
            "For SMTP auth, all SMTP fields (host, port, username, password) are required!"
          );
          setcreateLoading(false);
          return;
        }
        // Optional: Add SMTP-specific validations (e.g., port should be a valid number)
        if (
          isNaN(Number(profileForm.smtp_port)) ||
          Number(profileForm.smtp_port) <= 0
        ) {
          toast.error("SMTP port should be a valid positive number.");
          setcreateLoading(false);
          return;
        }
      }

      // Validate for OAuth profile setup
      if (profileForm.auth_type === "oauth") {
        if (
          !profileForm.oauth_client_id ||
          !profileForm.oauth_client_secret ||
          !profileForm.oauth_refresh_token
        ) {
          toast.error(
            "For OAuth auth, all OAuth fields (client ID, client secret, refresh token) are required!"
          );
          setcreateLoading(false);
          return;
        }
      }

      await senderProfileService.updateProfile(selectedProfile.id, profileData);
      toast.success("Sender profile updated successfully");
      setDialogOpen(false);
      resetForm();
      loadProfiles();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setcreateLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId: number) => {
    setcreateLoading(true);
    if (!confirm("Are you sure you want to delete this sender profile?"))
      return;

    try {
      await senderProfileService.deleteProfile(profileId);
      toast.success("Sender profile deleted successfully");
      loadProfiles();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete profile");
    } finally {
      setcreateLoading(false);
    }
  };

  const resetForm = () => {
    setProfileForm({
      name: "",
      auth_type: "smtp",
      from_address: "",
      from_name: "",
      smtp_host: "",
      smtp_port: 587,
      smtp_username: "",
      smtp_password: "",
      oauth_client_id: "",
      oauth_client_secret: "",
      oauth_refresh_token: "",
      is_active: true,
    });
  };

  const openDialog = (
    mode: "create" | "edit" | "view",
    profile?: SenderProfile
  ) => {
    setViewMode(mode);
    setSelectedProfile(profile || null);
    setDialogOpen(true);

    if (mode === "create") {
      resetForm();
    }

    if (profile && mode === "edit") {
      setProfileForm({
        name: profile.name,
        auth_type: profile.auth_type,
        from_address: profile.from_address,
        from_name: profile.from_name || "",
        smtp_host: profile.smtp_host || "",
        smtp_port: profile.smtp_port || 587,
        smtp_username: profile.smtp_username || "",
        smtp_password: "", // Don't load password for security
        oauth_client_id: profile.oauth_client_id || "",
        oauth_client_secret: "", // Don't load secret for security
        oauth_refresh_token: "", // Don't load token for security
        is_active: profile.is_active,
      });
    }
  };

  const getAuthTypeIcon = (authType: string) => {
    return authType === "smtp" ? (
      <Mail className="h-4 w-4" />
    ) : (
      <Key className="h-4 w-4" />
    );
  };

  const getAuthTypeLabel = (authType: string) => {
    return authType === "smtp" ? "SMTP" : "OAuth";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading sender profiles...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sender Profiles</h1>
          <p className="text-muted-foreground">
            Create and manage email sender profiles for your campaigns.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog("create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {viewMode === "create" && "Create Sender Profile"}
                  {viewMode === "edit" && "Edit Sender Profile"}
                  {viewMode === "view" && selectedProfile?.name}
                </DialogTitle>
                <DialogDescription>
                  {viewMode === "view"
                    ? "View sender profile details and configuration."
                    : "Create a new sender profile with SMTP or OAuth authentication."}
                </DialogDescription>
              </DialogHeader>

              {viewMode === "view" && selectedProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">
                        Profile Name
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedProfile.name}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            selectedProfile.is_active ? "default" : "secondary"
                          }
                        >
                          {selectedProfile.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium">
                        From Address
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedProfile.from_address}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">From Name</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedProfile.from_name || "Not set"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Authentication Type
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                      {getAuthTypeIcon(selectedProfile.auth_type)}
                      <Badge variant="outline">
                        {getAuthTypeLabel(selectedProfile.auth_type)}
                      </Badge>
                    </div>
                  </div>

                  {selectedProfile.auth_type === "smtp" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        SMTP Configuration
                      </Label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-medium">Host</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedProfile.smtp_host}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">Port</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedProfile.smtp_port}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">
                            Username
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedProfile.smtp_username}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">
                            Password
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            ••••••••
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProfile.auth_type === "oauth" && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        OAuth Configuration
                      </Label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <Label className="text-xs font-medium">
                            Client ID
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedProfile.oauth_client_id}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">
                            Client Secret
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            ••••••••
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium">
                            Refresh Token
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            ••••••••
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(
                        selectedProfile.created_at
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated:{" "}
                      {new Date(
                        selectedProfile.updated_at
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="smtp" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="smtp">SMTP</TabsTrigger>
                    <TabsTrigger value="oauth">OAuth</TabsTrigger>
                  </TabsList>

                  <TabsContent value="smtp" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Profile Name</Label>
                        <Input
                          id="name"
                          required
                          maxLength={60}
                          value={profileForm.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter profile name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="from_address">From Address</Label>
                        <Input
                          id="from_address"
                          required
                          type="email"
                          maxLength={70}
                          value={profileForm.from_address}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              from_address: e.target.value,
                            }))
                          }
                          placeholder="sender@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="from_name">From Name (Optional)</Label>
                      <Input
                        id="from_name"
                        maxLength={70}
                        value={profileForm.from_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            from_name: e.target.value,
                          }))
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="smtp_host">SMTP Host</Label>
                        <Input
                          required
                          id="smtp_host"
                          maxLength={100}
                          value={profileForm.smtp_host}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              smtp_host: e.target.value,
                            }))
                          }
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp_port">SMTP Port</Label>
                        <Input
                          id="smtp_port"
                          type="number"
                          required
                          maxLength={10}
                          value={profileForm.smtp_port}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              smtp_port: parseInt(e.target.value) || 587,
                            }))
                          }
                          placeholder="587"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="smtp_username">SMTP Username</Label>
                        <Input
                          id="smtp_username"
                          maxLength={70}
                          required
                          value={profileForm.smtp_username}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              smtp_username: e.target.value,
                            }))
                          }
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp_password">SMTP Password</Label>
                        <Input
                          id="smtp_password"
                          maxLength={70}
                          type="password"
                          required
                          value={profileForm.smtp_password}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              smtp_password: e.target.value,
                            }))
                          }
                          placeholder="Enter password"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={profileForm.is_active}
                        onCheckedChange={(checked: boolean) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            is_active: checked,
                          }))
                        }
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <Button
                      disabled={createloading}
                      onClick={() => {
                        setProfileForm((prev) => ({
                          ...prev,
                          auth_type: "smtp",
                        }));
                        if (viewMode === "edit") {
                          handleUpdateProfile();
                        } else {
                          handleCreateProfile();
                        }
                      }}
                      className="w-full"
                    >
                      {viewMode === "edit"
                        ? "Update SMTP Profile"
                        : "Create SMTP Profile"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="oauth" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="oauth_name">Profile Name</Label>
                        <Input
                          id="oauth_name"
                          required
                          maxLength={70}
                          value={profileForm.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter profile name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="oauth_from_address">From Address</Label>
                        <Input
                          id="oauth_from_address"
                          type="email"
                          required
                          maxLength={70}
                          value={profileForm.from_address}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              from_address: e.target.value,
                            }))
                          }
                          placeholder="sender@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oauth_from_name">
                        From Name (Optional)
                      </Label>
                      <Input
                        id="oauth_from_name"
                        value={profileForm.from_name}
                        maxLength={70}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            from_name: e.target.value,
                          }))
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oauth_client_id">OAuth Client ID</Label>
                      <Input
                        id="oauth_client_id"
                        required
                        maxLength={70}
                        value={profileForm.oauth_client_id}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            oauth_client_id: e.target.value,
                          }))
                        }
                        placeholder="Enter OAuth client ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oauth_client_secret">
                        OAuth Client Secret
                      </Label>
                      <Input
                        id="oauth_client_secret"
                        type="password"
                        required
                        maxLength={70}
                        value={profileForm.oauth_client_secret}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            oauth_client_secret: e.target.value,
                          }))
                        }
                        placeholder="Enter OAuth client secret"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oauth_refresh_token">
                        OAuth Refresh Token
                      </Label>
                      <Input
                        id="oauth_refresh_token"
                        type="password"
                        required
                        maxLength={70}
                        value={profileForm.oauth_refresh_token}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            oauth_refresh_token: e.target.value,
                          }))
                        }
                        placeholder="Enter OAuth refresh token"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="oauth_is_active"
                        checked={profileForm.is_active}
                        onCheckedChange={(checked: boolean) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            is_active: checked,
                          }))
                        }
                      />
                      <Label htmlFor="oauth_is_active">Active</Label>
                    </div>
                    <Button
                      disabled={createloading}
                      onClick={() => {
                        setProfileForm((prev) => ({
                          ...prev,
                          auth_type: "oauth",
                        }));
                        if (viewMode === "edit") {
                          handleUpdateProfile();
                        } else {
                          handleCreateProfile();
                        }
                      }}
                      className="w-full"
                    >
                      {viewMode === "edit"
                        ? "Update OAuth Profile"
                        : "Create OAuth Profile"}
                    </Button>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{profile.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {profile.from_address}
                  </CardDescription>
                </div>
                {(!profile?.is_admin || user?.is_admin) && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog("edit", profile)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={createloading}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={profile.is_active ? "default" : "secondary"}>
                  {profile.is_active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center gap-2">
                  {getAuthTypeIcon(profile.auth_type)}
                  <Badge variant="outline">
                    {getAuthTypeLabel(profile.auth_type)}
                  </Badge>
                </div>
              </div>

              {profile.from_name && (
                <div className="text-sm text-muted-foreground">
                  From: {profile.from_name}
                </div>
              )}

              {profile.auth_type === "smtp" && (
                <div className="text-xs text-muted-foreground">
                  {profile.smtp_host}:{profile.smtp_port}
                </div>
              )}

              {profile.auth_type === "oauth" && (
                <div className="text-xs text-muted-foreground">
                  OAuth Client ID: {profile.oauth_client_id?.substring(0, 8)}...
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProfile(profile);
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

      {profiles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Send className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No sender profiles yet</h3>
              <p className="text-muted-foreground mt-1">
                Create your first sender profile to get started with email
                campaigns.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* <div>
        <h1 className="text-2xl font-bold tracking-tight">Sender Profiles</h1>
        <p className="text-muted-foreground">
          Created and managed email sender profiles by admin.
        </p>
      </div> */}

      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map(
          (profile) =>
            profile.is_admin && (
              <Card key={profile.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {profile.from_address}
                      </CardDescription>
                    </div>
                    {user?.is_admin && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog("edit", profile)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProfile(profile.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={profile.is_active ? "default" : "secondary"}
                    >
                      {profile.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {getAuthTypeIcon(profile.auth_type)}
                      <Badge variant="outline">
                        {getAuthTypeLabel(profile.auth_type)}
                      </Badge>
                    </div>
                  </div>

                  {profile.from_name && (
                    <div className="text-sm text-muted-foreground">
                      From: {profile.from_name}
                    </div>
                  )}

                  {profile.auth_type === "smtp" && (
                    <div className="text-xs text-muted-foreground">
                      {profile.smtp_host}:{profile.smtp_port}
                    </div>
                  )}

                  {profile.auth_type === "oauth" && (
                    <div className="text-xs text-muted-foreground">
                      OAuth Client ID:{" "}
                      {profile.oauth_client_id?.substring(0, 8)}...
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProfile(profile);
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
            )
        )}
      </div> */}
    </div>
  );
}
