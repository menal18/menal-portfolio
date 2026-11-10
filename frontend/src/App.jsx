import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { SiteProvider, useSite } from "./context/SiteContext.jsx";
import Cursor from "./components/Cursor.jsx";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import { ErrorScreen, Loader } from "./components/StateScreen.jsx";
import Home from "./pages/Home.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";
import NotFound from "./pages/NotFound.jsx";

// The admin bundle is only downloaded when /admin is visited
const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

function PublicLayout() {
  const { data, appearance, loading, error, reload } = useSite();
  const { pathname } = useLocation();
  if (loading && !data) return <Loader />;
  if (error && !data) return <ErrorScreen message={error} onRetry={reload} />;
  return (
    <>
      <Cursor />
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Nav
        name={data.profile.name}
        ready
        hasMarketing={data.campaigns.length > 0}
      />
      <div
        key={pathname.startsWith("/projects") ? pathname : "home"}
        className="page"
        id="main"
      >
        <Outlet />
      </div>
      <Footer profile={data.profile} season={appearance.season} />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Loader />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route
        element={
          <SiteProvider>
            <PublicLayout />
          </SiteProvider>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route
          path="/projects"
          element={<Navigate to="/#projects" replace />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
