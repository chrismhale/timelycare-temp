import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import PublicListings from "@/pages/PublicListings";
import AgentDashboard from "@/pages/AgentDashboard";
import InquiryForm from "@/components/InquiryForm";
import LoginPage from "@/pages/LoginPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "@/components/Toaster";
import SiteHeader from '@/components/SiteHeader';
import PropertyDetails from '@/pages/PropertyDetails';

function App() {
  const location = useLocation();

  return (
    <>
      <Toaster />
      <SiteHeader />

      <main className="min-h-screen">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PublicListings />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/inquiry/:propertyId" element={<InquiryForm />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App; 