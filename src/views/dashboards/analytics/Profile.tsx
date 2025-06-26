'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// State and Effect Imports
import { useState, useEffect } from 'react'
import axios from 'axios'

// Sample data in case profileData is not available
const series = [{ data: [5, 3, 2, 1] }]

const Profile = () => {
  // Hook
  const theme = useTheme()

  // State for profile data
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:4000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProfileData(response.data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    grid: {
      show: false,
      padding: {
        bottom: 20
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityTo: 0,
        opacityFrom: 1,
        shadeIntensity: 1,
        stops: [0, 100],
        colorStops: [
          [
            {
              offset: 0,
              opacity: 0.4,
              color: theme.palette.success.main
            },
            {
              opacity: 0,
              offset: 100,
              color: 'var(--mui-palette-background-paper)'
            }
          ]
        ]
      }
    },
    theme: {
      monochrome: {
        enabled: true,
        shadeTo: 'light',
        shadeIntensity: 1,
        color: theme.palette.success.main
      }
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: { show: false }
  }

  if (loading) {
    return (
      <Card className='pbe-6'>
        <CardContent>
          <Typography>Loading profile data...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (!profileData) {
    return (
      <Card className='pbe-6'>
        <CardContent>
          <Typography>Error loading profile data</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='pbe-6'>
      <CardHeader title='Profile Overview' className='pbe-3' />
      <CardContent>
        <Typography>Total Leave Types Available</Typography>
        <Typography variant='h4'>{profileData?.leaveConfigs?.length || 0}</Typography>
      </CardContent>
      <AppReactApexCharts
        type='area'
        height={88}
        width='100%'
        series={[{ data: profileData?.leaveConfigs?.map((_: any) => Math.floor(Math.random() * 10)) || [5, 3, 2, 1] }]}
        options={options}
      />
    </Card>
  )
}

export default Profile
