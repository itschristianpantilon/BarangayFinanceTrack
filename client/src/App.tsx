import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";

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

import Login from "./pages/login";
import RoleSelection from "./pages/role-selection";
import Dashboard from "./pages/reports/dashboard";
import Revenues from "./pages/reports/revenues";
import Expenses from "./pages/reports/expenses";
import ReceiptsExpenditures from "./pages/reports/receipts-expenditures";
import FundOperations from "./pages/reports/fund-operations";
import Reports from "./pages/reports/reports";

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

/* ===================== ROUTES ===================== */

function AppRoutes() {
  return (
    <Switch>
      {/* Public */}

      <Route path="/" component={ViewerDashboard} />

      <Route path="/login" component={Login} />

      <Route path="/role-selection" component={RoleSelection} />


      {/* General */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/revenues" component={Revenues} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/receipts-expenditures" component={ReceiptsExpenditures} />
      <Route path="/fund-operations" component={FundOperations} />
      <Route path="/reports" component={Reports} />

      {/* Encoder */}
      <Route path="/encoder/dashboard" component={EncoderDashboard} />
      <Route path="/encoder/abo" component={ABO} />
      <Route path="/encoder/sre" component={SRE} />
      <Route path="/encoder/dfur" component={DFUR} />

      {/* Checker */}
      <Route path="/checker/dashboard" component={CheckerDashboard} />
      <Route path="/checker/sre" component={CheckerSRE} />
      <Route path="/checker/dfur" component={CheckerDFUR} />

      {/* Approver */}
      <Route path="/approver/dashboard" component={ApproverDashboard} />
      <Route path="/approver/sre" component={ApproverSRE} />
      <Route path="/approver/dfur" component={ApproverDFUR} />

      {/* Reviewer */}
      <Route path="/reviewer/dashboard" component={ReviewerDashboard} />
      <Route path="/reviewer/dfur" component={ReviewerDFUR} />

      {/* Viewer */}
      <Route path="/viewer/dashboard" component={ViewerDashboard} />

      {/* Admin */}
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/activity-log" component={ActivityLog} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

/* ===================== LAYOUT ===================== */

function MainApp() {
  const [location] = useLocation();

  const isLoginPage = location === "/login";
  const isRoleSelectionPage = location === "/role-selection";


  const isRoleBasedPage =
    location.startsWith("/encoder") ||
    location.startsWith("/checker") ||
    location.startsWith("/approver") ||
    location.startsWith("/reviewer") ||
    location.startsWith("/viewer") ||
    location.startsWith("/admin");

  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  // Login layout
  if (isLoginPage) {
    return <AppRoutes />;
  }

  // Role selection
  if (isRoleSelectionPage) {
    return <RoleSelection />;
  }

  // Role-based layout
  if (isRoleBasedPage) {
    return (
      <div className="flex flex-col h-screen w-full">
        {/* <header className="flex items-center justify-end p-4 border-b border-border bg-background sticky top-0 z-50">
          <ThemeToggle />
        </header> */}
        <main className="flex-1 overflow-auto ">
          <AppRoutes />
        </main>
      </div>
    );
  }

  // Default dashboard layout
  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto">
            <AppRoutes />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

/* ===================== APP ROOT ===================== */

function App() {
  return (
    <WouterRouter>
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
    </WouterRouter>
  );
}

export default App;
