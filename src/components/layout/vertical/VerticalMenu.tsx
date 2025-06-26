'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  TextField,
  Menu,
  MenuItem as MuiMenuItem
} from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { Menu as VerticalMenuComponent, MenuItem } from '@menu/vertical-menu'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

// Styled Components
const Navbar = styled(Paper)(({ theme }) => ({
  width: '260px',
  height: '100vh',
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: '20px 16px',
  position: 'fixed',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  zIndex: 1000,
  boxShadow: theme.shadows[3],
  borderRight: `1px solid ${theme.palette.divider}`
}))

const TimerSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
  padding: '16px',
  borderRadius: '8px',
  textAlign: 'center',
  marginBottom: '20px',
  width: '100%',
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`
}))

const MainContent = styled(Box)(({ theme }) => ({
  marginLeft: '260px',
  marginTop: '0',
  padding: '24px',
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  width: 'calc(100% - 260px)',
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    width: '100%'
  }
}))

// Define the Props type
type Props = {
  children: ReactNode
  settings: {
    saveSettings: (settings: any) => void
    settings: {
      mode: 'light' | 'dark'
    }
  }
  onMenuItemClick: (page: string) => void
  activePage: string
}

const VerticalMenu = ({ children, settings, onMenuItemClick, activePage }: Props) => {
  const theme = useTheme()
  const router = useRouter()
  const [time, setTime] = useState('00:00:00')
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [lastDate, setLastDate] = useState<string>(new Date().toISOString().split('T')[0])
  const open = Boolean(anchorEl)

  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4000'

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleModeChange = (mode: 'light' | 'dark') => {
    settings.saveSettings({ ...settings.settings, mode })
    handleClose()
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const parseTimeToMs = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return (hours * 3600 + minutes * 60) * 1000
  }

  const fetchAttendance = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      toast.error('Please log in to continue')
      router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    try {
      const response = await fetch(`${API_URL}/attendance/current`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token')
          toast.error('Session expired. Please log in again.')
          router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text) {
        setTime('00:00:00')
        setIsRunning(false)
        setStartTime(null)
        return
      }

      const data = JSON.parse(text)
      if (data && data.id) {
        setIsRunning(data.isRunning)
        const elapsedMs = data.elapsedTimeMs || 0
        setTime(formatTime(elapsedMs))
        if (data.isRunning) {
          const totalWorkedMs = parseTimeToMs(data.totalWorkedHours)
          setStartTime(Date.now() - (elapsedMs - totalWorkedMs))
        } else {
          setStartTime(null)
        }
      } else {
        setTime('00:00:00')
        setIsRunning(false)
        setStartTime(null)
      }
    } catch (error) {
      console.error('Fetch attendance error:', error)
      toast.error('Error fetching attendance: ' + (error as Error).message)
    }
  }

  const checkDailyReset = () => {
    const currentDate = new Date().toISOString().split('T')[0]
    if (currentDate !== lastDate) {
      setTime('00:00:00')
      setIsRunning(false)
      setStartTime(null)
      setLastDate(currentDate)
      fetchAttendance()
    }
  }

  useEffect(() => {
    fetchAttendance()
    const interval = setInterval(checkDailyReset, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        setTime(formatTime(elapsed))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, startTime])

  const handleCheckIn = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      toast.error('Please log in to continue')
      router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    try {
      const response = await fetch(`${API_URL}/attendance/checkin`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workDate: new Date().toISOString().split('T')[0]
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token')
          toast.error('Session expired. Please log in again.')
          router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.message || 'Check-in failed')
      }

      const data = await response.json()
      const totalWorkedMs = parseTimeToMs(data.totalWorkedHours)
      setStartTime(Date.now() - totalWorkedMs)
      setIsRunning(true)
      setTime(formatTime(totalWorkedMs))
      toast.success('Checked in successfully')
    } catch (error) {
      toast.error('Check-in failed: ' + (error as Error).message)
    }
  }

  const handleCheckOut = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      toast.error('Please log in to continue')
      router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    try {
      const currentDate = new Date().toISOString().split('T')[0]
      const response = await fetch(`${API_URL}/attendance/checkout/${currentDate}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token')
          toast.error('Session expired. Please log in again.')
          router.push(`/en/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.message || 'Check-out failed')
      }

      const data = await response.json()
      setIsRunning(false)
      setStartTime(null)
      setTime(formatTime(parseTimeToMs(data.totalWorkedHours)))
      toast.success('Checked out successfully')
    } catch (error) {
      toast.error('Check-out failed: ' + (error as Error).message)
    }
  }

  const menuItems = [
    { type: 'MenuItem', label: 'Dashboard', moduleKey: 'Dashboard', icon: 'oui:app-dashboard' },
    { type: 'MenuItem', label: 'Profile', moduleKey: 'Profile', icon: 'mdi:account-circle' },
    { type: 'MenuItem', label: 'Leave', moduleKey: 'Leave', icon: 'mdi:calendar-account-outline' },
    { type: 'MenuItem', label: 'Attendance', moduleKey: 'Attendance', icon: 'mdi:account-check-outline' }
  ]

  const renderMenuItems = (items: any[]) => {
    return items.map((item, index) => {
      if (item.type === 'MenuItem') {
        return (
          <MenuItem
            key={`item-${item.label}-${index}`}
            icon={<Icon icon={item.icon} />}
            onClick={() => onMenuItemClick(item.label)}
            sx={{
              width: '100%',
              marginBottom: '8px',
              borderRadius: '6px',
              transition: 'all 0.3s ease',
              backgroundColor:
                activePage === item.label ? theme.palette.action.selected : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                transform: 'translateX(5px)'
              }
            }}
          >
            {item.label}
          </MenuItem>
        )
      }
      return null
    })
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Navbar elevation={0}>
        <TimerSection>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            Work Schedule
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: '1.75rem' }}>
            {time}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckIn}
              size="small"
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                py: 0.5
              }}
            >
              Check-in
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCheckOut}
              size="small"
              disabled={!isRunning}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                py: 0.5
              }}
            >
              Check-out
            </Button>
          </Box>
        </TimerSection>

        <Box sx={{ width: '100%', mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="mdi:search" width={18} height={18} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery('')} size="small">
                    <Icon icon="mdi:close" width={16} height={16} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '& fieldset': {
                  borderColor: theme.palette.divider
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.light
                }
              }
            }}
          />

          <PerfectScrollbar options={{ wheelPropagation: false, suppressScrollX: true }}>
            <VerticalMenuComponent
              popoutMenuOffset={{ mainAxis: 23 }}
              sx={{
                '& .MuiMenuItem-root': {
                  padding: '10px 16px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    transform: 'translateX(5px)'
                  }
                }
              }}
            >
              {renderMenuItems(menuItems)}
            </VerticalMenuComponent>
          </PerfectScrollbar>
        </Box>

        <Box sx={{ mt: 'auto', width: '100%', display: 'flex', justifyContent: 'center', pb: 2 }}>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <Icon
              icon={
                theme.palette.mode === 'dark' ? 'mdi:weather-night' : 'mdi:weather-sunny'
              }
              fontSize={20}
            />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0
                }
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MuiMenuItem
              onClick={() => handleModeChange('light')}
              sx={{
                color: theme.palette.mode === 'light' ? theme.palette.primary.main : 'inherit',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <Icon icon="mdi:weather-sunny" fontSize={20} style={{ marginRight: 8 }} />
              Light
            </MuiMenuItem>
            <MuiMenuItem
              onClick={() => handleModeChange('dark')}
              sx={{
                color: theme.palette.mode === 'dark' ? theme.palette.primary.main : 'inherit',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <Icon icon="mdi:weather-night" fontSize={20} style={{ marginRight: 8 }} />
              Dark
            </MuiMenuItem>
          </Menu>
        </Box>
      </Navbar>

      <MainContent>{children}</MainContent>
    </Box>
  )
}

export default VerticalMenu
