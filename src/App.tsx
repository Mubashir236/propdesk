import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import AppShell from "./components/Layout/AppShell";

// Pages
import DashboardPage from "./pages/DashboardPage";
import SalesPage from "./pages/SalesPage";
import SalesDetailPage from "./pages/SalesDetailPage";
import SalesNewPage from "./pages/SalesNewPage";
import RentalsPage from "./pages/RentalsPage";
import RentalsDetailPage from "./pages/RentalsDetailPage";
import OffPlanPage from "./pages/OffPlanPage";
import OffPlanDetailPage from "./pages/OffPlanDetailPage";
import LeadsPage from "./pages/LeadsPage";
import LeadDetailPage from "./pages/LeadDetailPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TeamPage from "./pages/TeamPage";
import AgentDetailPage from "./pages/AgentDetailPage";
import SettingsPage from "./pages/SettingsPage";

function AuthedApp() {
  const { user, isLoaded } = useUser();
  const ensureUser = useMutation(api.users.ensureUser);
  const me = useQuery(api.users.getMe);

  useEffect(() => {
    if (user && isLoaded) {
      ensureUser({
        name: user.fullName ?? user.username ?? "User",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        phone: user.primaryPhoneNumber?.phoneNumber ?? "",
      }).catch(console.error);
    }
  }, [user, isLoaded, ensureUser]);

  if (!isLoaded || me === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading PropDesk…</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell me={me}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/sales/new" element={<SalesNewPage />} />
        <Route path="/sales/:id" element={<SalesDetailPage />} />
        <Route path="/rentals" element={<RentalsPage />} />
        <Route path="/rentals/:id" element={<RentalsDetailPage />} />
        <Route path="/off-plan" element={<OffPlanPage />} />
        <Route path="/off-plan/:id" element={<OffPlanDetailPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/leads/:id" element={<LeadDetailPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route
          path="/team"
          element={
            me?.role === "ceo" ? <TeamPage /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route
          path="/team/:agentId"
          element={
            me?.role === "ceo" ? (
              <AgentDetailPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

function AuthGate() {
  const { isSignedIn, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy-600">PropDesk</h1>
            <p className="text-muted-foreground mt-1">Dubai Real Estate CRM</p>
          </div>
          {location.pathname === "/sign-up" ? (
            <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
          ) : (
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
          )}
        </div>
      </div>
    );
  }

  return <AuthedApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in/*" element={<AuthGate />} />
        <Route path="/sign-up/*" element={<AuthGate />} />
        <Route path="/*" element={<AuthGate />} />
      </Routes>
    </BrowserRouter>
  );
}
