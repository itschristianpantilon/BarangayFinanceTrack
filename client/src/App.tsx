import { Router as WouterRouter, Switch, Route, useLocation } from "wouter";

import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { SidebarProvider } from "./components/ui/sidebar";
import { AuthProvider } from "./contexts/auth-context";
import { ProtectedRoute } from "./components/protected-route";

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
      {/* Public Routes */}
      <Route path="/login" component={Login} />
      <Route path="/role-selection" component={RoleSelection} />

      {/* Root - redirect to viewer dashboard (public) */}
      <Route path="/" component={ViewerDashboard} />

      {/* General Reports - Protected, accessible by multiple roles */}
      <Route path="/dashboard">
        <ProtectedRoute allowedRoles={["superadmin", "admin", "encoder", "checker", "approver", "reviewer"]}>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/revenues">
        <ProtectedRoute allowedRoles={["superadmin", "admin", "encoder", "checker", "approver", "reviewer"]}>
          <Revenues />
        </ProtectedRoute>
      </Route>
      
      <Route path="/expenses">
        <ProtectedRoute allowedRoles={["superadmin", "admin", "encoder", "checker", "approver", "reviewer"]}>
          <Expenses />
        </ProtectedRoute>
      </Route>
      
      <Route path="/receipts-expenditures">
        <ProtectedRoute allowedRoles={["superadmin", "admin", "encoder", "checker", "approver", "reviewer"]}>
          <ReceiptsExpenditures />
        </ProtectedRoute>
      </Route>
      
      <Route path="/fund-operations">
        <ProtectedRoute allowedRoles={["superadmin", "admin", "encoder", "checker", "approver", "reviewer"]}>
          <FundOperations />
        </ProtectedRoute>
      </Route>
      
      <Route path="/reports">
        <ProtectedRoute allowedRoles={["superadmin", "admin", "encoder", "checker", "approver", "reviewer"]}>
          <Reports />
        </ProtectedRoute>
      </Route>

      {/* Encoder Routes */}
      <Route path="/encoder/dashboard">
        <ProtectedRoute allowedRoles={["encoder"]}>
          <EncoderDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/encoder/abo">
        <ProtectedRoute allowedRoles={["encoder"]}>
          <ABO />
        </ProtectedRoute>
      </Route>
      
      <Route path="/encoder/sre">
        <ProtectedRoute allowedRoles={["encoder"]}>
          <SRE />
        </ProtectedRoute>
      </Route>
      
      <Route path="/encoder/dfur">
        <ProtectedRoute allowedRoles={["encoder"]}>
          <DFUR />
        </ProtectedRoute>
      </Route>

      {/* Checker Routes */}
      <Route path="/checker/dashboard">
        <ProtectedRoute allowedRoles={["checker"]}>
          <CheckerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/checker/sre">
        <ProtectedRoute allowedRoles={["checker"]}>
          <CheckerSRE />
        </ProtectedRoute>
      </Route>
      
      <Route path="/checker/dfur">
        <ProtectedRoute allowedRoles={["checker"]}>
          <CheckerDFUR />
        </ProtectedRoute>
      </Route>

      {/* Approver Routes */}
      <Route path="/approver/dashboard">
        <ProtectedRoute allowedRoles={["approver"]}>
          <ApproverDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/approver/sre">
        <ProtectedRoute allowedRoles={["approver"]}>
          <ApproverSRE />
        </ProtectedRoute>
      </Route>
      
      <Route path="/approver/dfur">
        <ProtectedRoute allowedRoles={["approver"]}>
          <ApproverDFUR />
        </ProtectedRoute>
      </Route>

      {/* Reviewer Routes */}
      <Route path="/reviewer/dashboard">
        <ProtectedRoute allowedRoles={["reviewer"]}>
          <ReviewerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/reviewer/dfur">
        <ProtectedRoute allowedRoles={["reviewer"]}>
          <ReviewerDFUR />
        </ProtectedRoute>
      </Route>

      {/* Viewer Routes */}
      <Route path="/viewer/dashboard">
        <ViewerDashboard />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
          <UserManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/activity-log">
        <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
          <ActivityLog />
        </ProtectedRoute>
      </Route>

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
    return <AppRoutes />;
  }

  // Role-based layout
  if (isRoleBasedPage) {
    return (
      <div className="flex flex-col h-screen w-full">
        <main className="flex-1 overflow-auto">
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
        <AuthProvider>
          <TooltipProvider>
            <MainApp />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;