import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// ─── Layouts ─────────────────────────────────────────────────────────────────
import Navbar       from './components/Navbar.jsx';
import Footer       from './components/Footer.jsx';
import AdminLayout  from './layouts/AdminLayout.jsx';

// ─── Public pages ─────────────────────────────────────────────────────────────
import HomePage           from './pages/HomePage.jsx';
import CampaignsPage      from './pages/CampaignsPage.jsx';
import CampaignDetailPage from './pages/CampaignDetailPage.jsx';
import PaystackCallbackPage from './pages/PaystackCallbackPage.jsx';

// ─── Admin pages ──────────────────────────────────────────────────────────────
import AdminLogin     from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminCampaigns from './pages/admin/AdminCampaigns.jsx';
import CampaignForm   from './pages/admin/CampaignForm.jsx';
import AdminDonations from './pages/admin/AdminDonations.jsx';

// ─── Public layout wrapper ────────────────────────────────────────────────────
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#1c1917',
              color: '#fafaf9',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* ── Public site ──────────────────────────────────────── */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/campaigns"
            element={
              <PublicLayout>
                <CampaignsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/campaigns/:slug"
            element={
              <PublicLayout>
                <CampaignDetailPage />
              </PublicLayout>
            }
          />
          <Route path="/donation/paystack-callback" element={<PaystackCallbackPage />} />

          {/* ── Admin auth ───────────────────────────────────────── */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ── Admin dashboard (protected) ──────────────────────── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="campaigns" element={<AdminCampaigns />} />
            <Route path="campaigns/new" element={<CampaignForm />} />
            <Route path="campaigns/edit/:id" element={<CampaignForm />} />
            <Route path="donations" element={<AdminDonations />} />
          </Route>

          {/* ── Fallback ─────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}
