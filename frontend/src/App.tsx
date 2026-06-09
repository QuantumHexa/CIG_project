import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./lib/auth";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { EventsPage } from "./pages/EventsPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { UploadPage } from "./pages/UploadPage";
import { SearchPage } from "./pages/SearchPage";
import { MyPhotosPage } from "./pages/MyPhotosPage";
import { NotificationsPage } from "./pages/NotificationsPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route path="/events" element={<Layout><EventsPage /></Layout>} />
      <Route path="/events/:id" element={<Layout><EventDetailPage /></Layout>} />
      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <Layout>
              <UploadPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/search" element={<Layout><SearchPage /></Layout>} />
      <Route
        path="/my-photos"
        element={
          <PrivateRoute>
            <Layout>
              <MyPhotosPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Layout>
              <NotificationsPage />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
