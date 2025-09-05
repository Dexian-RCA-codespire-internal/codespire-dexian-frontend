import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Dashboard from '../pages/Dashboard'
import RCADashboard from '../pages/RCADashboard'
import AIRCAGuidance from '../pages/AIRCAGuidance'
import PatternDetector from '../pages/PatternDetector'
import PlaybookRecommender from '../pages/PlaybookRecommender'
import CustomerRCASummary from '../pages/CustomerRCASummary'
import AlertCorrelation from '../pages/AlertCorrelation'
import ComplianceAudit from '../pages/ComplianceAudit'

export default function RoutesIndex() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="rca-dashboard" element={<RCADashboard />} />
        <Route path="ai-rca-guidance" element={<AIRCAGuidance />} />
        <Route path="pattern-detector" element={<PatternDetector />} />
        <Route path="playbook-recommender" element={<PlaybookRecommender />} />
        <Route path="customer-rca-summary" element={<CustomerRCASummary />} />
        <Route path="alert-correlation" element={<AlertCorrelation />} />
        <Route path="compliance-audit" element={<ComplianceAudit />} />
      </Route>
    </Routes>
  )
}
