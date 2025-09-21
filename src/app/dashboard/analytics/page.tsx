'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  BarChart3, 
  Users, 
  Mail, 
  Target, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  Eye,
  MousePointer,
  FileText,
  Calendar,
  Clock,
  Globe
} from 'lucide-react';
import { 
  analyticsService, 
  DashboardStats, 
  CampaignStats, 
  ActivityLog, 
  TargetPerformance, 
  TimeSeriesData 
} from '@/lib/auth';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStats[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [targetPerformance, setTargetPerformance] = useState<TargetPerformance[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [
        stats,
        campaigns,
        activities,
        targets,
        timeSeries
      ] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getCampaignStats(),
        analyticsService.getActivityLog(20),
        analyticsService.getTargetPerformance(),
        analyticsService.getTimeSeriesData(parseInt(timeRange))
      ]);

      setDashboardStats(stats);
      setCampaignStats(campaigns);
      setActivityLog(activities);
      setTargetPerformance(targets);
      setTimeSeriesData(timeSeries);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'text-red-600 dark:text-red-400';
    if (riskScore >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your security awareness campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">Time Range:</span>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      {dashboardStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">Total Campaigns</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{dashboardStats.total_campaigns}</div>
              <p className="text-xs text-muted-foreground font-mono">
                {dashboardStats.active_campaigns} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">Total Targets</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{dashboardStats.total_targets}</div>
              <p className="text-xs text-muted-foreground font-mono">
                Across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{dashboardStats.total_emails_sent}</div>
              <p className="text-xs text-muted-foreground font-mono">
                {dashboardStats.total_emails_opened} opened ({dashboardStats.total_emails_sent > 0 ? Math.round((dashboardStats.total_emails_opened / dashboardStats.total_emails_sent) * 100) : 0}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{dashboardStats.success_rate}%</div>
              <p className="text-xs text-muted-foreground font-mono">
                {dashboardStats.total_form_submissions} submissions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="targets">Target Risk Analysis</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Campaign Performance</CardTitle>
              <CardDescription>
                Detailed statistics for all your campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">Campaign</TableHead>
                    <TableHead className="font-mono">Status</TableHead>
                    <TableHead className="font-mono">Targets</TableHead>
                    <TableHead className="font-mono">Sent</TableHead>
                    <TableHead className="font-mono">Opened</TableHead>
                    <TableHead className="font-mono">Clicks</TableHead>
                    <TableHead className="font-mono">Submissions</TableHead>
                    <TableHead className="font-mono">Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignStats.map((campaign) => (
                    <TableRow key={campaign.campaign_id}>
                      <TableCell className="font-mono">{campaign.campaign_name}</TableCell>
                      <TableCell>
                        <Badge className={`font-mono ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{campaign.total_targets}</TableCell>
                      <TableCell className="font-mono">{campaign.emails_sent}</TableCell>
                      <TableCell className="font-mono">{campaign.emails_opened}</TableCell>
                      <TableCell className="font-mono">{campaign.clicks}</TableCell>
                      <TableCell className="font-mono">{campaign.form_submissions}</TableCell>
                      <TableCell className="font-mono">{campaign.success_rate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Target Risk Analysis</CardTitle>
              <CardDescription>
                Risk assessment for all targets based on their behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono">Target</TableHead>
                    <TableHead className="font-mono">Email</TableHead>
                    <TableHead className="font-mono">Campaigns</TableHead>
                    <TableHead className="font-mono">Emails</TableHead>
                    <TableHead className="font-mono">Opened</TableHead>
                    <TableHead className="font-mono">Clicks</TableHead>
                    <TableHead className="font-mono">Submissions</TableHead>
                    <TableHead className="font-mono">Risk Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {targetPerformance.map((target) => (
                    <TableRow key={target.target_id}>
                      <TableCell className="font-mono">{target.target_name}</TableCell>
                      <TableCell className="font-mono">{target.target_email}</TableCell>
                      <TableCell className="font-mono">{target.campaigns_participated}</TableCell>
                      <TableCell className="font-mono">{target.emails_received}</TableCell>
                      <TableCell className="font-mono">{target.emails_opened}</TableCell>
                      <TableCell className="font-mono">{target.clicks}</TableCell>
                      <TableCell className="font-mono">{target.form_submissions}</TableCell>
                      <TableCell>
                        <span className={`font-mono font-bold ${getRiskColor(target.risk_score)}`}>
                          {target.risk_score}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Recent Activity</CardTitle>
              <CardDescription>
                Latest activities and events in your account
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col" style={{maxHeight: 'calc(100vh - 320px)'}}>
              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.activity_type.includes('campaign') && <BarChart3 className="h-5 w-5 text-muted-foreground" />}
                      {activity.activity_type.includes('target') && <Target className="h-5 w-5 text-muted-foreground" />}
                      {activity.activity_type.includes('template') && <FileText className="h-5 w-5 text-muted-foreground" />}
                      {activity.activity_type.includes('phishlet') && <Globe className="h-5 w-5 text-muted-foreground" />}
                      {activity.activity_type.includes('sender_profile') && <Mail className="h-5 w-5 text-muted-foreground" />}
                      {activity.activity_type.includes('group') && <Users className="h-5 w-5 text-muted-foreground" />}
                      {activity.activity_type.includes('login') && <Activity className="h-5 w-5 text-muted-foreground" />}
                      {!activity.activity_type.includes('campaign') && 
                       !activity.activity_type.includes('target') && 
                       !activity.activity_type.includes('template') && 
                       !activity.activity_type.includes('phishlet') && 
                       !activity.activity_type.includes('sender_profile') && 
                       !activity.activity_type.includes('group') && 
                       !activity.activity_type.includes('login') && 
                       <Activity className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-mono">{activity.description}</p>
                      {activity.resource_name && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Resource: {activity.resource_name}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-muted-foreground font-mono">
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Email Activity Trends</CardTitle>
              <CardDescription>
                Email performance over the last {timeRange} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeSeriesData.map((data) => (
                  <div key={data.date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{data.date}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm font-mono font-medium">{data.emails_sent}</div>
                        <div className="text-xs text-muted-foreground font-mono">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-mono font-medium">{data.emails_opened}</div>
                        <div className="text-xs text-muted-foreground font-mono">Opened</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-mono font-medium">{data.clicks}</div>
                        <div className="text-xs text-muted-foreground font-mono">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-mono font-medium">{data.form_submissions}</div>
                        <div className="text-xs text-muted-foreground font-mono">Submissions</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
