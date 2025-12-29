// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";
import DashboardLayout from "./components/layout/DashboardLayout/DashboardLayout";
import ActiveCustomers from "./pages/dashboard/ActiveCustomers";
import Appointments from "./pages/dashboard/Appointments";
import Dashboard from "./pages/dashboard/Dashboard";
import Customers from "./pages/dashboard/Customers";
import DealerShips from "./pages/dashboard/DealerShips";
import HighestBids from "./pages/dashboard/HighestBids";
import LiveAuctions from "./pages/dashboard/LiveAuctions";
import MyBids from "./pages/dashboard/MyBids";
import NewCustomers from "./pages/dashboard/NewCustomers";
import Reports from "./pages/dashboard/Reports";
import WonAuctions from "./pages/dashboard/WonAuctions";
import { Toaster } from "react-hot-toast";
import Profile from "./pages/dashboard/Profile";
import Home from "./pages/home/Home";
import Register from "./pages/register/Register";
import BackToTop from "./components/ui/BackToTop";
import VehicleDetails from "./pages/dashboard/VehicleDetails";
import CheckoutPage from "./components/stripe/CheckoutPage";
import PaymentSuccess from "./components/stripe/PaymentSuccess";
import { SearchProvider } from "./context/SearchContext";
import { SSEProvider } from "./context/SSEContext";
import InvitedDealerships from "./pages/dashboard/InvitedDealerships";
import SalesManagers from "./pages/dashboard/SalesManagers";
import DealershipUsers from "./pages/dashboard/DealershipUsers";
import SubscriptionCancellationRequests from "./pages/dashboard/SubscriptionCancellationRequests";
import PartnerDealers from "./pages/dashboard/PartnerDealers";
import LiveSessions from "./pages/dashboard/LiveSessions";
import SessionLeaderboard from "./pages/dashboard/SessionLeaderboard";
import WonSessions from "./pages/dashboard/WonSessions";
import MyReverseBids from "./pages/dashboard/MyReverseBids";
import Inventory from "./pages/dashboard/Inventory";
import AdminSessions from "./pages/dashboard/AdminSessions";
import AdminSessionDetails from "./pages/dashboard/AdminSessionDetails";
import AdminDealerStats from "./pages/dashboard/AdminDealerStats";
import AdminAnalytics from "./pages/dashboard/AdminAnalytics";
import PrivacyPolicy from "./pages/privacy-policy/PrivacyPolicy";
import TermsOfService from "./pages/terms-conditions/TermsOfService";
import DealershipAgreement from "./pages/dealership-agreement/DealershipAgreement";
import PrivateRoute from "./components/auth/PrivateRoute";
import RegisterRoute from "./components/auth/RegisterRoute";
import UnauthorizedPage from "./components/auth/Unauthorized";
import { useEffect } from "react";


function App() {
  const { user } = useSelector((state) => state.user);
  const expiration = localStorage.getItem("authExpiration");
  const isExpired = expiration && Date.now() > parseInt(expiration);
  const isLoggedIn = user && !isExpired;

  useEffect(() => {
    console.log(import.meta.env.VITE_ENV)
  }, [])

  return (
    <SearchProvider>
      <SSEProvider>
        <div className="min-h-screen bg-slate-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
              borderRadius: "12px",
              padding: "16px",
              fontSize: "14px",
              fontWeight: "500",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
          containerStyle={{
            marginTop: "60px",
          }}
        />

        {/* {!hideHeaderFooter && <Header />} */}

        <main className="pt-0 bg-white">
          {/* <ScrollToTop /> */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/register" element={<RegisterRoute />} />
            <Route path="/register/:invitations" element={<RegisterRoute />} />
            {/* Public Routes */}
            {/* <Route path="/" element={<HomePage />} /> */}
            {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}
            {/* <Route path="/terms-of-service" element={<TermsOfService />} /> */}
            {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
            {/* <Route path="/cookies-policy" element={<CookiesPolicy />} /> */}
            {/* <Route path="/faq" element={<FAQ />} /> */}
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/live-sessions"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <LiveSessions />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/live-auctions"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <LiveAuctions />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/won-auctions"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <WonAuctions />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/new-customers"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <NewCustomers />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Appointments />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/my-bids"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <MyBids />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/highest-bids"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <HighestBids />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/active-customers"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <ActiveCustomers />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Inventory />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dealership-users"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <DealershipUsers />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dealerships"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <DealerShips />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/invited-dealerships"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <InvitedDealerships />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/subscription-cancellation-requests"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SubscriptionCancellationRequests />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/partner-dealers"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <PartnerDealers />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/sales-managers"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SalesManagers />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/reverse-bidding"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <LiveSessions />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/reverse-bidding/session/:sessionId"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <SessionLeaderboard />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/won-sessions"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <WonSessions />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/my-reverse-bids"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <MyReverseBids />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/sessions"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminSessions />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/sessions/:id"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminSessionDetails />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dealer-stats"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminDealerStats />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <AdminAnalytics />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Customers />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/vehicle-details/:id"
              element={
                <PrivateRoute>
                  <DashboardLayout>
                    <VehicleDetails />
                  </DashboardLayout>
                </PrivateRoute>
              }
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsOfService />} />
            <Route
              path="/dealership-agreement"
              element={<DealershipAgreement />}
            />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
          </Routes>
        </main>

        {/* {!hideHeaderFooter && <Footer />} */}

        {/* Back to Top Button - Only for public pages */}
        {/* {!hideHeaderFooter && <BackToTop />} */}
        <BackToTop />
      </div>
      </SSEProvider>
    </SearchProvider>
  );
}

export default App;
