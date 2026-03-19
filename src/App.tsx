import { BrowserRouter as Router, Routes, Route, useLocation, useParams } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreatorPage from "./pages/CreatorPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PlatformNavbar } from "./components/PlatformNavbar";
import { CreatorNavbar } from "./components/CreatorNavbar";
import Footer from "./components/Footer";
import Explore from "./pages/Explore";
import HowItWorks from "./pages/HowItWorks";
import CreatorsInfo from "./pages/CreatorsInfo";
import FAQ from "./pages/FAQ";
import { ThemeProvider } from "./context/ThemeContext";
import { FollowProvider } from "./context/FollowContext";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";

function AppContent() {
  const location = useLocation();
  const path = location.pathname;
  
  // Reserved platform paths
  const reservedPaths = ["explore", "how-it-works", "creators", "faq", "dashboard", "admin", "login", "signup", "onboarding"];
  
  // Extract segments
  const segments = path.split("/").filter(Boolean);
  const firstSegment = segments[0];
  
  // Page type detection
  const isDashboardPage = firstSegment === "dashboard";
  const isAdminPage = firstSegment === "admin";
  const isAuthPage = ["login", "signup", "onboarding"].includes(firstSegment);
  
  // A creator page is a single segment path that is NOT a reserved platform path
  const isCreatorPage = segments.length === 1 && !reservedPaths.includes(firstSegment);
  
  // Determine which navbar to show
  let navbar = null;
  let mainClass = "flex-1";

  if (isAdminPage || isAuthPage || isDashboardPage) {
    // Admin, Auth, and Dashboard pages handle their own navigation or have no platform navbar
    navbar = null;
  } else if (isCreatorPage) {
    navbar = <CreatorNavbar username={firstSegment} />;
    // CreatorPage handles its own padding (pt-20)
  } else {
    // All other platform pages (Landing, Explore, etc.)
    navbar = <PlatformNavbar />;
    mainClass = "flex-1 pt-16";
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
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/:username" element={<CreatorPage />} />
        </Routes>
      </main>
      
      {!isCreatorPage && !isAuthPage && !isDashboardPage && !isAdminPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <FollowProvider>
          <ThemeProvider>
            <Router>
              <AppContent />
            </Router>
          </ThemeProvider>
        </FollowProvider>
      </DataProvider>
    </AuthProvider>
  );
}
