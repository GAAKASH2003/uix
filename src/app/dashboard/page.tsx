"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Users,
  BarChart3,
  Activity,
  Mail,
  Target,
  FileText,
  Globe,
} from "lucide-react";
import { analyticsService, DashboardStats, ActivityLog } from "@/lib/auth";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, activities] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getActivityLog(7), // Get last 7 activities
        ]);
        setStats(dashboardStats);
        setRecentActivities(activities);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActivityIcon = (activityType: string) => {
    if (activityType.includes("campaign")) return Shield;
    if (activityType.includes("target")) return Target;
    if (activityType.includes("template")) return FileText;
    if (activityType.includes("phishlet")) return Globe;
    if (activityType.includes("sender_profile")) return Mail;
    if (activityType.includes("group")) return Users;
    if (activityType.includes("login")) return Activity;
    return Activity;
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const statsData = [
    {
      title: "Total Campaigns",
      value: stats?.total_campaigns.toString() || "0",
      description: "Active phishing campaigns",
      icon: Shield,
    },
    {
      title: "Total Employees",
      value: stats?.total_targets.toString() || "0",
      description: "Employees in your organization",
      icon: Users,
    },
    {
      title: "Success Rate",
      value: `${stats?.success_rate || 0}%`,
      description: "Average click rate",
      icon: BarChart3,
    },
    {
      title: "Recent Activity",
      value: stats?.recent_activity_count.toString() || "0",
      description: "Events in last 7 days",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
          Welcome back, {user?.full_name || user?.username}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-mono">
          Here's what's happening with your security awareness campaigns.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-mono">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{stat.value}</div>
              <p className="text-xs text-muted-foreground font-mono">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Quick Actions</CardTitle>
            <CardDescription className="font-mono">
              Get started with your first security awareness campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 h-[420px] overflow-y-auto pr-1">
            <div className="space-y-2">
              <h4 className="text-sm font-medium font-mono">
                Create Your First Campaign
              </h4>
              <p className="text-sm text-muted-foreground font-mono">
                Set up a phishing simulation to test your organization's
                security awareness.
              </p>
              <Button asChild size="sm" className="font-mono">
                <Link
                  href={{
                    pathname: "/dashboard/campaigns",
                    query: { openModal: "true" },
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Create Campaign
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium font-mono">Add Users</h4>
              <p className="text-sm text-muted-foreground font-mono">
                Import users from CSV or add them manually to your organization.
              </p>
              <Button asChild size="sm" className="font-mono">
                <Link
                  href={{
                    pathname: "/dashboard/employees",
                    query: { openModal: "true" },
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Employees
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium font-mono">
                Create Email Template
              </h4>
              <p className="text-sm text-muted-foreground font-mono">
                Design compelling phishing emails for your campaigns.
              </p>
              <Button asChild size="sm" className="font-mono">
                <Link
                  href={{
                    pathname: "/dashboard/email-templates",
                    query: { openModal: "true" },
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Create Template
                </Link>
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium font-mono">Clone Website</h4>
              <p className="text-sm text-muted-foreground font-mono">
                Create phishing pages by cloning real websites.
              </p>
              <Button asChild size="sm" className="font-mono">
                <Link
                  href={{
                    pathname: "/dashboard/phishlets",
                    query: { openModal: "true" },
                  }}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Create Phishlet
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Recent Activity</CardTitle>
            <CardDescription className="font-mono">
              Latest events and activities
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[420px] flex flex-col">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground font-mono">
                  Loading...
                </p>
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {recentActivities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.activity_type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium font-mono text-foreground">
                          {activity.description}
                        </p>
                        {activity.resource_name && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {activity.resource_name}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-xs text-muted-foreground font-mono">
                          {formatActivityTime(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground font-mono">
                  No recent activity to display
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
