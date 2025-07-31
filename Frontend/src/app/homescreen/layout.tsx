"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  TruckIcon,
  DocumentTextIcon,
  CreditCardIcon,
  EyeIcon,
  UserGroupIcon,
  CogIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { LeadTypeFilterProvider } from '../LeadTypeFilterContext';
import { useRouter } from "next/navigation";
import React from "react";


const sidebarItems = [
  { label: "Dashboard", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, href: "/homescreen" },
  { label: "Leads", icon: <UserIcon className="w-6 h-6" />, href: "/homescreen/leads" },
  { label: "Followup", icon: <ArrowPathIcon className="w-6 h-6" />, href: "/homescreen/followup" },
  { label: "Lead Logs", icon: <EyeIcon className="w-6 h-6" />, href: "/homescreen/leadlogs" },
  { label: "Logs", icon: <EyeIcon className="w-6 h-6" /> },
  { label: "Customers", icon: <UsersIcon className="w-6 h-6" />, href: "/homescreen/customers" },
  { label: "Followups", icon: <ArrowPathIcon className="w-6 h-6" /> },
  { label: "Opportunities", icon: <CurrencyDollarIcon className="w-6 h-6" /> },
  { label: "Items", icon: <ShoppingCartIcon className="w-6 h-6" /> },
  { label: "Orders", icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
  { label: "Dispatch", icon: <TruckIcon className="w-6 h-6" /> },
  { label: "Invoices", icon: <DocumentTextIcon className="w-6 h-6" /> },
  { label: "Incoming payments", icon: <CreditCardIcon className="w-6 h-6" /> },
  { label: "Visitor logs", icon: <EyeIcon className="w-6 h-6" /> },
  { label: "Team members", icon: <UserGroupIcon className="w-6 h-6" /> },
  { label: "Settings", icon: <CogIcon className="w-6 h-6" /> },
];

// Add ERP modules as a separate array
const erpSidebarItems = [
  { label: "Dashboard", icon: <ClipboardDocumentListIcon className="w-6 h-6" />, href: "/homescreen/dashboard" },
  { label: "Inventory", icon: <FolderIcon className="w-6 h-6" />, href: "/homescreen/inventory" },
  { label: "Sales", icon: <CurrencyDollarIcon className="w-6 h-6" />, href: "/homescreen/sales" },
  { label: "Purchasing", icon: <ShoppingCartIcon className="w-6 h-6" />, href: "/homescreen/purchasing" },
  { label: "Finance", icon: <CreditCardIcon className="w-6 h-6" />, href: "/homescreen/finance" },
  { label: "HR", icon: <UserGroupIcon className="w-6 h-6" />, href: "/homescreen/hr" },
  { label: "Manufacturing", icon: <BuildingOfficeIcon className="w-6 h-6" />, href: "/homescreen/manufacturing" },
  { label: "Projects", icon: <FolderIcon className="w-6 h-6" />, href: "/homescreen/projects" },
  { label: "Analytics", icon: <EyeIcon className="w-6 h-6" />, href: "/homescreen/analytics" },
];

export default function HomescreenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // State for creation panel
  const [creationPanelOpen, setCreationPanelOpen] = useState(false);
  const [leadsDropdownOpen, setLeadsDropdownOpen] = useState(false);
  const [followupDropdownOpen, setFollowupDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading, true = authenticated, false = not authenticated
  const [isClient, setIsClient] = useState(false); // Used in conditional rendering to prevent hydration mismatch
  const [userRole, setUserRole] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      console.log('🔍 Debug - Token:', token ? 'Present' : 'Missing');
      console.log('🔍 Debug - Role from localStorage:', role);
      console.log('🔍 Debug - Is admin check:', role === 'admin');
      
      if (!token) {
        setIsAuthenticated(false);
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
        setUserRole(role || '');
      }
    }
  }, [router]);

  // Check if user is admin
  const isAdmin = userRole?.toLowerCase() === 'admin';
  console.log('🔍 Debug - Final isAdmin value:', isAdmin);
  console.log('🔍 Debug - userRole state:', userRole);
  // Show loading spinner while checking authentication (only on client)
  if (!isClient || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin"></div>
          <p className="text-yellow-800 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect to login)
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-yellow-300 border-t-yellow-600 rounded-full animate-spin"></div>
          <p className="text-yellow-800 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <LeadTypeFilterProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-yellow-200 via-orange-100 to-yellow-50 relative">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col bg-gradient-to-b from-yellow-300 via-orange-100 to-yellow-50 border-r border-yellow-300 py-4 px-2 fixed h-full z-10 overflow-y-auto shadow-xl backdrop-blur-md bg-opacity-80 transition-all duration-500 ease-in-out`}>
          <button
            className="mb-2 w-10 h-10 flex items-center justify-center rounded-full bg-yellow-200 hover:bg-yellow-300 self-end"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Minimize sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeftIcon className="w-6 h-6 text-yellow-800" /> : <ChevronRightIcon className="w-6 h-6 text-yellow-800" />}
          </button>
          {/* Logout Button at the top for easy access */}
          <button
            className="mb-4 w-10 h-10 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-400 transition text-red-700 hover:text-white shadow border border-red-200"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            title="Logout"
            aria-label="Logout"
          >
            <ArrowPathIcon className="w-6 h-6" />
          </button>
          
          {/* Creation Panel - Only visible to admin users */}
          {isAdmin && (
            <>
          {sidebarOpen ? (
            <div className="mb-6 p-3 bg-gradient-to-r from-yellow-200 to-yellow-100 rounded-lg border-2 border-yellow-300 shadow-lg">
              <button
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg font-semibold text-yellow-800 hover:bg-yellow-200 transition-all duration-200"
                onClick={() => setCreationPanelOpen((v) => !v)}
              >
                <PlusIcon className="w-5 h-5 text-yellow-700" />
                <span className="text-yellow-800">Creation Panel</span>
                {creationPanelOpen ? <ChevronDownIcon className="w-4 h-4 ml-auto text-yellow-700" /> : <ChevronRightIcon className="w-4 h-4 ml-auto text-yellow-700" />}
              </button>
              
              {creationPanelOpen && (
                <div className="mt-3 space-y-2">
                  <CreationPanelItem 
                    icon={<FolderIcon className="w-4 h-4" />} 
                    label="Dealer"
                    onClick={() => {
                      window.location.href = '/homescreen/dealers';
                    }}
                  />
                  <CreationPanelItem 
                    icon={<ShieldCheckIcon className="w-4 h-4" />} 
                    label="Role"
                    onClick={() => {
                      window.location.href = '/homescreen/roles';
                    }}
                  />
                  <CreationPanelItem 
                    icon={<UserIcon className="w-4 h-4" />} 
                    label="User"
                    onClick={() => {
                      window.location.href = '/homescreen/users';
                    }}
                  />
                  <CreationPanelItem 
                    icon={<BuildingOfficeIcon className="w-4 h-4" />} 
                    label="Division"
                    onClick={() => {
                      window.location.href = '/homescreen/divisions';
                    }}
                  />
                  <CreationPanelItem 
                    icon={<FolderIcon className="w-4 h-4" />} 
                    label="Branch"
                    onClick={() => {
                      window.location.href = '/homescreen/branches';
                    }}
                  />
                  <CreationPanelItem 
                    icon={<FolderIcon className="w-4 h-4" />} 
                    label="Sub Division"
                    onClick={() => {
                      window.location.href = '/homescreen/subdivisions';
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="mb-4 flex justify-center">
              <button
                className="w-10 h-10 rounded-full bg-yellow-200 hover:bg-yellow-300 flex items-center justify-center transition-all duration-200"
                onClick={() => setCreationPanelOpen((v) => !v)}
                title="Creation Panel"
              >
                <PlusIcon className="w-5 h-5 text-yellow-700" />
              </button>
            </div>
              )}
            </>
          )}
          
          <div className="flex flex-col gap-1">
            {/* Existing sidebar items */}
            {sidebarItems.map((item) => (
              item.href ? (
                <div key={item.label}>
                  {item.label === "Leads" ? (
                    <>
                      <div
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-full text-left cursor-pointer min-w-0 ${pathname === item.href ? "bg-yellow-500 text-white shadow-lg scale-105" : "text-yellow-800 hover:bg-yellow-200 hover:scale-105"}`}
                        onClick={() => setLeadsDropdownOpen((v) => !v)}
                      >
                        <span className="flex items-center justify-center w-8 h-8">{item.icon}</span>
                        {sidebarOpen && <span>{item.label}</span>}
                        {sidebarOpen && (
                          <span className="ml-auto">
                            {leadsDropdownOpen ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                          </span>
                        )}
                      </div>
                      {sidebarOpen && leadsDropdownOpen && (
                        <div className="pl-12 pr-2 pt-2 flex flex-col gap-1">
                          <Link
                            key="All"
                            href="/homescreen/leads"
                            className={`block px-3 py-2 rounded font-medium hover:bg-yellow-200 ${
                              pathname === '/homescreen/leads' && (typeof window === 'undefined' || !new URLSearchParams(window.location.search).get('type'))
                                ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-600 shadow'
                                : 'bg-yellow-100 text-yellow-900'
                            }`}
                          >
                            All
                          </Link>
                          <Link
                            key="Raw Data"
                            href="/homescreen/leads?type=Raw%20Data"
                            className={`block px-3 py-2 rounded font-medium bg-blue-100 text-blue-900 hover:bg-blue-300 ${
                              pathname === '/homescreen/leads' && typeof window !== 'undefined' && decodeURIComponent(new URLSearchParams(window.location.search).get('type') || '').toLowerCase() === 'raw data'
                                ? 'bg-blue-400 text-blue-900 ring-2 ring-blue-600 shadow'
                                : ''
                            }`}
                          >
                            Raw Data
                          </Link>
                          <Link
                            key="Complete"
                            href="/homescreen/leads?type=Complete"
                            className={`block px-3 py-2 rounded font-medium bg-green-100 text-green-900 hover:bg-green-300 ${
                              pathname === '/homescreen/leads' && typeof window !== 'undefined' && decodeURIComponent(new URLSearchParams(window.location.search).get('type') || '').toLowerCase() === 'complete'
                                ? 'bg-green-400 text-green-900 ring-2 ring-green-600 shadow'
                                : ''
                            }`}
                          >
                            Complete
                          </Link>
                          <Link
                            key="Before Visit"
                            href="/homescreen/leads?type=Before%20Visit"
                            className={`block px-3 py-2 rounded font-medium bg-purple-100 text-purple-900 hover:bg-purple-300 ${
                              pathname === '/homescreen/leads' && typeof window !== 'undefined' && decodeURIComponent(new URLSearchParams(window.location.search).get('type') || '').toLowerCase() === 'before visit'
                                ? 'bg-purple-400 text-purple-900 ring-2 ring-purple-600 shadow'
                                : ''
                            }`}
                          >
                            Before Visit
                          </Link>
                          <Link
                            key="After Visit"
                            href="/homescreen/leads?type=After%20Visit"
                            className={`block px-3 py-2 rounded font-medium bg-pink-100 text-pink-900 hover:bg-pink-300 ${
                              pathname === '/homescreen/leads' && typeof window !== 'undefined' && decodeURIComponent(new URLSearchParams(window.location.search).get('type') || '').toLowerCase() === 'after visit'
                                ? 'bg-pink-400 text-pink-900 ring-2 ring-pink-600 shadow'
                                : ''
                            }`}
                          >
                            After Visit
                          </Link>
                        </div>
                      )}
                    </>
                  ) : item.label === "Followup" ? (
                    <React.Fragment>
                      <div
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-full text-left cursor-pointer min-w-0 ${pathname.startsWith('/homescreen/followup') ? "bg-yellow-500 text-white shadow-lg scale-105" : "text-yellow-800 hover:bg-yellow-200 hover:scale-105"}`}
                        onClick={() => setFollowupDropdownOpen((v) => !v)}
                      >
                        <span className="flex items-center justify-center w-8 h-8">{item.icon}</span>
                        {sidebarOpen && <span>{item.label}</span>}
                        {sidebarOpen && (
                          <span className="ml-auto">
                            {followupDropdownOpen ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                          </span>
                        )}
                      </div>
                      {sidebarOpen && followupDropdownOpen && (
                        <div className="pl-12 pr-2 pt-2 flex flex-col gap-1">
                          <Link
                            key="All"
                            href="/homescreen/followup"
                            className={`block px-3 py-2 rounded font-medium bg-yellow-100 text-yellow-900 hover:bg-yellow-300 ${pathname === '/homescreen/followup' && (typeof window === 'undefined' || !new URLSearchParams(window.location.search).get('type')) ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-600 shadow' : ''}`}
                          >
                            All
                          </Link>
                          <Link
                            key="Overdue"
                            href="/homescreen/followup/overdue"
                            className={`block px-3 py-2 rounded font-medium bg-red-100 text-red-900 hover:bg-red-300 ${pathname === '/homescreen/followup/overdue' ? 'bg-red-400 text-red-900 ring-2 ring-red-600 shadow' : ''}`}
                          >
                            Overdue
                          </Link>
                          <Link
                            key="Pending"
                            href="/homescreen/followup/pending"
                            className={`block px-3 py-2 rounded font-medium bg-yellow-100 text-yellow-900 hover:bg-yellow-300 ${pathname === '/homescreen/followup/pending' ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-600 shadow' : ''}`}
                          >
                            Pending
                          </Link>
                          <Link
                            key="Completed"
                            href="/homescreen/followup/completed"
                            className={`block px-3 py-2 rounded font-medium bg-green-100 text-green-900 hover:bg-green-300 ${pathname === '/homescreen/followup/completed' ? 'bg-green-400 text-green-900 ring-2 ring-green-600 shadow' : ''}`}
                          >
                            Completed
                          </Link>
                        </div>
                      )}
                    </React.Fragment>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-full text-left cursor-pointer min-w-0 ${pathname === item.href ? "bg-yellow-500 text-white shadow-lg scale-105" : "text-yellow-800 hover:bg-yellow-200 hover:scale-105"}`}
                    >
                      <span className="flex items-center justify-center w-8 h-8">{item.icon}</span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  )}
                </div>
              ) : null
            ))}
            {/* ERP Modules Section */}
            <div className="mt-6 mb-2 px-4 text-xs font-bold text-yellow-700 uppercase tracking-wider opacity-80">
              <span
                className={`transition-all duration-500 ease-in-out origin-left ${sidebarOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
              >
                ERP Modules
              </span>
            </div>
            {erpSidebarItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 w-full text-left cursor-pointer min-w-0 ${pathname === item.href ? "bg-yellow-500 text-white shadow-lg scale-105" : "text-yellow-800 hover:bg-yellow-200 hover:scale-105"}`}
                >
                  <span className="flex items-center justify-center w-8 h-8">{item.icon}</span>
                  <span
                    className={`transition-all duration-500 ease-in-out origin-left ${sidebarOpen ? 'opacity-100 scale-100 ml-2' : 'opacity-0 scale-90 ml-0 pointer-events-none'}`}
                  >
                    {item.label}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </aside>
        {/* Main Content Wrapper */}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? "ml-64" : "ml-16"} min-h-screen relative z-10 transition-all duration-300`}>
          {children}
        </div>
        

      </div>
    </LeadTypeFilterProvider>
  );
}

// Creation Panel Item component
interface CreationPanelItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function CreationPanelItem({ icon, label, onClick }: CreationPanelItemProps) {
  return (
    <button
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-yellow-700 hover:bg-yellow-200 hover:scale-105 transition-all duration-200 border border-transparent hover:border-yellow-300"
      onClick={onClick}
      title={`Create new ${label}`}
    >
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100">
        {icon}
      </div>
      <span>{label}</span>
    </button>
  );
} 