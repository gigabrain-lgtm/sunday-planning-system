import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import SundayPlanning from "./pages/SundayPlanning";
import Dashboard from "./pages/Dashboard";
import Checkins from "./pages/Checkins";
import Calendar from "./pages/Calendar";
import Marketing from "./pages/Marketing";
import TestSlack from "./pages/TestSlack";
import SalesUpdate from "./pages/SalesUpdate";
import FinanceUpdate from "./pages/FinanceUpdate";
import ClickUpReportUpload from "./pages/ClickUpReportUpload";
import OKRDashboard from "./pages/OKRDashboard";
import A3Template from "./pages/A3Template";
import ExternalSubmissions from "./pages/ExternalSubmissions";
import OrgChart from "./pages/OrgChart";
import TestCustomFields from "./pages/TestCustomFields";
import PaymentRequestsPublic from "./pages/PaymentRequestsPublic";
import PaymentRequestsAdmin from "./pages/PaymentRequestsAdmin";
import Hiring from "./pages/Hiring";
import RecruiterManagement from "./pages/RecruiterManagement";
import PaymentCompletion from "./pages/PaymentCompletion";

import Roles from "./pages/Roles";
import DailyReconciliation from "./pages/DailyReconciliation";
import RecruitmentFunnel from "./pages/RecruitmentFunnel";
import CEOReview from "./pages/CEOReview";
import RecruiterOnboarding from "./pages/RecruiterOnboarding";
import Jobs from "./pages/Jobs";
import WorkableJobs from "./pages/WorkableJobs";
import JobCoverageMatrix from "./pages/JobCoverageMatrix";
import HiringPriority from "./pages/HiringPriority";
import Invoices from "./pages/Invoices";

function Router() {
  return (
    <Switch>
      {/* Public route - no authentication required */}
      <Route path={"/submissions"} component={ExternalSubmissions} />
      <Route path={"/test-custom-fields"} component={TestCustomFields} />
      <Route path={"/payment-requests"} component={PaymentRequestsPublic} />
      
      {/* Protected routes - require authentication */}
      <Route path={"/"}>
        <ProtectedRoute>
          <SundayPlanning />
        </ProtectedRoute>
      </Route>
      <Route path={"/dashboard"}>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/checkins"}>
        <ProtectedRoute>
          <Checkins />
        </ProtectedRoute>
      </Route>
      <Route path={"/calendar"}>
        <ProtectedRoute>
          <Calendar />
        </ProtectedRoute>
      </Route>
      <Route path={"/marketing"}>
        <ProtectedRoute>
          <Marketing />
        </ProtectedRoute>
      </Route>
      <Route path={"/test-slack"}>
        <ProtectedRoute>
          <TestSlack />
        </ProtectedRoute>
      </Route>
      <Route path={"/sales-update"}>
        <ProtectedRoute>
          <SalesUpdate />
        </ProtectedRoute>
      </Route>
      <Route path={"/finance-update"}>
        <ProtectedRoute>
          <FinanceUpdate />
        </ProtectedRoute>
      </Route>
      <Route path={"/clickup-report"}>
        <ProtectedRoute>
          <ClickUpReportUpload />
        </ProtectedRoute>
      </Route>
      <Route path={"/okrs"}>
        <ProtectedRoute>
          <OKRDashboard />
        </ProtectedRoute>
      </Route>
      <Route path={"/a3"}>
        <ProtectedRoute>
          <A3Template />
        </ProtectedRoute>
      </Route>
      <Route path={"/org-chart"}>
        <ProtectedRoute>
          <OrgChart />
        </ProtectedRoute>
      </Route>
      <Route path={"/payment-requests-admin"}>
        <ProtectedRoute>
          <PaymentRequestsAdmin />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring"}>
        <ProtectedRoute>
          <Hiring />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/recruiter-management"}>
        <ProtectedRoute>
          <RecruiterManagement />
        </ProtectedRoute>
      </Route>

      <Route path={"/hiring/roles"}>
        <ProtectedRoute>
          <Roles />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/daily-reconciliation"}>
        <ProtectedRoute>
          <DailyReconciliation />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/recruitment-funnel"}>
        <ProtectedRoute>
          <RecruitmentFunnel />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/ceo-review"}>
        <ProtectedRoute>
          <CEOReview />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/recruiter-onboarding"}>
        <ProtectedRoute>
          <RecruiterOnboarding />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/jobs"}>
        <ProtectedRoute>
          <Jobs />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/workable-jobs"}>
        <ProtectedRoute>
          <WorkableJobs />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/job-coverage"}>
        <ProtectedRoute>
          <JobCoverageMatrix />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/priorities"}>
        <ProtectedRoute>
          <HiringPriority />
        </ProtectedRoute>
      </Route>
      <Route path={"/hiring/invoices"}>
        <ProtectedRoute>
          <Invoices />
        </ProtectedRoute>
      </Route>
      <Route path={"/payment-completion"}>
        <ProtectedRoute>
          <PaymentCompletion />
        </ProtectedRoute>
      </Route>
      <Route path={"/home"}>
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
