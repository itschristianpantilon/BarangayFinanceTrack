import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeToggle } from "./components/theme-toggle";
import { HeroBanner } from "./components/hero-banner";
import { AuthProvider } from "./contexts/auth-context";
import { ProtectedRoute } from "./components/protected-route";
import Login from "./pages/login";
import RoleSelection from "./pages/role-selection";
import Dashboard from "./pages/dashboard";
import Revenues from "./pages/revenues";
import Expenses from "./pages/expenses";
import ReceiptsExpenditures from "./pages/receipts-expenditures";
import FundOperations from "./pages/fund-operations";
import Reports from "./pages/reports";
import EncoderDashboard from "./pages/encoder/encoder-dashboard";
import ABO from "./pages/encoder/abo";
import SRE from "./pages/encoder/sre";
import DFUR from "./pages/encoder/dfur";
import CheckerDashboard from "./pages/checker/dashboard";
import CheckerSRE from "./pages/checker/sre";
import CheckerDFUR from "./pages/checker/dfur";
import ApproverDashboard from "./pages/approver/dashboard";
import ApproverSRE from "./pages/approver/sre";
import ApproverDFUR from "./pages/approver/dfur";
import ReviewerDashboard from "./pages/reviewer/dashboard";
import ReviewerDFUR from "./pages/reviewer/dfur";
import ViewerDashboard from "./pages/viewer/dashboard";
import UserManagement from "./pages/admin/user-management";
import ActivityLog from "./pages/admin/activity-log";
import NotFound from "./pages/not-found";
import "./App.css";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      
      {/* Protected general routes */}
      <Route path="/dashboard" component={() => <Dashboard />} />
      <Route path="/revenues" component={() => <Revenues />} />
      <Route path="/expenses" component={() => <Expenses />} />
      <Route path="/receipts-expenditures" component={() => <ReceiptsExpenditures />} />
      <Route path="/fund-operations" component={() => <FundOperations />} />
      <Route path="/reports" component={() => <Reports />} />
      
      {/* Encoder routes */}
      <Route path="/encoder/dashboard" component={() => <EncoderDashboard />} />
      <Route path="/encoder/abo" component={() => <ABO />} />
      <Route path="/encoder/sre" component={() => <SRE />} />
      <Route path="/encoder/dfur" component={() => <DFUR />} />
      
      {/* Checker routes */}
      <Route path="/checker/dashboard" component={() => <CheckerDashboard />} />
      <Route path="/checker/sre" component={() => <CheckerSRE />} />
      <Route path="/checker/dfur" component={() => <CheckerDFUR />} />
      
      {/* Approver routes */}
      <Route path="/approver/dashboard" component={() => <ApproverDashboard />} />
      <Route path="/approver/sre" component={() => <ApproverSRE />} />
      <Route path="/approver/dfur" component={() => <ApproverDFUR />} />
      
      {/* Reviewer routes */}
      <Route path="/reviewer/dashboard" component={() => <ReviewerDashboard />} />
      <Route path="/reviewer/dfur" component={() => <ReviewerDFUR />} />
      
      {/* Viewer routes - Public Access (No login required) */}
      <Route path="/viewer/dashboard" component={ViewerDashboard} />
      
      {/* Admin routes */}
      <Route path="/admin/users" component={() => <UserManagement />} />
      <Route path="/admin/activity-log" component={() => <ActivityLog />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function MainApp() {
  const [location] = useLocation();
  const isLoginPage = location === "/login";
  const isRoleSelectionPage = location === "/";
  
  // Check if we're on any role-specific page that has its own layout
  const isRoleBasedPage = location.startsWith("/encoder") || 
                           location.startsWith("/checker") || 
                           location.startsWith("/approver") || 
                           location.startsWith("/reviewer") || 
                           location.startsWith("/viewer") ||
                           location.startsWith("/admin");

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  // Login page has its own layout
  if (isLoginPage) {
    return <Router />;
  }

  if (isRoleSelectionPage) {
    return <RoleSelection />;
  }

  // Role-based pages have their own layouts with sidebars
  if (isRoleBasedPage) {
    return (
      <div className="flex flex-col h-screen w-full">
        <header className="flex items-center justify-end p-4 border-b border-border bg-background sticky top-0 z-50">
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-hidden">
          <Router />
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <HeroBanner />
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <MainApp />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
