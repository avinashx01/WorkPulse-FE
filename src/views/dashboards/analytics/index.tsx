'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import EarningReports from './Dashboard'
import LineAreaDailySalesChart from './Profile'
import MonthlyCampaignState from './Attendance'
import ProjectsTable from './Leave'
import SalesByCountries from './SalesByCountries'
import SalesOverview from './SalesOverview'
import SourceVisits from './SourceVisits'
import TotalEarning from './TotalEarning'
import WebsiteAnalyticsSlider from './WebsiteAnalyticsSlider'

const AnalyticsDashboard = () => {
  // States (example state for potential interactivity, adjust as needed)
  const [filter, setFilter] = useState('')

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4}>
        <TotalEarning />
      </Grid>
      <Grid item xs={12} md={8}>
        <EarningReports />
      </Grid>
      <Grid item xs={12} md={6}>
        <LineAreaDailySalesChart />
      </Grid>
      <Grid item xs={12} md={6}>
        <SalesOverview />
      </Grid>
      <Grid item xs={12} md={4}>
        <MonthlyCampaignState />
      </Grid>
      <Grid item xs={12} md={8}>
        <SalesByCountries />
      </Grid>
      <Grid item xs={12}>
        <ProjectsTable />
      </Grid>
      <Grid item xs={12}>
        <SourceVisits />
      </Grid>
      <Grid item xs={12}>
        <WebsiteAnalyticsSlider />
      </Grid>
    </Grid>
  )
}

export default AnalyticsDashboard
