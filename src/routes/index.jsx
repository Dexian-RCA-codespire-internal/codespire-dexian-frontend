import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Dashboard from '../pages/Dashboard'
import RCADashboard from '../pages/RCADashboard'
import Complaint from '../pages/Complaint'
import Investigation from '../pages/Investigation'
import Analysis from '../pages/Analysis'
import Resolution from '../pages/Resolution'
import PatternDetector from '../pages/PatternDetector'
import PlaybookRecommender from '../pages/PlaybookRecommender'
import CustomerRCASummary from '../pages/CustomerRCASummary'
import AlertCorrelation from '../pages/AlertCorrelation'
import ComplianceAudit from '../pages/ComplianceAudit'
import AddIntegration from '../pages/ai-rca-guidance/AddIntegration'
import NewTickets from '../pages/NewTickets'

import Login from '../pages/Auth/Login.jsx'
import Register from '../pages/Auth/Register.jsx'
export default function RoutesIndex() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="rca-dashboard" element={<RCADashboard />} />
        <Route path="complaint/:ticketId" element={<Complaint />} />
        <Route path="investigation/:ticketId" element={<Investigation />} />
        <Route path="analysis/:ticketId" element={<Analysis />} />
        <Route path="resolution/:ticketId" element={<Resolution />} />
        <Route path="new-tickets" element={<NewTickets />} />
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
