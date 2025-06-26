// app/[lang]/dashboards/analytics/page.tsx
'use client'

import React, { useState } from 'react'
import { Grid, Box, Button, Typography } from '@mui/material'

// Your existing view components
import Dashboard from '@/views/dashboards/analytics/Dashboard'
import Profile from '@/views/dashboards/analytics/Profile'
import Leave from '@/views/dashboards/analytics/Leave'
import Attendance from '@/views/dashboards/analytics/Attendance'

const AnalyticsPage = () => {
  const [activePage, setActivePage] = useState('Dashboard')

  const handleMenuItemClick = (page: string) => {
    setActivePage(page)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />
      case 'Profile':
        return <Profile />
      case 'Leave':
        return <Leave />
      case 'Attendance':
        return <Attendance />
      default:
        return <Dashboard />
    }
  }

  return (
    <Box>
      {/* Temporary navigation buttons for testing */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {['Dashboard', 'Profile', 'Leave', 'Attendance'].map((page) => (
          <Button
            key={page}
            variant={activePage === page ? 'contained' : 'outlined'}
            onClick={() => handleMenuItemClick(page)}
            size="small"
          >
            {page}
          </Button>
        ))}
      </Box>

      <Grid container spacing={6}>
        <Grid item xs={12}>
          {renderPage()}
        </Grid>
      </Grid>
    </Box>
  )
}

export default AnalyticsPage
