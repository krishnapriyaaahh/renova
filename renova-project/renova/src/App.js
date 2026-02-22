import { useState, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FontLink, GlobalStyles } from "./styles/GlobalStyles";

import LandingPage from "./pages/LandingPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import RoadmapPage from "./pages/RoadmapPage";
import ProfilePage from "./pages/ProfilePage";
import CommunityPage from "./pages/CommunityPage";

function AppInner() {
  const { user, logout, loading: authLoading } = useAuth();
  const [page, setPage] = useState("landing");
  const [history, setHistory] = useState([]);

  const navigate = useCallback((p) => {
    setHistory(h => [...h, page]);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const goBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setPage(prev);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [history]);

  const handleLogin = () => { setHistory([]); setPage("onboarding"); };
  const handleLogout = () => { logout(); setHistory([]); setPage("landing"); };

  // Redirect to dashboard if already authenticated on mount
  const isProtected = ["dashboard", "onboarding", "recommendations", "roadmap", "profile", "community"].includes(page);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #fdf0f5 0%, #fff 40%, #fce8f3 75%, #f9d5e9 100%)" }}>
        <p className="serif" style={{ fontSize: 24, color: "#c2185b" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #fdf0f5 0%, #fff 40%, #fce8f3 75%, #f9d5e9 100%)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", top: "-20%", right: "-12%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(194,24,91,0.08) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-15%", left: "-10%", width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(233,30,140,0.06) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {page === "landing" && <LandingPage navigate={navigate} />}
        {page === "login" && <LoginPage navigate={navigate} onLoginSuccess={() => { setHistory([]); setPage("dashboard"); }} goBack={goBack} canGoBack={history.length > 0} />}
        {page === "signup" && <SignupPage navigate={navigate} onSignupSuccess={() => { setHistory([]); setPage("onboarding"); }} goBack={goBack} canGoBack={history.length > 0} />}
        {page === "onboarding" && user && <OnboardingPage onComplete={() => { setHistory([]); setPage("dashboard"); }} goBack={goBack} />}
        {page === "dashboard" && user && <DashboardPage navigate={navigate} logout={handleLogout} goBack={goBack} />}
        {page === "recommendations" && user && <RecommendationsPage navigate={navigate} logout={handleLogout} goBack={goBack} />}
        {page === "roadmap" && user && <RoadmapPage navigate={navigate} logout={handleLogout} goBack={goBack} />}
        {page === "profile" && user && <ProfilePage navigate={navigate} logout={handleLogout} goBack={goBack} />}
        {page === "community" && user && <CommunityPage navigate={navigate} logout={handleLogout} goBack={goBack} />}

        {isProtected && !user && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 20 }}>
            <p className="serif" style={{ fontSize: 32, color: "#c2185b" }}>Sign in to continue</p>
            <button className="btn-primary" style={{ borderRadius: 3 }} onClick={() => navigate("login")}>Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FontLink />
      <GlobalStyles />
      <AppInner />
    </AuthProvider>
  );
}

