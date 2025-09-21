'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Upload, 
  Code, 
  Globe, 
  Eye, 
  Save, 
  ArrowLeft, 
  FileText, 
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { phishletService } from '@/lib/auth';
import Link from 'next/link';
import Editor from '@monaco-editor/react';

interface FormField {
  type: string;
  name: string;
  id: string;
  placeholder: string;
  required: boolean;
  form_action: string;
  form_method: string;
}

export default function CreatePhishletPage() {
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'edit'>('input');
  const [loading, setLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [phishletForm, setPhishletForm] = useState({
    name: '',
    description: '',
    original_url: '',
    capture_credentials: true,
    capture_other_data: true,
    redirect_url: '',
    is_active: true
  });

  // Content states
  const [htmlContent, setHtmlContent] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [inputMethod, setInputMethod] = useState<'file' | 'code' | 'clone'>('file');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.html')) {
      toast.error('Please select an HTML file');
      return;
    }

    setLoading(true);
    try {
      const result = await phishletService.uploadHtmlFile(file);
      setHtmlContent(result.html_content);
      setFormFields(result.form_fields);
      setPhishletForm(prev => ({ ...prev, original_url: `file://${file.name}` }));
      setInputMethod('file');
      toast.success('HTML file uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload HTML file');
    } finally {
      setLoading(false);
    }
  };

  const handleCodePaste = () => {
    setInputMethod('code');
    setHtmlContent('');
    setFormFields([]);
  };

  const handleCloneWebsite = async () => {
    if (!phishletForm.original_url) {
      toast.error('Please enter a website URL');
      return;
    }

    setCloning(true);
    try {
      const result = await phishletService.cloneWebsitePreview(phishletForm.original_url);
      setHtmlContent(result.html_content);
      setFormFields(result.form_fields);
      setInputMethod('clone');
      
      toast.success('Website cloned successfully - all resources will point to original website');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to clone website');
    } finally {
      setCloning(false);
    }
  };

  const handlePreview = async () => {
    if (!htmlContent.trim()) {
      toast.error('Please provide HTML content');
      return;
    }

    if (!phishletForm.name.trim()) {
      toast.error('Please enter a phishlet name');
      return;
    }

    setLoading(true);
    try {
      const result = await phishletService.previewPhishlet({
        html_content: htmlContent,
        original_url: phishletForm.original_url || 'preview'
      });
      
      setFormFields(result.form_fields);
      setCurrentStep('preview');
      toast.success('Preview generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setCurrentStep('edit');
  };

  const handleSave = async () => {
    if (!phishletForm.name.trim()) {
      toast.error('Please enter a phishlet name');
      return;
    }

    setLoading(true);
    try {
      await phishletService.savePhishlet({
        name: phishletForm.name,
        description: phishletForm.description,
        original_url: phishletForm.original_url || 'custom',
        html_content: htmlContent,
        capture_credentials: phishletForm.capture_credentials,
        capture_other_data: phishletForm.capture_other_data,
        redirect_url: phishletForm.redirect_url || undefined,
        is_active: phishletForm.is_active
      });
      
      toast.success('Phishlet saved successfully');
      // Redirect to phishlets list
      window.location.href = '/dashboard/phishlets';
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save phishlet');
    } finally {
      setLoading(false);
    }
  };

  const renderInputStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Phishlet Name *</Label>
          <Input
            id="name"
            value={phishletForm.name}
            onChange={(e) => setPhishletForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter phishlet name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="original_url">Original URL</Label>
          <Input
            id="original_url"
            type="url"
            value={phishletForm.original_url}
            onChange={(e) => setPhishletForm(prev => ({ ...prev, original_url: e.target.value }))}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={phishletForm.description}
          onChange={(e) => setPhishletForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter phishlet description"
          rows={2}
        />
      </div>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file" onClick={() => setInputMethod('file')}>
            <Upload className="mr-2 h-4 w-4" />
            Upload HTML
          </TabsTrigger>
          <TabsTrigger value="code" onClick={() => setInputMethod('code')}>
            <Code className="mr-2 h-4 w-4" />
            Paste Code
          </TabsTrigger>
          <TabsTrigger value="clone" onClick={() => setInputMethod('clone')}>
            <Globe className="mr-2 h-4 w-4" />
            Clone Website
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload HTML File</CardTitle>
              <CardDescription>
                Upload an HTML file to create your phishlet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-4">
                  Click to upload or drag and drop an HTML file
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Choose File'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paste HTML Code</CardTitle>
              <CardDescription>
                Paste your HTML code directly into the editor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="html_code">HTML Code *</Label>
                <div className="border rounded-md overflow-hidden">
                  <Editor
                    height="300px"
                    defaultLanguage="html"
                    value={htmlContent}
                    onChange={(value) => setHtmlContent(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clone Website</CardTitle>
              <CardDescription>
                Clone an existing website to create your phishlet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clone_url">Website URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="clone_url"
                    type="url"
                    value={phishletForm.original_url}
                    onChange={(e) => setPhishletForm(prev => ({ ...prev, original_url: e.target.value }))}
                    placeholder="https://example.com"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCloneWebsite}
                    disabled={cloning || !phishletForm.original_url}
                  >
                    {cloning ? 'Cloning...' : 'Clone'}
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {htmlContent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Content Preview</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Code className="mr-2 h-4 w-4" />
                Edit Code
              </Button>
              <Button onClick={handlePreview}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>

          {formFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detected Form Fields</CardTitle>
                <CardDescription>
                  {formFields.length} form field(s) detected in your HTML
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {formFields.map((field, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded border">
                      <div className="font-medium">{field.name || field.id || `Field ${index + 1}`}</div>
                      <div className="text-sm text-gray-600">
                        Type: {field.type} | Required: {field.required ? 'Yes' : 'No'}
                        {field.placeholder && ` | Placeholder: ${field.placeholder}`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="redirect_url">Redirect URL (Optional)</Label>
          <Input
            id="redirect_url"
            type="url"
            value={phishletForm.redirect_url}
            onChange={(e) => setPhishletForm(prev => ({ ...prev, redirect_url: e.target.value }))}
            placeholder="https://example.com/redirect"
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="capture_credentials"
              checked={phishletForm.capture_credentials}
              onCheckedChange={(checked: boolean) => setPhishletForm(prev => ({ ...prev, capture_credentials: checked }))}
            />
            <Label htmlFor="capture_credentials">Capture Credentials</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="capture_other_data"
              checked={phishletForm.capture_other_data}
              onCheckedChange={(checked: boolean) => setPhishletForm(prev => ({ ...prev, capture_other_data: checked }))}
            />
            <Label htmlFor="capture_other_data">Capture Other Form Data</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={phishletForm.is_active}
              onCheckedChange={(checked: boolean) => setPhishletForm(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Preview Phishlet</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('input')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Code className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Phishlet'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phishlet Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-sm text-muted-foreground">{phishletForm.name}</p>
            </div>
            {phishletForm.description && (
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground">{phishletForm.description}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Original URL</Label>
              <p className="text-sm text-muted-foreground">{phishletForm.original_url || 'Custom HTML'}</p>
            </div>
            {phishletForm.redirect_url && (
              <div>
                <Label className="text-sm font-medium">Redirect URL</Label>
                <p className="text-sm text-muted-foreground">{phishletForm.redirect_url}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Settings</Label>
              <div className="flex gap-2 mt-1">
                <Badge variant={phishletForm.capture_credentials ? "default" : "secondary"}>
                  {phishletForm.capture_credentials ? 'Credentials' : 'No Credentials'}
                </Badge>
                <Badge variant={phishletForm.capture_other_data ? "default" : "secondary"}>
                  {phishletForm.capture_other_data ? 'Form Data' : 'No Form Data'}
                </Badge>
                <Badge variant={phishletForm.is_active ? "default" : "secondary"}>
                  {phishletForm.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form Fields ({formFields.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {formFields.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {formFields.map((field, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="font-medium">{field.name || field.id || `Field ${index + 1}`}</div>
                    <div className="text-sm text-gray-600">
                      Type: {field.type} | Required: {field.required ? 'Yes' : 'No'}
                      {field.placeholder && ` | Placeholder: ${field.placeholder}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Form: {field.form_method.toUpperCase()} {field.form_action || '/'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No form fields detected</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HTML Preview</CardTitle>
          <CardDescription>
            Live preview of your HTML content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                  </style>
                </head>
                <body>
                  ${htmlContent}
                </body>
                </html>
              `}
              className="w-full h-96 border-0"
              title="HTML Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEditStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Edit Code</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentStep('preview')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Preview
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Phishlet'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit_html">HTML Code</Label>
          <div className="border rounded-md overflow-hidden">
            <Editor
              height="500px"
              defaultLanguage="html"
              value={htmlContent}
              onChange={(value) => setHtmlContent(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Phishlet</h1>
          <p className="text-muted-foreground">
            Create a new phishlet by uploading HTML, pasting code, or cloning a website.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/phishlets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Phishlets
          </Link>
        </Button>
      </div>

      {currentStep === 'input' && renderInputStep()}
      {currentStep === 'preview' && renderPreviewStep()}
      {currentStep === 'edit' && renderEditStep()}
    </div>
  );
}
