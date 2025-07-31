"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  UsersIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  FireIcon,
  ArrowPathIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
  LockClosedIcon,
  CogIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  FaceSmileIcon,
  FaceFrownIcon,
} from "@heroicons/react/24/solid";
import Button from '@/components/Button';
import Input from '@/components/Input';
import Card from '@/components/Card';
import Avatar from '@/components/Avatar';
import { logout } from '@/api/auth';
import { fetchUserOverdueFollowup } from '@/api/followups';
import { fetchLeadsByUser, Lead } from '@/api/leads';
import { fetchCustomers } from '@/api/customers';

// Types for dashboard data
interface DashboardData {
  leadsToday: number;
  leadsThisMonth: number;
  totalLeads: number;
  customers: number;
  leadStatus: {
    afterVisit: number;
    beforeVisit: number;
    rawData: number;
    unrated: number;
    untouched: number;
    ongoing: number;
    qualified: number;
  };
  leadSources: {
    source: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  conversionsByUser: {
    user: string;
    conversions: number;
    color: string;
  }[];
  lostLeadsAnalysis: {
    reason: string;
    count: number;
    color: string;
  }[];
  recentActivity: {
    id: number;
    type: string;
    user: string;
    action: string;
    time: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

// Animated KPI numbers
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = 0;
    const end = value;
    if (start === end) return;
    const increment = end / 40;
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>
}

// Modern KPI Card Component
function KPICard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color = "yellow",
  className = "" 
}: {
  title: string;
  value: number;
  change?: string;
  changeType?: "up" | "down";
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  className?: string;
}) {
  const colorClasses = {
    yellow: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800",
    green: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-800",
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-800",
    red: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-800",
    orange: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-800",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-800",
  };

  return (
    <Card className={`${colorClasses[color as keyof typeof colorClasses]} ${className} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6 opacity-80" />}
          <h3 className="font-semibold text-sm opacity-90">{title}</h3>
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            changeType === "up" ? "text-green-600" : "text-red-600"
          }`}>
            {changeType === "up" ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">
        <AnimatedNumber value={value} />
      </div>
    </Card>
  );
}

// Modern Status Card Component
function StatusCard({ 
  title, 
  value, 
  icon: Icon, 
  color = "yellow",
  subtitle = "",
  className = "" 
}: {
  title: string;
  value: number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  subtitle?: string;
  className?: string;
}) {
  const colorClasses = {
    yellow: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-800",
    green: "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-800",
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-800",
    red: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-800",
    orange: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-800",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-800",
    pink: "bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 text-pink-800",
  };

  return (
    <Card className={`${colorClasses[color as keyof typeof colorClasses]} ${className} p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-2 text-center`}>
      <div className="flex flex-col items-center gap-2">
        {Icon && <Icon className="w-8 h-8 opacity-80" />}
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs font-medium opacity-90">{title}</div>
        {subtitle && <div className="text-xs opacity-70">{subtitle}</div>}
      </div>
    </Card>
  );
}

export default function HomeScreen() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [overdueCount, setOverdueCount] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    leadsToday: 0,
    leadsThisMonth: 0,
    totalLeads: 0,
    customers: 0,
    leadStatus: {
      afterVisit: 0,
      beforeVisit: 0,
      rawData: 0,
      unrated: 0,
      untouched: 0,
      ongoing: 0,
      qualified: 0,
    },
    leadSources: [],
    conversionsByUser: [],
    lostLeadsAnalysis: [],
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user info from localStorage
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName") || "";
    const storedUserPhone = localStorage.getItem("userPhone") || "";
    
    console.log('🔍 Debug - Stored user name:', storedUserName);
    console.log('🔍 Debug - Stored user phone:', storedUserPhone);
    
    setUserName(storedUserName);
    setUserPhone(storedUserPhone);
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔍 Debug - Fetching dashboard data...');
        
        // Fetch all required data in parallel
        const [leads, customers, overdueFollowups] = await Promise.all([
          fetchLeadsByUser(),
          fetchCustomers(),
          fetchUserOverdueFollowup()
        ]);

        console.log('🔍 Debug - Fetched data:', { 
          leadsCount: leads.length, 
          customersCount: customers.length,
          overdueCount: overdueFollowups.length 
        });

        // Calculate leads today
        const today = new Date();
        const leadsToday = leads.filter((lead: Lead) => {
          if (!lead.created_at) return false;
          const leadDate = new Date(lead.created_at);
          return leadDate.toDateString() === today.toDateString();
        }).length;

        // Calculate leads this month
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const leadsThisMonth = leads.filter((lead: Lead) => {
          if (!lead.created_at) return false;
          const leadDate = new Date(lead.created_at);
          return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
        }).length;

        // Calculate lead status counts
        const leadStatus = {
          afterVisit: leads.filter((lead: Lead) => lead.lead_type === 'After Visit').length,
          beforeVisit: leads.filter((lead: Lead) => lead.lead_type === 'Before Visit').length,
          rawData: leads.filter((lead: Lead) => lead.lead_type === 'Raw Data').length,
          unrated: leads.filter((lead: Lead) => lead.lead_type === 'Unrated').length,
          untouched: leads.filter((lead: Lead) => lead.lead_type === 'Untouched').length,
          ongoing: leads.filter((lead: Lead) => lead.lead_type === 'Ongoing').length,
          qualified: leads.filter((lead: Lead) => lead.lead_type === 'Qualified').length,
        };

        // Calculate lead sources
        const sourceCounts: { [key: string]: number } = {};
        leads.forEach(lead => {
          if (lead.source) {
            sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
          }
        });

        const totalLeadsWithSource = Object.values(sourceCounts).reduce((sum, count) => sum + count, 0);
        const leadSources = Object.entries(sourceCounts).map(([source, count], index) => {
          const colors = ['bg-orange-400', 'bg-yellow-400', 'bg-yellow-500', 'bg-yellow-300', 'bg-green-400', 'bg-orange-300'];
          return {
            source,
            count,
            percentage: totalLeadsWithSource > 0 ? Math.round((count / totalLeadsWithSource) * 100) : 0,
            color: colors[index % colors.length]
          };
        });

        // Calculate conversions by user (simplified - you may need to adjust based on your conversion logic)
        const userCounts: { [key: string]: number } = {};
        leads.forEach(lead => {
          if (lead.assign_to) {
            const userName = lead.assign_to;
            userCounts[userName] = (userCounts[userName] || 0) + 1;
          }
        });

        const conversionsByUser = Object.entries(userCounts).map(([user, conversions]) => ({
          user,
          conversions,
          color: conversions > 0 ? 'text-green-600' : 'text-gray-500'
        }));

        // Calculate lost leads analysis based on lead status and remarks
        const lostLeadsReasons: { [key: string]: number } = {};
        leads.forEach(lead => {
          // Check if lead is marked as lost or has specific status
          if (lead.lead_type === 'Lost' || lead.lead_type === 'Rejected') {
            // Analyze remarks to determine reason
            const remarks = (lead.remarks || '').toLowerCase();
            if (remarks.includes('competitor') || remarks.includes('chose competitor')) {
              lostLeadsReasons['Chose competitor'] = (lostLeadsReasons['Chose competitor'] || 0) + 1;
            } else if (remarks.includes('not interested') || remarks.includes('not interested')) {
              lostLeadsReasons['Not interested'] = (lostLeadsReasons['Not interested'] || 0) + 1;
            } else if (remarks.includes('unresponsive') || remarks.includes('no response')) {
              lostLeadsReasons['Unresponsive'] = (lostLeadsReasons['Unresponsive'] || 0) + 1;
            } else if (remarks.includes('no decision') || remarks.includes('decision authority')) {
              lostLeadsReasons['No decision authority'] = (lostLeadsReasons['No decision authority'] || 0) + 1;
            } else if (remarks.includes('requirements changed') || remarks.includes('scope changed')) {
              lostLeadsReasons['Requirements changed'] = (lostLeadsReasons['Requirements changed'] || 0) + 1;
            } else if (remarks.includes('budget') || remarks.includes('cost')) {
              lostLeadsReasons['Budget constraints'] = (lostLeadsReasons['Budget constraints'] || 0) + 1;
            } else {
              // Default category for lost leads
              lostLeadsReasons['Other'] = (lostLeadsReasons['Other'] || 0) + 1;
            }
          }
        });

        const colorMap = {
          'Chose competitor': 'bg-pink-100 text-pink-800',
          'Not interested': 'bg-green-100 text-green-800',
          'Unresponsive': 'bg-blue-100 text-blue-800',
          'No decision authority': 'bg-purple-100 text-purple-800',
          'Requirements changed': 'bg-green-100 text-green-800',
          'Budget constraints': 'bg-yellow-100 text-yellow-800',
          'Other': 'bg-gray-100 text-gray-800'
        };

        const lostLeadsAnalysis = Object.entries(lostLeadsReasons).map(([reason, count]) => ({
          reason,
          count,
          color: colorMap[reason as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
        }));

        // If no lost leads data, show some default data
        if (lostLeadsAnalysis.length === 0) {
          lostLeadsAnalysis.push(
            { reason: "Chose competitor", count: 0, color: "bg-pink-100 text-pink-800" },
            { reason: "Not interested", count: 0, color: "bg-green-100 text-green-800" },
            { reason: "Unresponsive", count: 0, color: "bg-blue-100 text-blue-800" },
            { reason: "No decision authority", count: 0, color: "bg-purple-100 text-purple-800" },
            { reason: "Requirements changed", count: 0, color: "bg-green-100 text-green-800" },
            { reason: "Budget constraints", count: 0, color: "bg-yellow-100 text-yellow-800" }
          );
        }

        // Create dynamic recent activity based on actual lead data
        const recentActivity: Array<{
          id: number;
          type: string;
          user: string;
          action: string;
          time: string;
          icon: React.ComponentType<{ className?: string }>;
        }> = [];
        const now = new Date();
        
        // Add recent leads as activity
        const recentLeads = leads
          .filter(lead => lead.created_at)
          .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
          .slice(0, 3);

        recentLeads.forEach((lead, index) => {
          const leadDate = new Date(lead.created_at!);
          const timeDiff = now.getTime() - leadDate.getTime();
          const minutes = Math.floor(timeDiff / (1000 * 60));
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          
          let timeAgo = '';
          if (minutes < 60) {
            timeAgo = `${minutes} min ago`;
          } else if (hours < 24) {
            timeAgo = `${hours} hr ago`;
          } else {
            timeAgo = `${Math.floor(hours / 24)} days ago`;
          }

          recentActivity.push({
            id: index + 1,
            type: "lead",
            user: lead.created_by || "User",
            action: `added a new lead: ${lead.name}`,
            time: timeAgo,
            icon: UserIcon
          });
        });

        setDashboardData({
          leadsToday,
          leadsThisMonth,
          totalLeads: leads.length,
          customers: customers.length,
          leadStatus,
          leadSources,
          conversionsByUser,
          lostLeadsAnalysis,
          recentActivity,
        });

        setOverdueCount(overdueFollowups.length);
        
        console.log('🔍 Debug - Dashboard data calculated:', {
          leadsToday,
          leadsThisMonth,
          totalLeads: leads.length,
          customers: customers.length,
          leadStatus,
          leadSources: leadSources.length,
          conversionsByUser: conversionsByUser.length
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const router = useRouter();

  async function handleLogout() {
    try {
      const user_id = localStorage.getItem("user_id");
      if (user_id) {
        await logout(user_id);
      }
    } catch (err) {
      console.error("Logout error:", err);
      // Continue with logout even if API call fails
    } finally {
      // Clear localStorage and redirect regardless of API success
      localStorage.clear();
      router.push("/login");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-yellow-200/50 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-4 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-white">
                  <path fill="currentColor" d="M12 2L2 7v10l10 5 10-5V7l-10-5zM12 4.5L20 9v6l-8 4.5V4.5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Timber Group</h1>
                <p className="text-sm text-gray-600">CRM Dashboard</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 w-full max-w-full md:max-w-md mx-0 md:mx-8 my-2 md:my-0">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search leads, customers, orders..."
                  className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-200 focus:border-yellow-300 transition-all duration-200"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto justify-end">
              {/* Notifications */}
              <button className="relative p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-200">
                <BellIcon className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </button>

              {/* Overdue Followups Alert */}
              {overdueCount > 0 && (
                <button 
                  onClick={() => router.push('/homescreen/followup/overdue')}
                  className="relative flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 transition-all duration-200"
                >
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{overdueCount}</span>
                  <span className="text-xs">overdue</span>
                </button>
              )}

              {/* Profile Menu */}
              <div className="relative">
                <Avatar
                  name={userName}
                  size="md"
                  showTooltip={true}
                  onClick={() => setProfileOpen((v) => !v)}
                  className="cursor-pointer"
                />
                {profileOpen && (
                  <div
                    ref={profileRef}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-4 animate-fade-in"
                  >
                    <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-100">
                      <Avatar
                        name={userName}
                        size="xl"
                        showTooltip={true}
                      />
                      <div className="text-center">
                        <div className="font-bold text-gray-900 text-lg">{userName || "User"}</div>
                        <div className="text-gray-500 text-sm">{userPhone || "No phone"}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 mt-4 px-4">
                      <button className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-yellow-700 hover:bg-yellow-50 rounded-xl transition-all duration-200 font-medium">
                        <UserIcon className="w-5 h-5" /> Update Profile
                      </button>
                      <button className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-yellow-700 hover:bg-yellow-50 rounded-xl transition-all duration-200 font-medium">
                        <LockClosedIcon className="w-5 h-5" /> Change Password
                      </button>
                      <button className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-yellow-700 hover:bg-yellow-50 rounded-xl transition-all duration-200 font-medium">
                        <CogIcon className="w-5 h-5" /> Settings
                      </button>
                      <button onClick={handleLogout} className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium">
                        <ArrowPathIcon className="w-5 h-5" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions - Available to all users */}
              <div className="relative">
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setShowDropdown((v) => !v)}
                >
                  <PlusIcon className="w-5 h-5" />
                </Button>
                {showDropdown && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 py-2 animate-fade-in"
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Actions</div>
                    <div className="flex flex-col gap-1">
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:text-yellow-700 hover:bg-yellow-50 transition-all duration-200 font-medium">
                        <UserIcon className="w-5 h-5" /> Add New Lead
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:text-yellow-700 hover:bg-yellow-50 transition-all duration-200 font-medium">
                        <UsersIcon className="w-5 h-5" /> Add New Customer
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:text-yellow-700 hover:bg-yellow-50 transition-all duration-200 font-medium">
                        <ShoppingCartIcon className="w-5 h-5" /> Create New Order
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:text-yellow-700 hover:bg-yellow-50 transition-all duration-200 font-medium">
                        <DocumentTextIcon className="w-5 h-5" /> Create New Invoice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-6 md:py-8 w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Welcome back, {userName || "User"}!</h2>
          <p className="text-gray-600 text-sm md:text-base">Here&apos;s what&apos;s happening with your business today.</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 w-full">
          <KPICard
            title="Leads Today"
            value={dashboardData.leadsToday}
            change="91.67%"
            changeType="down"
            icon={CalendarIcon}
            color="yellow"
          />
          <KPICard
            title="Leads This Month"
            value={dashboardData.leadsThisMonth}
            change="1106.45%"
            changeType="up"
            icon={ArrowTrendingUpIcon}
            color="green"
          />
          <KPICard
            title="Total Leads"
            value={dashboardData.totalLeads}
            icon={UserIcon}
            color="blue"
          />
          <KPICard
            title="Customers"
            value={dashboardData.customers}
            icon={UsersIcon}
            color="purple"
          />
        </div>

        {/* Lead Status Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-4 w-full">
            <StatusCard title="After Visit" value={dashboardData.leadStatus.afterVisit} icon={FireIcon} color="red" />
            <StatusCard title="Before Visit" value={dashboardData.leadStatus.beforeVisit} icon={FaceSmileIcon} color="orange" />
            <StatusCard title="Raw Data" value={dashboardData.leadStatus.rawData} icon={ArrowPathIcon} color="blue" />
            <StatusCard title="Unrated" value={dashboardData.leadStatus.unrated} icon={FaceFrownIcon} color="yellow" />
            <StatusCard title="Untouched" value={dashboardData.leadStatus.untouched} icon={StarIcon} color="pink" subtitle="Needs attention" />
            <StatusCard title="Ongoing" value={dashboardData.leadStatus.ongoing} icon={ArrowPathIcon} color="blue" />
            <StatusCard title="Qualified" value={dashboardData.leadStatus.qualified} icon={StarIcon} color="green" />
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8 w-full">
          {/* Lead Sources Chart */}
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Lead Sources</h3>
              <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">View Details</button>
            </div>
            <div className="space-y-4">
              {dashboardData.leadSources.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.source}</span>
                      <span className="text-sm text-gray-500">{item.count} leads</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Conversion by Users */}
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Conversion by Users</h3>
              <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {dashboardData.conversionsByUser.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50">
                  <span className="font-medium text-gray-700">{item.user}</span>
                  <span className={`font-bold ${item.color}`}>{item.conversions} Conversions</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Lost Leads Analysis */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Lost Leads Analysis</h3>
            <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">View Report</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 w-full">
            {dashboardData.lostLeadsAnalysis.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50">
                <span className="text-sm font-medium text-gray-700">{item.reason}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.color}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/30 hover:bg-gray-50/50 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{item.user}</span>
                    <span className="text-gray-600">{item.action}</span>
                  </div>
                  <span className="text-sm text-gray-500">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>

      {/* Custom Animations */}
      <style jsx global>{`
        .animate-fade-in {
          animation: fade-in 0.2s ease;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
