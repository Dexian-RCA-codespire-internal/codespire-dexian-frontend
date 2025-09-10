import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SessionAuth } from 'supertokens-auth-react/recipe/session'
import MainLayout from '../components/layout/MainLayout'
import Dashboard from '../pages/Dashboard'
import RCADashboard from '../pages/RCADashboard'
import PatternDetector from '../pages/PatternDetector'
import PlaybookRecommender from '../pages/PlaybookRecommender'
import CustomerRCASummary from '../pages/CustomerRCASummary'
import AlertCorrelation from '../pages/AlertCorrelation'
import ComplianceAudit from '../pages/ComplianceAudit'
import Item1 from '../pages/ai-rca-guidance/Item1'
import Item2 from '../pages/ai-rca-guidance/Item2'
import Item3 from '../pages/ai-rca-guidance/Item3'
import AddIntegration from '../pages/ai-rca-guidance/AddIntegration'

import Login from '../pages/Auth/Login.jsx'
import Register from '../pages/Auth/Register.jsx'
import VerifyOTP from '../pages/Auth/VerifyOTP.jsx'
import VerifyMagicLink from '../pages/Auth/VerifyMagicLink.jsx'

export default function RoutesIndex() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/verify-magic-link/:token" element={<VerifyMagicLink />} />
      
      {/* Handle SuperTokens auth redirects */}
      <Route path="/auth" element={<Login />} />
      <Route path="/auth/*" element={<Login />} />
      
      {/* Protected routes - wrapped with SessionAuth */}
      <Route path="/" element={
        <SessionAuth>
          <MainLayout />
        </SessionAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="rca-dashboard" element={<RCADashboard />} />
        <Route path="ai-rca-guidance/item1" element={<Item1 />} />
        <Route path="ai-rca-guidance/item2" element={<Item2 />} />
        <Route path="ai-rca-guidance/item3" element={<Item3 />} />
        <Route path="ai-rca-guidance/add-integration" element={<AddIntegration />} />
        <Route path="pattern-detector" element={<PatternDetector />} />
        <Route path="playbook-recommender" element={<PlaybookRecommender />} />
        <Route path="customer-rca-summary" element={<CustomerRCASummary />} />
        <Route path="alert-correlation" element={<AlertCorrelation />} />
        <Route path="compliance-audit" element={<ComplianceAudit />} />
      </Route>
    </Routes>
  )
}
