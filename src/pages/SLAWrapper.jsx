import React from 'react'
import { isFeatureEnabled } from '../config/navigation'
import SLA from './sla/SLA'
import FeatureUnavailable from '../components/common/FeatureUnavailable'

const SLAWrapper = () => {
  // Check if SLA feature is enabled
  if (!isFeatureEnabled('sla')) {
    return (
      <FeatureUnavailable 
        featureName="SLA Management"
        featureDescription="SLA Management helps you monitor tickets approaching their Service Level Agreement deadlines and track compliance across different priority levels."
      />
    )
  }

  // If feature is enabled, render the actual SLA page
  return <SLA />
}

export default SLAWrapper