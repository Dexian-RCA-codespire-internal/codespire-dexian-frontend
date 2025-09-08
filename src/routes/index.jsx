import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
export default function RoutesIndex() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/login" element={<Login />} />
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
