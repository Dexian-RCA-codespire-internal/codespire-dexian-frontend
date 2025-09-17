import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SessionAuth } from 'supertokens-auth-react/recipe/session'
import MainLayout from '../components/layout/MainLayout'
import Dashboard from '../pages/Dashboard'
import RCADashboard from '../pages/RCADashboard'
import Investigation from '../pages/Investigation'
import Resolution from '../pages/Resolution'
import CompleteRCA from '../pages/CompleteRCA'
import PatternDetector from '../pages/PatternDetector'
import PlaybookRecommender from '../pages/PlaybookRecommender'
import CustomerRCASummary from '../pages/CustomerRCASummary'
import AlertCorrelation from '../pages/AlertCorrelation'
import ComplianceAudit from '../pages/ComplianceAudit'
import AddIntegration from '../pages/ai-rca-guidance/AddIntegration'
import ChartBot from '../components/ChartBot'
import { isFeatureEnabled } from '../config/navigation'

import Login from '../pages/Auth/Login.jsx'
import Register from '../pages/Auth/Register.jsx'
import ForgetPassword from '../pages/Auth/ForgetPassword.jsx'
import ResetPassword from '../pages/Auth/ResetPassword.jsx'
import VerifyPasswordResetOTP from '../pages/Auth/VerifyPasswordResetOTP.jsx'
import ResetPasswordWithOTP from '../pages/Auth/ResetPasswordWithOTP.jsx'
import VerifyOTP from '../pages/Auth/VerifyOTP.jsx'
import VerifyMagicLink from '../pages/Auth/VerifyMagicLink.jsx'

export default function RoutesIndex() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-password-reset-otp" element={<VerifyPasswordResetOTP />} />
      <Route path="/reset-password-with-otp" element={<ResetPasswordWithOTP />} />
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
        <Route path="investigation/:ticketId" element={<Investigation />} />
        <Route path="analysis/:id/:ticketId" element={<Analysis />} />
        <Route path="resolution/:ticketId" element={<Resolution />} />
        <Route path="complete-rca/:ticketId" element={<CompleteRCA />} />
        <Route path="ai-rca-guidance/add-integration" element={<AddIntegration />} />
        <Route path="chart-bot" element={<ChartBot />} />
        {isFeatureEnabled('patternDetector') && <Route path="pattern-detector" element={<PatternDetector />} />}
        {isFeatureEnabled('playbookRecommender') && <Route path="playbook-recommender" element={<PlaybookRecommender />} />}
        {isFeatureEnabled('customerRcaSummary') && <Route path="customer-rca-summary" element={<CustomerRCASummary />} />}
        {isFeatureEnabled('alertCorrelation') && <Route path="alert-correlation" element={<AlertCorrelation />} />}
        {isFeatureEnabled('complianceAudit') && <Route path="compliance-audit" element={<ComplianceAudit />} />}
      </Route>
    </Routes>
  )
}
