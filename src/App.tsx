import React, { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { useAuth } from "./hooks/useAuth";
import { DataProvider } from "./contexts/DataContext";
import { ConvexProviderWrapper } from "./contexts/ConvexProvider";
import { Login } from "./components/Login";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./components/DashboardPage";
import { AttendancePage } from "./components/AttendancePage";
import { LeavePage } from "./components/LeavePage";
import { ProjectsPage } from "./components/ProjectsPage";
import { UsersPage } from "./components/UsersPage";
import { ReportsPage } from "./components/ReportsPage";
import { ProfilePage } from "./components/ProfilePage";
import { NotificationsPage } from "./components/NotificationsPage";
import { SettingsPage } from "./components/SettingsPage";
import { Toaster } from "./components/ui/sonner";

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard");

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardPage onViewChange={setCurrentView} />;
      case "attendance":
        return <AttendancePage />;
      case "leave":
        return <LeavePage />;
      case "projects":
        return <ProjectsPage />;
      case "users":
        return <UsersPage />;
      case "reports":
        return <ReportsPage />;
      case "profile":
        return <ProfilePage />;
      case "notifications":
        return <NotificationsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage onViewChange={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ConvexProviderWrapper>
      <AuthProvider>
        <DataProvider>
          <AppContent />
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </ConvexProviderWrapper>
  );
};

export default App;
