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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  userSettingsService,
  UserSettings,
  UserProfileUpdate,
  PasswordChange,
  AISettings,
} from "@/lib/auth";

export default function SettingsPage() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    full_name: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // AI Settings form state
  const [aiForm, setAiForm] = useState({
    ai_model: "",
    api_key: "",
    provider: "",
    max_tokens: 1000,
    temperature: 0.7,
    is_active: false,
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const settings = await userSettingsService.getUserProfile();
      setUserSettings(settings);

      // Set profile form
      setProfileForm({
        username: settings.username,
        email: settings.email,
        full_name: settings.full_name || "",
      });

      // Load AI settings
      const aiSettings = await userSettingsService.getAISettings();
      setAiForm({
        ai_model: aiSettings.ai_model || "",
        api_key: "", // Don't load API key for security
        provider: aiSettings.provider || "",
        max_tokens: aiSettings.max_tokens || 1000,
        temperature: aiSettings.temperature || 0.7,
        is_active: aiSettings.is_active || false,
      });
    } catch (error) {
      toast.error("Failed to load user settings");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      const updateData: UserProfileUpdate = {};
      if (profileForm.username !== userSettings?.username)
        updateData.username = profileForm.username;
      if (profileForm.email !== userSettings?.email)
        updateData.email = profileForm.email;
      if (profileForm.full_name !== userSettings?.full_name)
        updateData.full_name = profileForm.full_name;

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const updatedSettings = await userSettingsService.updateUserProfile(
        updateData
      );
      setUserSettings(updatedSettings);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setSaving(true);
    try {
      const passwordData: PasswordChange = {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      };

      await userSettingsService.changePassword(passwordData);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      toast.success("Password changed successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleAISettingsUpdate = async () => {
    setSaving(true);
    try {
      const aiData: AISettings = {
        ai_model: aiForm.ai_model,
        api_key: aiForm.api_key,
        provider: aiForm.provider,
        max_tokens: aiForm.max_tokens,
        temperature: aiForm.temperature,
        is_active: aiForm.is_active,
      };

      const updatedSettings = await userSettingsService.updateAISettings(
        aiData
      );
      setUserSettings(updatedSettings);
      setAiForm((prev) => ({ ...prev, api_key: "" })); // Clear API key after saving
      toast.success("AI settings updated successfully");
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to update AI settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileForm.full_name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  placeholder="Enter full name"
                />
              </div>
              <Button onClick={handleProfileUpdate} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      current_password: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      new_password: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirm_password: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handlePasswordChange} disabled={saving}>
                {saving ? "Changing Password..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Settings</CardTitle>
              <CardDescription>
                Configure AI settings for email template generation and other
                AI-powered features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select
                    value={aiForm.provider}
                    onValueChange={(value) =>
                      setAiForm((prev) => ({ ...prev, provider: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="azure">Azure</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai_model">AI Model</Label>
                  <Input
                    id="ai_model"
                    value={aiForm.ai_model}
                    onChange={(e) =>
                      setAiForm((prev) => ({
                        ...prev,
                        ai_model: e.target.value,
                      }))
                    }
                    placeholder="e.g., gpt-4, claude-3"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={aiForm.api_key}
                  onChange={(e) =>
                    setAiForm((prev) => ({ ...prev, api_key: e.target.value }))
                  }
                  placeholder="Enter API key"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={aiForm.max_tokens}
                    onChange={(e) =>
                      setAiForm((prev) => ({
                        ...prev,
                        max_tokens: parseInt(e.target.value) || 1000,
                      }))
                    }
                    min="1"
                    max="4000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={aiForm.temperature}
                    onChange={(e) =>
                      setAiForm((prev) => ({
                        ...prev,
                        temperature: parseFloat(e.target.value) || 0.7,
                      }))
                    }
                    min="0"
                    max="2"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ai_active"
                  checked={aiForm.is_active}
                  onCheckedChange={(checked: boolean) =>
                    setAiForm((prev) => ({ ...prev, is_active: checked }))
                  }
                />
                <Label htmlFor="ai_active">Enable AI Features</Label>
              </div>
              <Button onClick={handleAISettingsUpdate} disabled={saving}>
                {saving ? "Saving..." : "Save AI Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
