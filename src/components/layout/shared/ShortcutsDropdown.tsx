'use client'

// React Imports
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

// MUI Imports
import { Icon } from '@iconify/react'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Hook Imports
import { useAppDetails } from '@/hooks/useAppDetails' // Updated import

// Next-Auth Imports
import themeConfig from '@/configs/themeConfig'

export type ShortcutsType = {
  url: string
  icon: string
  title: string
  subtitle?: string
  roleKey?: string  // Added roleKey to the interface
}

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return (
      <div className='overflow-x-hidden' style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {children}
      </div>
    )
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const ShortcutsDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [filteredShortcuts, setFilteredShortcuts] = useState<ShortcutsType[]>([])

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)
  const popperRef = useRef<HTMLDivElement | null>(null)

  // Hooks
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  // Use the custom useAppDetails hook
  const { appDetails, loading } = useAppDetails()

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleToggle = useCallback(() => {
    setOpen(prevOpen => !prevOpen)
  }, [])

  // Handle clicks outside the Popper
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popperRef.current &&
        !popperRef.current.contains(event.target as Node) &&
        !anchorRef.current?.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Adjust Popper height on window resize
  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (popperRef.current) {
        // Calculate available height, subtracting any fixed UI elements' height as necessary
        const availableHeight = window.innerHeight - 100

        popperRef.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    adjustPopoverHeight()
    window.addEventListener('resize', adjustPopoverHeight)

    return () => {
      window.removeEventListener('resize', adjustPopoverHeight)
    }
  }, [])

  // Map application details to ShortcutsType
  useEffect(() => {
    if (loading) {
      // Optionally, you can handle loading state here (e.g., show a spinner)
      return
    }

    if (appDetails && appDetails.length > 0) {
      const mappedShortcuts: ShortcutsType[] = appDetails.map(app => ({
        url: getAppUrl(app.applicationName),
        icon: getAppIcon(app.applicationName),
        title: app.applicationName,
        roleKey: app.roleDetails[0]?.roleKey // Include roleKey from the first role detail
      }))

      setFilteredShortcuts(mappedShortcuts)
    } else {
      setFilteredShortcuts([]) // Clear shortcuts if no appDetails are available
      // Optionally, you can show a notification or handle this state as needed
    }
  }, [appDetails, loading])

  // Helper functions to determine URL and Icon based on application name
  const getAppUrl = (appName: string): string => {
    const appUrlMapping: Record<string, string> = {
      Administration: '/en/dashboards/analytics',
      UtilityBilling: '/en/dashboards/analytics',

      // Add other mappings as needed
    }

    return appUrlMapping[appName] || '/en/dashboards/analytics'
  }

  const getAppIcon = (appName: string): string => {
    const appIconMapping: Record<string, string> = {
      Backflow: 'mdi:pipe-valve',
      Administration: 'eos-icons:admin',

      // Add other mappings as needed
    }

    return appIconMapping[appName] || 'bx:info-circle'
  }

  // Update localStorage with the selected app and navigate
  const handleAppClick = (shortcut: ShortcutsType) => {
    localStorage.setItem('currentAppType', shortcut.title)
    localStorage.setItem('applicationType', shortcut.title)

    if (shortcut.roleKey) {
      localStorage.setItem('roleKey', shortcut.roleKey)
    }

    window.location.href = shortcut.url // Navigate to selected app URL
  }

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className='text-textPrimary' disabled={loading}>
        {/* Optionally, show a loading spinner when loading */}
        {loading ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        ) : (
          <i className='tabler-layout-grid-add' />
        )}
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={popperRef}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full !mbs-3 z-[1] max-bs-[517px]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    padding: themeConfig.layoutPadding
                  }
                }
              ]
            }
          : { className: 'is-96 !mbs-3 z-[1] max-bs-[517px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper className={classnames('bs-full', 'border shadow-none', 'shadow-lg')}>
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col' style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {/* Shortcuts List */}
                  <ScrollWrapper hidden={hidden}>
                    <Grid container>
                      {filteredShortcuts.length > 0 ? (
                        filteredShortcuts.map((shortcut, index) => (
                          <Grid
                            item
                            xs={12}
                            key={index}
                            onClick={handleClose}
                            className='[&:not(:last-of-type):not(:nth-last-of-type(2))]:border-be odd:border-ie'
                          >
                            <div
                              onClick={() => handleAppClick(shortcut)}
                              className='flex items-center p-4 gap-4 cursor-pointer hover:bg-actionHover transition-colors duration-200'
                            >
                              <Icon icon={shortcut.icon} fontSize={32} color='inherit' />
                              <Typography variant='subtitle1' sx={{ fontWeight: 500 }}>
                                {shortcut.title}
                              </Typography>
                            </div>
                          </Grid>
                        ))
                      ) : (
                        <Grid item xs={12}>
                          <Typography variant='h6' color='error' align='center' p={2}>
                            No shortcuts available.
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </ScrollWrapper>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default ShortcutsDropdown
