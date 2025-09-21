import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}api/v1`;
import { saveAs } from "file-saver";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  created_at: string;
  is_admin: boolean;
  ai_api_key?: string;
  ai_model?: string;
  ai_provider?: string;
  ai_max_tokens?: number;
  ai_temperature?: number;
  ai_is_active?: boolean;
}

export interface UserSettings {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  ai_model?: string;
  ai_provider?: string;
  ai_max_tokens?: number;
  ai_temperature?: number;
  ai_is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  username?: string;
  email?: string;
  full_name?: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface AISettings {
  ai_model: string;
  api_key: string;
  provider: string;
  max_tokens?: number;
  temperature?: number;
  is_active: boolean;
}

export interface SignupData {
  username: string;
  email: string;
  is_admin: boolean;
  password: string;
  full_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SignupResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface Target {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
  group_id?: number;
  group_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TargetCreate {
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
  group_id?: number;
  is_active?: boolean;
}

export interface TargetUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  position?: string;
  group_id?: number;
  is_active?: boolean;
}

export interface DashboardStats {
  total_campaigns: number;
  active_campaigns: number;
  total_targets: number;
  total_templates: number;
  total_phishlets: number;
  total_sender_profiles: number;
  total_emails_sent: number;
  total_emails_opened: number;
  total_clicks: number;
  total_form_submissions: number;
  success_rate: number;
  recent_activity_count: number;
}

export interface CampaignStats {
  campaign_id: number;
  campaign_name: string;
  status: string;
  total_targets: number;
  emails_sent: number;
  emails_opened: number;
  clicks: number;
  form_submissions: number;
  success_rate: number;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  activity_type: string;
  resource_type?: string;
  resource_name?: string;
  description: string;
  timestamp: string;
}

export interface TimeSeriesData {
  date: string;
  emails_sent: number;
  emails_opened: number;
  clicks: number;
  form_submissions: number;
}

export interface TargetPerformance {
  target_id: number;
  target_name: string;
  target_email: string;
  campaigns_participated: number;
  emails_received: number;
  emails_opened: number;
  clicks: number;
  form_submissions: number;
  risk_score: number;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface GroupUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface EmailTemplate {
  id: number;
  name: string;
  description?: string;
  subject: string;
  html_content?: string;
  text_content?: string;
  template_type: string;
  ai_prompt?: string;
  ai_model_used?: string;
  variables?: Record<string, any>;
  is_active: boolean;
  isDemo: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}
export interface AttachmentResponse {
  id: number;
  name: string;
  description?: string;
  isDemo?: boolean;
  user_id: number;
  file_type: string;
  attachmentFile: string;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
}

export interface AttachmentCreate {
  name: string;
  description?: string;
  isDemo?: boolean;
  user_id: number;
  attachmentFile: File;
}

export interface AttachmentUpdate {
  name?: string;
  description?: string;
  isDemo?: boolean;
  attachmentFile?: string;
}

export interface AttachTemplate {
  id: number;
  name: string;
  description?: string;
  attachmentFile?: string;
  isDemo?: boolean;
  is_admin: boolean;
  file_type?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateCreate {
  name: string;
  description?: string;
  subject: string;
  html_content?: string;
  text_content?: string;
  template_type?: string;
  isDemo?: boolean;
  variables?: Record<string, any>;
  is_active?: boolean;
}
export interface AttachTemplateCreate {
  name: string;
  description?: string;
  attachmentFile?: Blob;
  isDemo?: boolean;
}

export interface EmailTemplateUpdate {
  name?: string;
  description?: string;
  subject?: string;
  html_content?: string;
  text_content?: string;
  isDemo?: boolean;
  variables?: Record<string, any>;
  is_active?: boolean;
}
export interface AttachTemplateUpdate {
  name: string;
  description?: string;
  file: File;
  isDemo?: boolean;
}

export interface AITemplateGenerateRequest {
  name: string;
  description?: string;
  prompt: string;
  subject_line?: string;
  template_type?: string;
  tone?: string;
  target_audience?: string;
  include_html?: boolean;
  include_text?: boolean;
  variables?: Record<string, any>;
}

export interface Phishlet {
  id: number;
  name: string;
  description?: string;
  original_url: string;
  clone_url?: string;
  form_fields?: Array<{
    type: string;
    name: string;
    id: string;
    placeholder: string;
    required: boolean;
    form_action: string;
    form_method: string;
  }>;
  capture_credentials: boolean;
  capture_other_data: boolean;
  redirect_url?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhishletCreate {
  name: string;
  description?: string;
  original_url: string;
  capture_credentials?: boolean;
  capture_other_data?: boolean;
  redirect_url?: string;
  is_active?: boolean;
}

export interface PhishletUpdate {
  name?: string;
  description?: string;
  capture_credentials?: boolean;
  capture_other_data?: boolean;
  redirect_url?: string;
  is_active?: boolean;
}

export interface PhishletCloneRequest {
  original_url: string;
  name: string;
  description?: string;
  capture_credentials?: boolean;
  capture_other_data?: boolean;
  redirect_url?: string;
}

export interface SenderProfile {
  id: number;
  name: string;
  auth_type: string;
  from_address: string;
  from_name?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  oauth_client_id?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface SenderProfileCreate {
  name: string;
  auth_type: string;
  from_address: string;
  from_name?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  oauth_client_id?: string;
  oauth_client_secret?: string;
  oauth_refresh_token?: string;
  is_active?: boolean;
}

export interface SenderProfileUpdate {
  name?: string;
  from_address?: string;
  auth_type?: string;
  from_name?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  oauth_client_id?: string;
  oauth_client_secret?: string;
  oauth_refresh_token?: string;
  is_active?: boolean;
}

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  sender_profile_id: number;
  email_template_id: number;
  phishlet_id?: number;
  attachment_id?: number;
  target_type: string;
  target_group_id?: number;
  target_individuals?: number[];
  scheduled_at?: string;
  status: string;
  is_active: boolean;
  is_admin: boolean;
  user_name: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreate {
  name: string;
  description?: string;
  sender_profile_id?: number;
  email_template_id?: number;
  phishlet_id?: number;
  select_preference?: string;
  attachment_id?: number;
  attachment_type?: string;
  selected_file?: File;
  target_type: string;
  target_group_id?: number;
  target_individuals?: number[];
  scheduled_at?: string;
  launch_now?: boolean;
}

export interface CampaignUpdate {
  name?: string;
  description?: string;
  sender_profile_id?: number;
  email_template_id?: number;
  phishlet_id?: number;
  attachment_id?: number;
  target_type?: string;
  target_group_id?: number;
  target_individuals?: number[];
  scheduled_at?: string;
  status?: string;
  is_active?: boolean;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  console.log("Request interceptor - URL:", config.url);
  console.log("Request interceptor - Token:", token ? "Present" : "Missing");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Request interceptor - Authorization header set");
  } else {
    console.log(
      "Request interceptor - No token found, request will be unauthorized"
    );
    // For debugging, log all cookies
    console.log("Request interceptor - All cookies:", document.cookie);
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(
      "Response interceptor - Success:",
      response.status,
      response.config.url
    );
    return response;
  },
  (error) => {
    console.log(
      "Response interceptor - Error:",
      error.response?.status,
      error.config?.url
    );
    console.log("Response interceptor - Error details:", error.response?.data);

    // If we get a 401 error, clear the token and redirect to login
    if (error.response?.status === 401) {
      console.log("Response interceptor - 401 error, clearing token");
      Cookies.remove("auth_token");
      Cookies.remove("user");

      // Only redirect if we're not already on the login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

async function fileToBytes(file: File) {
  const arrayBuffer = await file.arrayBuffer(); // read file into memory
  return new Uint8Array(arrayBuffer); // convert to byte array
}

export const authService = {
  async signup(data: SignupData): Promise<SignupResponse> {
    const response = await api.post("/signup", data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post("/login", data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    console.log(
      "getCurrentUser called - Token:",
      this.getToken() ? "Present" : "Missing"
    );
    const response = await api.get("/me");
    return response.data;
  },

  logout() {
    Cookies.remove("auth_token");
    Cookies.remove("user");
  },

  setToken(token: string) {
    console.log("setToken called with:", token.substring(0, 20) + "...");
    console.log("setToken - Full token length:", token.length);
    console.log("setToken - Setting cookie...");

    try {
      // Try different cookie options
      Cookies.set("auth_token", token, {
        expires: 1, // 1 day
        secure: false, // Allow HTTP in development
        sameSite: "lax",
        path: "/",
      });

      console.log("setToken - Cookie set, verifying...");
      const storedToken = Cookies.get("auth_token");
      console.log(
        "setToken - Stored token retrieved:",
        storedToken ? "Present" : "Missing"
      );
      if (storedToken) {
        console.log("setToken - Stored token length:", storedToken.length);
        console.log("setToken - Token matches:", storedToken === token);
      } else {
        console.error(
          "setToken - Failed to store token in cookie, trying alternative method"
        );
        // Fallback: try without options
        Cookies.set("auth_token", token);
        const fallbackToken = Cookies.get("auth_token");
        console.log(
          "setToken - Fallback token:",
          fallbackToken ? "Present" : "Missing"
        );
      }
    } catch (error) {
      console.error("setToken - Error setting cookie:", error);
    }
  },

  getToken(): string | undefined {
    const token = Cookies.get("auth_token");
    console.log("getToken called - Token:", token ? "Present" : "Missing");
    if (token) {
      console.log("getToken - Token length:", token.length);
    }
    return token;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export const targetsService = {
  async getTargets(groupId?: number): Promise<Target[]> {
    const params = groupId ? { group_id: groupId } : {};
    const response = await api.get("/targets", { params });
    return response.data;
  },

  async getTarget(targetId: number): Promise<Target> {
    const response = await api.get(`/targets/${targetId}`);
    return response.data;
  },

  async createTarget(data: TargetCreate): Promise<Target> {
    const response = await api.post("/targets", data);
    return response.data;
  },

  async updateTarget(targetId: number, data: TargetUpdate): Promise<Target> {
    const response = await api.put(`/targets/${targetId}`, data);
    return response.data;
  },

  async deleteTarget(targetId: number): Promise<void> {
    await api.delete(`/targets/${targetId}`);
  },

  async getTargetsCount(): Promise<number> {
    const targets = await this.getTargets();
    return targets.length;
  },
};

export const groupsService = {
  async getGroups(): Promise<Group[]> {
    const response = await api.get("/groups");
    return response.data;
  },

  async getGroup(groupId: number): Promise<Group> {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },

  async createGroup(data: GroupCreate): Promise<Group> {
    const response = await api.post("/groups", data);
    return response.data;
  },

  async updateGroup(groupId: number, data: GroupUpdate): Promise<Group> {
    const response = await api.put(`/groups/${groupId}`, data);
    return response.data;
  },

  async deleteGroup(groupId: number): Promise<void> {
    await api.delete(`/groups/${groupId}`);
  },
};

export const attachmentService = {
  async getAttachments(): Promise<AttachmentResponse[]> {
    const response = await api.get("/attachments");
    return response.data;
  },

  async getAttachment(attachmentId: number): Promise<AttachmentResponse> {
    const response = await api.get(`/attachments/${attachmentId}`);
    return response.data;
  },

  async createAttachment(data: AttachmentCreate): Promise<AttachmentResponse> {
    const formData = new FormData();
    formData.append("attachmentFile", data.attachmentFile);
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("isDemo", (data.isDemo ?? false).toString());

    const response = await api.post("/attachments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async updateAttachment(
    attachmentId: number,
    data: AttachmentUpdate
  ): Promise<AttachmentResponse> {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (typeof data.isDemo !== "undefined")
      formData.append("isDemo", data.isDemo.toString());

    const response = await api.put(`/attachments/${attachmentId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async deleteAttachment(attachmentId: number): Promise<void> {
    await api.delete(`/attachments/${attachmentId}`);
  },
  async download(id: number, name: string, file_type: string): Promise<void> {
    const response = await api.get(`/attachments/${id}/download`, {
      responseType: "blob",
    });
    const blob = response.data;
    console.log(blob);
    const contentType =
      response.headers["content-type"] || "application/octet-stream";

    // Extract filename from header
    const disposition = response.headers["content-disposition"];
    let filename = name;
    if (disposition && disposition.includes("filename=")) {
      filename = disposition.split("filename=")[1].replace(/['"]/g, "");
    }

    saveAs(new Blob([blob], { type: file_type }), filename);
  },

  async uploadAttachmentFile(
    file: File
  ): Promise<{ path: string; filename: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/attachments/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};

// export const attachmentService = {
//   async getAttachments(): Promise<AttachTemplate[]> {
//     const response = await api.get("/attachments");
//     return response.data;
//   },

//   async getAttachment(attachmentId: number): Promise<AttachTemplate> {
//     const response = await api.get(`/attachments/${attachmentId}`);
//     return response.data;
//   },

//   async createAttachment(
//     data: AttachTemplateCreate,
//     file?: File
//   ): Promise<AttachTemplate> {
//     if (file) {
//       const formData = new FormData();
//       formData.append("attachmentFile", file);
//       formData.append("name", data.name);
//       if (data.description) formData.append("description", data.description);
//       formData.append("isDemo", (data.isDemo ?? false).toString());
//       // if backend requires user_id, include it here; otherwise backend should use current user
//       const response = await api.post("/attachments", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       return response.data;
//     } else {
//       const response = await api.post("/attachments", data);
//       return response.data;
//     }
//   },

//   async updateAttachment(
//     attachmentId: number,
//     data: AttachTemplateUpdate,
//     file?: File
//   ): Promise<AttachTemplate> {
//     if (file) {
//       const formData = new FormData();
//       formData.append("file", file);
//       if (data.name) formData.append("name", data.name);
//       if (data.description) formData.append("description", data.description);
//       if (typeof data.isDemo !== "undefined")
//         formData.append("isDemo", data.isDemo.toString());
//       const response = await api.put(`/attachments/${attachmentId}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       return response.data;
//     } else {
//       const response = await api.put(`/attachments/${attachmentId}`, data);
//       return response.data;
//     }
//   },

//   async deleteAttachment(attachmentId: number): Promise<void> {
//     await api.delete(`/attachments/${attachmentId}`);
//   },

//   // optional helper to upload a file and get server path/metadata
//   async uploadAttachmentFile(
//     file: File
//   ): Promise<{ path: string; filename: string }> {
//     const formData = new FormData();
//     formData.append("file", file);
//     const response = await api.post("/attachments/upload", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return response.data;
//   },

//   // optional import endpoint if backend supports it
//   async importAttachment(
//     file: File,
//     meta?: { name?: string; description?: string; isDemo?: boolean }
//   ): Promise<AttachTemplate & { import_summary?: any }> {
//     const formData = new FormData();
//     formData.append("attachmentFile", file);
//     if (meta?.name) formData.append("name", meta.name);
//     if (meta?.description) formData.append("description", meta.description);
//     formData.append("isDemo", (meta?.isDemo ?? false).toString());
//     const response = await api.post("/attachments/import", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return response.data;
//   },
// };

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    // For now, we'll calculate stats from available data
    const totalTargets = await targetsService.getTargetsCount();

    return {
      total_targets: totalTargets,
      total_campaigns: 0, // TODO: Implement campaigns API
      active_campaigns: 0,
      total_templates: 0,
      total_phishlets: 0,
      total_sender_profiles: 0,
      total_emails_sent: 0,
      total_emails_opened: 0,
      total_clicks: 0,
      total_form_submissions: 0,
      success_rate: 0, // TODO: Implement campaigns API
      recent_activity_count: 0, // TODO: Implement activity tracking
    };
  },
};

export const userSettingsService = {
  async getUserProfile(): Promise<UserSettings> {
    const response = await api.get("/user-settings/profile");
    return response.data;
  },

  async updateUserProfile(data: UserProfileUpdate): Promise<UserSettings> {
    const response = await api.put("/user-settings/profile", data);
    return response.data;
  },

  async changePassword(data: PasswordChange): Promise<{ message: string }> {
    const response = await api.put("/user-settings/password", data);
    return response.data;
  },

  async getAISettings(): Promise<Omit<AISettings, "api_key">> {
    const response = await api.get("/user-settings/ai-settings");
    return response.data;
  },

  async updateAISettings(data: AISettings): Promise<UserSettings> {
    const response = await api.put("/user-settings/ai-settings", data);
    return response.data;
  },
};

export const emailTemplateService = {
  async getTemplates(): Promise<EmailTemplate[]> {
    const response = await api.get("/email-templates");
    return response.data;
  },
  async getAdminTemplates(): Promise<EmailTemplate[]> {
    const response = await api.get("/email-templates/admin");
    return response.data;
  },

  async getTemplate(templateId: number): Promise<EmailTemplate> {
    const response = await api.get(`/email-templates/${templateId}`);
    return response.data;
  },

  async createTemplate(data: EmailTemplateCreate): Promise<EmailTemplate> {
    const response = await api.post("/email-templates", data);
    return response.data;
  },

  async updateTemplate(
    templateId: number,
    data: EmailTemplateUpdate
  ): Promise<EmailTemplate> {
    const response = await api.put(`/email-templates/${templateId}`, data);
    return response.data;
  },

  async deleteTemplate(templateId: number): Promise<void> {
    await api.delete(`/email-templates/${templateId}`);
  },

  async generateAITemplate(
    data: AITemplateGenerateRequest
  ): Promise<EmailTemplate> {
    const response = await api.post("/email-templates/generate", data);
    return response.data;
  },

  async regenerateAITemplate(templateId: number): Promise<EmailTemplate> {
    const response = await api.post(
      `/email-templates/${templateId}/regenerate`
    );
    return response.data;
  },

  async importEMLTemplate(
    file: File,
    importData?: {
      name?: string;
      description?: string;
      template_type?: string;
      is_active?: boolean;
    }
  ): Promise<EmailTemplate & { import_summary?: any }> {
    const formData = new FormData();
    formData.append("eml_file", file);

    if (importData) {
      if (importData.name) formData.append("name", importData.name);
      if (importData.description)
        formData.append("description", importData.description);
      if (importData.template_type)
        formData.append("template_type", importData.template_type);
      formData.append("is_active", importData.is_active?.toString() || "true");
    }
    formData.append("isDemo", "false");

    const response = await api.post("/email-templates/import/eml", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export const phishletService = {
  async getPhishlets(): Promise<Phishlet[]> {
    const response = await api.get("/phishlets");
    return response.data;
  },

  async getPhishlet(phishletId: number): Promise<Phishlet> {
    const response = await api.get(`/phishlets/${phishletId}`);
    return response.data;
  },

  async createPhishlet(data: PhishletCreate): Promise<Phishlet> {
    const response = await api.post("/phishlets", data);
    return response.data;
  },

  async updatePhishlet(
    phishletId: number,
    data: PhishletUpdate
  ): Promise<Phishlet> {
    const response = await api.put(`/phishlets/${phishletId}`, data);
    return response.data;
  },

  async deletePhishlet(phishletId: number): Promise<void> {
    await api.delete(`/phishlets/${phishletId}`);
  },

  async cloneWebsite(data: PhishletCloneRequest): Promise<Phishlet> {
    const response = await api.post("/phishlets/clone", data);
    return response.data;
  },

  async getPhishletContent(phishletId: number): Promise<{
    html: string;
    css: string;
    js: string;
    form_fields: Array<any>;
  }> {
    const response = await api.get(`/phishlets/${phishletId}/content`);
    return response.data;
  },

  async uploadHtmlFile(file: File): Promise<{
    html_content: string;
    form_fields: Array<any>;
    filename: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/phishlets/upload-html", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async previewPhishlet(data: {
    html_content: string;
    original_url: string;
  }): Promise<{
    html_content: string;
    form_fields: Array<any>;
    original_url: string;
  }> {
    const response = await api.post("/phishlets/preview", data);
    return response.data;
  },

  async savePhishlet(data: {
    name: string;
    description?: string;
    original_url: string;
    html_content: string;
    capture_credentials: boolean;
    capture_other_data: boolean;
    redirect_url?: string;
    is_active: boolean;
  }): Promise<Phishlet> {
    const response = await api.post("/phishlets/save", data);
    return response.data;
  },

  async cloneWebsitePreview(url: string): Promise<{
    html_content: string;
    form_fields: Array<any>;
    original_url: string;
  }> {
    const formData = new FormData();
    formData.append("url", url);
    const response = await api.post("/phishlets/clone-preview", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export const senderProfileService = {
  async getProfiles(): Promise<SenderProfile[]> {
    const response = await api.get("/sender-profiles");
    return response.data;
  },

  async getProfile(profileId: number): Promise<SenderProfile> {
    const response = await api.get(`/sender-profiles/${profileId}`);
    return response.data;
  },

  async createProfile(data: SenderProfileCreate): Promise<SenderProfile> {
    const response = await api.post("/sender-profiles", data);
    return response.data;
  },

  async updateProfile(
    profileId: number,
    data: SenderProfileUpdate
  ): Promise<SenderProfile> {
    const response = await api.put(`/sender-profiles/${profileId}`, data);
    return response.data;
  },

  async deleteProfile(profileId: number): Promise<void> {
    await api.delete(`/sender-profiles/${profileId}`);
  },
};

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get("/analytics/dashboard");
    return response.data;
  },

  async getCampaignStats(): Promise<CampaignStats[]> {
    const response = await api.get("/analytics/campaigns");
    return response.data;
  },

  async getCampaignDetailStats(campaignId: number): Promise<any> {
    const response = await api.get(`/analytics/campaigns/${campaignId}`);
    return response.data;
  },

  async getActivityLog(
    limit?: number,
    offset?: number
  ): Promise<ActivityLog[]> {
    const params = { limit, offset };
    const response = await api.get("/analytics/activity", { params });
    return response.data;
  },

  async getTargetPerformance(): Promise<TargetPerformance[]> {
    const response = await api.get("/analytics/targets/performance");
    return response.data;
  },

  async getTimeSeriesData(days?: number): Promise<TimeSeriesData[]> {
    const params = { days };
    const response = await api.get("/analytics/timeseries", { params });
    return response.data;
  },
};

export const campaignService = {
  async getCampaigns(): Promise<Campaign[]> {
    const response = await api.get("/campaigns");
    return response.data;
  },

  async getCampaign(campaignId: number): Promise<Campaign> {
    const response = await api.get(`/campaigns/${campaignId}`);
    return response.data;
  },

  async createCampaign(data: CampaignCreate): Promise<Campaign> {
    const response = await api.post("/campaigns", data);
    return response.data;
  },

  async updateCampaign(
    campaignId: number,
    data: CampaignUpdate
  ): Promise<Campaign> {
    const response = await api.put(`/campaigns/${campaignId}`, data);
    return response.data;
  },

  async deleteCampaign(campaignId: number): Promise<void> {
    await api.delete(`/campaigns/${campaignId}`);
  },

  async runCampaign(campaignId: number): Promise<void> {
    await api.post(`/campaigns/${campaignId}/run`);
  },

  async pauseCampaign(campaignId: number): Promise<void> {
    await api.post(`/campaigns/${campaignId}/pause`);
  },

  async getCampaignResults(campaignId: number): Promise<any[]> {
    const response = await api.get(`/campaigns/${campaignId}/results`);
    return response.data;
  },
};
