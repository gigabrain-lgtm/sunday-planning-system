import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={SundayPlanning} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/checkins"} component={Checkins} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/marketing"} component={Marketing} />
      <Route path={"/test-slack"} component={TestSlack} />
      <Route path={"/sales-update"} component={SalesUpdate} />
      <Route path={"/finance-update"} component={FinanceUpdate} />
      <Route path={"/clickup-report"} component={ClickUpReportUpload} />
      <Route path={"/okrs"} component={OKRDashboard} />
      <Route path={"/a3"} component={A3Template} />
      <Route path={"/home"} component={Home} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
