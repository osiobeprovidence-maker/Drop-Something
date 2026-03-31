import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreatorPage from "./pages/CreatorPage";
import Dashboard from "./pages/Dashboard";
import AdminRoute from "./pages/AdminRoute";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import SettingsPage from "./pages/SettingsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PlatformNavbar } from "./components/PlatformNavbar";
import { CreatorNavbar } from "./components/CreatorNavbar";
import Footer from "./components/Footer";
import Explore from "./pages/Explore";
import HowItWorks from "./pages/HowItWorks";
import CreatorsInfo from "./pages/CreatorsInfo";
import FAQ from "./pages/FAQ";
import SeriesPage from "./pages/SeriesPage";
import ShowcasePage from "./pages/ShowcasePage";
import { ThemeProvider } from "./context/ThemeContext";
import { FollowProvider } from "./context/FollowContext";
import { DataProvider } from "./context/DataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";

function AppContent() {
  const location = useLocation();
  const { user, hasProfile, isLoading } = useAuth();
  const path = location.pathname;
  
  // Reserved platform paths
  const reservedPaths = ["explore", "how-it-works", "creators", "faq", "dashboard", "admin", "login", "signup", "onboarding", "settings"];

  // Extract segments
  const segments = path.split("/").filter(Boolean);
  const firstSegment = segments[0];

  // If user is logged in but hasn't finished onboarding, redirect them to onboarding
  // except if they are already on onboarding, login, signup, or settings pages
  const isAuthPage = ["login", "signup", "onboarding", "settings"].includes(firstSegment);
  
  if (!isLoading && user && !hasProfile && !isAuthPage) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Page type detection
  const isDashboardPage = firstSegment === "dashboard";
  const isAdminPage = firstSegment === "admin";
  const isSettingsPage = firstSegment === "settings";

  // A creator page is a single segment path that is NOT a reserved platform path
  const isCreatorPage =
    !reservedPaths.includes(firstSegment) &&
    (segments.length === 1 || (segments.length === 3 && segments[1] === "series"));

  // Determine which navbar to show
  let navbar = null;
  let mainClass = "flex-1";

  if (isAdminPage || isAuthPage || isDashboardPage || isSettingsPage) {
    // Admin, Auth, Dashboard, and Settings pages handle their own navigation or have no platform navbar
    navbar = null;
  } else if (isCreatorPage) {
    // Creator pages have no header as requested
    navbar = null;
  } else {
    // All other platform pages (Landing, Explore, etc.)
    navbar = <PlatformNavbar />;
    mainClass = "flex-1 pt-16";
  }

  // If we're loading, show a centered spinner but keep the layout
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-black">DropSomething</h2>
            <p className="text-sm font-bold text-black/40 animate-pulse">Syncing your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white transition-colors duration-300">
      {navbar}
      
      <main className={mainClass}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/creators" element={<CreatorsInfo />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/:username/series/:seriesId" element={<SeriesPage />} />
          <Route path="/:username/showcase" element={<ShowcasePage />} />
          <Route path="/:username" element={<CreatorPage />} />
        </Routes>
      </main>
      
      {!isCreatorPage && !isAuthPage && !isDashboardPage && !isAdminPage && !isSettingsPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <DataProvider>
            <FollowProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </FollowProvider>
          </DataProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}
