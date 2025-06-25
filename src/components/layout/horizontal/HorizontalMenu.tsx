'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTheme } from '@mui/material/styles'
import { useSession } from 'next-auth/react'

import { PureAbility } from '@casl/ability'

import { Icon } from '@iconify/react'

import { IconButton, InputAdornment, TextField } from '@mui/material'

import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalMenuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import VerticalNavContent from './VerticalNavContent'
import type { VerticalNavItem } from '../vertical/VerticalMenu'
import { useAppDetails } from '@/hooks/useAppDetails'

import { buildAbilityFor, PageIdentifier, type Subjects, type AppAbility } from '@/configs/acl'
import { AbilityContext } from '@/components/layout/acl/Can'

type HorizontalNavItemsType = VerticalNavItem[]

type RenderExpandIconProps = {
  level?: number
}

type RenderVerticalExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

const RenderExpandIcon = ({ level }: RenderExpandIconProps) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='tabler-chevron-right' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }: RenderVerticalExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = () => {
  const verticalNavOptions = useVerticalNav()
  const { appDetails } = useAppDetails()
  const theme = useTheme()
  const { data: session } = useSession()
  const [currentAppType, setCurrentAppType] = useState<string | null>(null)

  const [role, setRole] = useState<string | null>(null)

  const { transitionDuration } = verticalNavOptions

  const [ability, setAbility] = useState<AppAbility | undefined>(undefined)

  // State for Short Name
  const [utilityName, setUtilityName] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    if (appDetails) {
      const newAbility = buildAbilityFor(appDetails)

      setAbility(newAbility)
    }
  }, [appDetails])

  const canAccess = useCallback(
    (moduleKey: string): boolean => {
      if (!ability) return false

      // Check if moduleKey exists in the values of PageIdentifier
      const isValidPage = Object.values(PageIdentifier).includes(moduleKey as PageIdentifier)

      if (!isValidPage) return false

      // Explicitly cast moduleKey to Subjects type
      return ability.can('manage', moduleKey as Subjects)
    },
    [ability]
  )

  const defaultAbility = new PureAbility()

  const addLanguagePrefix = (href: string): string => {
    if (!href) return ''

    return `/en${href}`
  }

  useEffect(() => {
    if (appDetails) {
      const hostname = window.location.hostname
      const utilityName = hostname.split('.')[0]

      setUtilityName(utilityName)

      const roleSpecificData = appDetails.map((item: any) => item.applicationName) || []
      const appData = Array.isArray(roleSpecificData) ? roleSpecificData : JSON.parse(roleSpecificData)
      const currentAppTypeLocal = window.localStorage.getItem('applicationType')
      const filteredApp = appData.find((app: string) => app === currentAppTypeLocal)

      if (filteredApp) {
        setCurrentAppType(filteredApp)
      } else {
        setCurrentAppType(currentAppTypeLocal || '')
      }

      const role = localStorage.getItem('roleKey')

      setRole(role)
    }
  }, [appDetails, session, setUtilityName])

  const roleSpecificData = useMemo(() => appDetails || [], [appDetails])

  //* System Admin Nav Bar *//
  const handleAdministrationMenu = useCallback((): HorizontalNavItemsType => {
    const AdministrationApp = roleSpecificData.find(app => app.applicationName === 'Administration')

    if (!AdministrationApp) return []

    //    const menuItems: HorizontalNavItemsType = []

    const menuConfig: HorizontalNavItemsType = [
      {
        type: 'MenuItem',
        label: 'Dashboard',
        icon: 'oui:app-dashboard',
        href: addLanguagePrefix('/dashboards/analytics'),
        moduleKey: 'Dashboard'
      },

      // {
      //   type: 'MenuItem',
      //   label: 'Role Management',
      //   icon: 'oui:app-users-roles',
      //   href: addLanguagePrefix('/administration/roleManagement'),
      //   moduleKey: 'Role Management'
      // },
      // {
      //   type: 'MenuItem',
      //   label: 'User Management',
      //   icon: 'flowbite:users-outline',
      //   href: addLanguagePrefix('/administration/userManagement'),
      //   moduleKey: 'User Management'
      // },
      // {
      //   type: 'MenuItem',
      //   label: 'Account Users',
      //   icon: 'ri:account-box-2-line',
      //   href: addLanguagePrefix('/administration/accountUserManagement'),
      //   moduleKey: 'Account Users'
      // },

      // {
      //   type: 'MenuItem',
      //   label: 'Employees',
      //   icon: 'clarity:employee-group-line',
      //   href: addLanguagePrefix('/administration/employees'),
      //   moduleKey: 'Employees'
      // },
      {
        type: 'MenuItem',
        label: 'Configuration',
        icon: 'carbon:document-configuration',
        href: addLanguagePrefix('/administration/configuration'),
        moduleKey: 'Configuration'
      },
      {
        type: 'MenuItem',

        // type: 'SubMenu',

        label: 'Settings',
        icon: 'mdi:settings-outline', //'mdi:shield-account',
        href: addLanguagePrefix('/pages/account-settings/profile'),
        moduleKey: 'Settings'

        // children: [
        //   {
        //     type: 'MenuItem',
        //     label: 'Profile',
        //     icon: 'mdi:account-circle',
        //     href: addLanguagePrefix('/pages/account-settings/profile')
        //   }

        // ]
      }
    ]

    // menuConfig.forEach(item => {
    //   if (item.type === 'MenuItem') {
    //     if (
    //       AdministrationApp &&
    //       AdministrationApp.roleDetails &&
    //       AdministrationApp.roleDetails.some(role => role.moduleData.some(module => module?.moduleKey === item.label))
    //     ) {
    //       menuItems.push(item)
    //     }
    //   }

    // })

    if (utilityName !== 'ubblmdev')
      menuConfig.push (

      {
            type: 'MenuItem',
            label: 'Role Management',
            icon: 'oui:app-users-roles',
            href: addLanguagePrefix('/administration/roleManagement'),
            moduleKey: 'Role Management'
          },
          {
            type: 'MenuItem',
            label: 'User Management',
            icon: 'flowbite:users-outline',
            href: addLanguagePrefix('/administration/userManagement'),
            moduleKey: 'User Management'
          },
          {
            type: 'MenuItem',
            label: 'Account Users',
            icon: 'ri:account-box-2-line',
            href: addLanguagePrefix('/administration/accountUserManagement'),
            moduleKey: 'Account Users'
          },
          {
            type: 'MenuItem',
            label: 'Employees',
            icon: 'clarity:employee-group-line',
            href: addLanguagePrefix('/administration/employees'),
            moduleKey: 'Employees'
          }

      )



    // return menuItems

    return menuConfig
      .map(item => {
        if (item.type === 'MenuItem') {
          const moduleExists = AdministrationApp?.roleDetails?.some(role =>
            role.moduleData.some(module => module.moduleKey === item.label)
          )

          const hasAbility = canAccess(item.moduleKey)

          return moduleExists && hasAbility ? item : null
        }

        if (item.type === 'SubMenu' && item.children) {
          const parentHasAccess = canAccess(item.moduleKey)

          if (!parentHasAccess) return null

          const filteredChildren = item.children.filter(subItem => {
            const subModuleExists = AdministrationApp?.roleDetails?.some(role =>
              role.moduleData.some(module =>
                module.subModuleData?.some(subModule => subModule.subModuleKey === subItem.label)
              )
            )

            const childHasAccess = canAccess(subItem.moduleKey)

            return subModuleExists && childHasAccess
          })

          return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
        }

        return null
      })
      .filter(Boolean) as HorizontalNavItemsType
  }, [roleSpecificData, utilityName, canAccess])

  //* Utility Billing Admin Nav Bar *//
  const handleUtilityBillingMenu = useCallback((): HorizontalNavItemsType => {
    const UtilityBillingApp = roleSpecificData.find(app => app.applicationName === 'UtilityBilling')

    if (!UtilityBillingApp) return []

    //  const menuItems: HorizontalNavItemsType = []

    if ((utilityName === 'ubcustdev') || (utilityName === 'ubcustqa') || (utilityName === 'devcusttest')) {

      const menuConfig: HorizontalNavItemsType = [
        {
          type: 'MenuItem',
          label: 'Home Page',
          icon: 'oui:app-dashboard',
          href: addLanguagePrefix('/dashboards/analytics'),
          moduleKey: 'Home Page'
        },
        {
          type: 'MenuItem',
          label: 'Account Details',
          icon: 'ri:account-box-2-line',
          href: addLanguagePrefix('/accountDetails'),
          moduleKey: 'Account Details'
        },
        {
          type: 'MenuItem',
          label: 'Automatic Payments',
          icon: 'mdi:auto-pay', //'mdi:recurring-payment',       //'mdi/recurring-payment',
          href: addLanguagePrefix('/payments/AutomaticPayments'),
          moduleKey: 'Automatic Payments'
        },
        {
          type: 'SubMenu',
          label: 'Requests',
          icon: 'carbon:user-service-desk',
          moduleKey: 'Requests',
          children: [
            {
              type: 'MenuItem',
              label: 'Start Service',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/requests/startService/list'),
              moduleKey: 'Start Service'
            },
            {
              type: 'MenuItem',
              label: 'Stop Service',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/requests/stopService/list'),
              moduleKey: 'Stop Service'
            },
            {
              type: 'MenuItem',
              label: 'Transfer Service',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/requests/transferService/list'),
              moduleKey: 'Transfer Service'
            },

            // {
            //   type: 'MenuItem',
            //   label: 'Request Bulk Pickup',
            //   icon: 'mdi:circle',
            //   href: addLanguagePrefix('/requests/startService/list'),
            //   moduleKey: 'Transfer Service'
            // },
            {
              type: 'MenuItem',
              label: 'Request Bulk Pickup',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/requests/BulkPickUpRequest/list'),
              moduleKey: 'Request Bulk Pickup'
            },
            {
              type: 'MenuItem',
              label: 'Report Missed Collection',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/requests/ReportMissedCollection/list'),
              moduleKey: 'Report Missed Collection'
            },

            // {
            //   type: 'MenuItem',
            //   label: 'Update Personal Information',
            //   icon: 'mdi:circle',
            //   href: addLanguagePrefix('/requests/startService/list'),
            //   moduleKey: 'Update Personal Information'
            // }
          ]
        },
        {
          type: 'MenuItem',
          label: 'Service Request',
          icon: 'material-symbols:home-repair-service-outline-rounded',
          href: addLanguagePrefix('/serviceRequest'),
          moduleKey: 'Service Request'
        },
        {
          type: 'MenuItem',
          label: 'Settings',
          icon: 'mdi:settings-outline',
          href: addLanguagePrefix('/pages/account-settings/profile'),
          moduleKey: 'Settings'
        }
      ]

      return menuConfig
        .map(item => {
          if (item.type === 'MenuItem') {
            const moduleExists = UtilityBillingApp?.roleDetails?.some(role =>
              role.moduleData.some(module => module.moduleKey === item.label)
            )

            const hasAbility = canAccess(item.moduleKey)

            // console.log('Menu Item:', item.moduleKey)
            // console.log('Can Access:', canAccess(item.moduleKey))
            // console.log('Module Exists:', moduleExists)

            return moduleExists && hasAbility ? item : null
          }

          if (item.type === 'SubMenu' && item.children) {
            const parentHasAccess = canAccess(item.moduleKey)

            if (!parentHasAccess) return null

            const filteredChildren = item.children.filter(subItem => {
              const subModuleExists = UtilityBillingApp?.roleDetails?.some(role =>
                role.moduleData.some(module =>
                  module.subModuleData?.some(subModule => subModule.subModuleKey === subItem.label)
                )
              )

              const childHasAccess = canAccess(subItem.moduleKey)

              return subModuleExists && childHasAccess
            })

            return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
          }

          return null
        })
        .filter(Boolean) as HorizontalNavItemsType

      // return menuConfig.map(item => {
      //   if (item.type === 'MenuItem') {
      //     return UtilityBillingApp?.roleDetails?.some(role =>
      //       role.moduleData.some(module => module?.moduleKey === item.label)
      //     ) && canAccess(item.moduleKey) ? item : null
      //   }

      //   if (item.type === 'SubMenu' && item.children) {
      //     const filteredChildren = item.children.filter(subItem =>
      //       UtilityBillingApp?.roleDetails?.some(role =>
      //         role.moduleData.some(module =>
      //           module.subModuleData?.some(subModule =>
      //             subModule.subModuleKey === subItem.label &&
      //             canAccess(subItem.moduleKey)
      //           )
      //         )
      //       )
      //     )

      //     return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
      //   }

      //   return null
      // }).filter(Boolean) as HorizontalNavItemsType
    } else {
      const menuConfig: HorizontalNavItemsType = [
        {
          type: 'MenuItem',
          label: 'Home',
          icon: 'oui:app-dashboard',
          href: addLanguagePrefix('/dashboards/analytics'),
          moduleKey: 'Customers'
        },
        {
          type: 'MenuItem',
          label: 'Customers',
          icon: 'tdesign:user',
          href: addLanguagePrefix('/customers'),
          moduleKey: 'Customers'
        },
        {
          type: 'MenuItem',
          label: 'Accounts',
          icon: 'ri:account-box-2-line',
          href: addLanguagePrefix('/accounts'),
          moduleKey: 'Accounts'
        },
        {
          type: 'MenuItem',
          label: 'Parcel',
          icon: 'lucide:land-plot',
          href: addLanguagePrefix('/parcel'),
          moduleKey: 'Service Orders'
        },
        {
          type: 'MenuItem',
          label: 'Premises',
          icon: 'solar:home-outline',
          href: addLanguagePrefix('/premises'),
          moduleKey: 'Premises'
        },
        {
          type: 'SubMenu',
          label: 'Meters',
          icon: 'icomoon-free:meter',
          moduleKey: 'Meters',
          children: [
            {
              type: 'MenuItem',
              label: 'Meter List',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/meters'),
              moduleKey: 'Meter List'
            },
            {
              type: 'MenuItem',
              label: 'Meter Installation',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/meterInstallation/add'),
              moduleKey: 'Meter Installation'
            },
            {
              type: 'MenuItem',
              label: 'Utility Schedule',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/meterReaderSchedule'),
              moduleKey: 'Utility Schedule'
            },
            {
              type: 'MenuItem',
              label: 'Order Creation',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/meterReadOrderCreation'),
              moduleKey: 'Order Creation'
            },
            {
              type: 'MenuItem',
              label: 'Mass Meter Order',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/massMeterOrder'),
              moduleKey: 'Order Creation'
            },
            {
              type: 'MenuItem',
              label: 'Meter Readings',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/meterReadings'),
              moduleKey: 'Meter Readings'
            },
            {
              type: 'MenuItem',
              label: 'Meter Removal',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/meterInstallation/removal'),
              moduleKey: 'Meter Removal'
            },
            {
              type: 'MenuItem',
              label: 'Meter Reading Validations',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/meterReadingValidations'),
              moduleKey: 'Meter Reading Validations'
            },
            {
              type: 'MenuItem',
              label: 'Meter Replacement',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/meterInstallation/replacement'),
              moduleKey: 'Meter Replacement'
            }
          ]
        },
        {
          type: 'SubMenu',
          label: 'Contracts',
          icon: 'hugeicons:contracts',
          moduleKey: 'Contracts',
          children: [
            {
              type: 'MenuItem',
              label: 'Contract List',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/contract/list'),
              moduleKey: 'Contract List'
            },
            {
              type: 'MenuItem',
              label: 'Start Service',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/contract/add'),
              moduleKey: 'Start Service'
            },
            {
              type: 'MenuItem',
              label: 'Stop Service',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/contract/endOrCancelContract/add'),
              moduleKey: 'Stop Service'
            },
            {
              type: 'MenuItem',
              label: 'Transfer Service',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/contract/transferService/add'),
              moduleKey: 'Transfer Service'
            }
          ]
        },
        {
          type: 'SubMenu',
          label: 'Billing',
          icon: 'flowbite:users-outline',
          moduleKey: 'Billing',
          children: [
            {
              type: 'MenuItem',
              label: 'Billing Document',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/billingDocument/add'),
              moduleKey: 'Billing Document'
            },
            {
              type: 'MenuItem',
              label: 'Mass Billing',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/massBilling'),
              moduleKey: 'Mass Billing'
            },
            {
              type: 'MenuItem',
              label: 'Billing Validations',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/billingValidations'),
              moduleKey: 'Billing Validations'
            }
          ]
        },

        {
          type: 'SubMenu',
          label: 'Invoices',
          icon: 'ri:file-list-3-line',
          moduleKey: 'Invoices',
          children: [
            {
              type: 'MenuItem',
              label: 'Invoice List',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/invoice/list'),
              moduleKey: 'Invoice List'
            },
            {
              type: 'MenuItem',
              label: 'Mass Invoice',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/invoice/massInvoice'),
              moduleKey: 'Mass Invoice'
            }
          ]
        },
        {
          type: 'SubMenu',
          label: 'Payments',
          icon: 'ic:outline-payments',
          moduleKey: 'Payments',
          children: [
            {
              type: 'MenuItem',
              label: 'Payment Lots',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/payments/paymentLot'),
              moduleKey: 'Payment Lots'
            }
          ]
        },
        {
          type: 'SubMenu',
          label: 'Financial Transactions',
          icon: 'carbon:global-loan-and-trial',
          moduleKey: 'Financial Transactions',
          children: [
            {
              type: 'MenuItem',
              label: 'Financial Transactions',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/financialTransaction/list'),
              moduleKey: 'Financial Transactions'
            },
            {
              type: 'MenuItem',
              label: 'Security Deposit',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/financialTransaction/securityDeposit/list'),
              moduleKey: 'Security Deposit'
            }
          ]
        },

        {
          type: 'SubMenu',
          label: 'Requests',
          icon: 'carbon:user-service-desk',
          moduleKey: 'Requests',
          children: [
            // {
            //   type: 'MenuItem',
            //   label: 'Start Service',
            //   icon: 'mdi:circle',
            //   href: addLanguagePrefix('/requests/startService/list'),
            //   moduleKey: 'Start Service'
            // },
            // {
            //   type: 'MenuItem',
            //   label: 'Stop Service',
            //   icon: 'mdi:circle',
            //   href: addLanguagePrefix('/requests/stopService'),
            //   moduleKey: 'Stop Service'
            // },
            // {
            //   type: 'MenuItem',
            //   label: 'Transfer Service',
            //   icon: 'mdi:circle',
            //   href: addLanguagePrefix('/requests/transferService'),
            //   moduleKey: 'Transfer Service'
            // },
            // {
            //   type: 'MenuItem',
            //   label: 'Update Personal Information',
            //   icon: 'mdi:circle',
            //   href: addLanguagePrefix('/requests/updatePersonalInformation'),
            //   moduleKey: 'Update Personal Information'
            // },
            // {
            //   type: 'MenuItem',
            //   label: 'Request Bulk Pickup',
            //   icon: 'mdi:circle',
            //   href: addLanguagePrefix('/requests/requestBulkPickup'),
            //   moduleKey: 'Request Bulk Pickup'
            // },
            // {
            //   type: 'MenuItem',
            //   label: 'Report Missed Collection',
            //   icon: 'mdi:circle',
            //   href: addLanguagePrefix('/requests/missedCollection'),
            //   moduleKey: 'Report Missed Collection'
            // },
            {
              type: 'MenuItem',
              label: 'View All Request',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/requests/viewAllRequest/'),
              moduleKey: 'View All Request'
            }
          ]
        },
        {
          type: 'MenuItem',
          label: 'Service Request',
          icon: 'material-symbols:home-repair-service-outline-rounded',
          href: addLanguagePrefix('/serviceRequest'),
          moduleKey: 'Service Request'
        },

        {
          type: 'MenuItem',
          label: 'Service Orders',
          icon: 'mdi:account-service-outline',
          href: addLanguagePrefix('/serviceOrders'),
          moduleKey: 'Service Orders'
        },

        {
          type: 'SubMenu',
          label: 'Education Events',
          icon: 'ri:file-list-3-line',
          moduleKey: 'Education Events',
          children: [
            {
              type: 'MenuItem',
              label: 'Dashboard',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/educationEvents/dashboard'),
              moduleKey: 'Dashboard'
            },
            {
              type: 'MenuItem',
              label: 'Education Events List',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/educationEvents/list'),
              moduleKey: 'Education Events List'
            }
          ]
        },
        {
          type: 'MenuItem',
          label: 'Reports',
          icon: 'mdi:account-service-outline',
          href: addLanguagePrefix('/reports'),
          moduleKey: 'Reports'
        },
        {
          type: 'MenuItem',
          label: 'Cases',
          icon: 'lucide:land-plot',
          href: addLanguagePrefix('/cases/list'),
          moduleKey: 'Cases'
        },
        {
          type: 'MenuItem',
          label: 'Calendar',
          icon: 'lucide:calendar',
          href: addLanguagePrefix('/calendar'),
          moduleKey: 'Calendar'
        }
      ]

      // return menuConfig.map(item => {
      //   if (item.type === 'MenuItem') {
      //     return UtilityBillingApp?.roleDetails?.some(role =>
      //       role.moduleData.some(module => module?.moduleKey === item.label)
      //     ) && canAccess(item.moduleKey) ? item : null
      //   }

      //   if (item.type === 'SubMenu' && item.children) {
      //     const filteredChildren = item.children.filter(subItem =>
      //       UtilityBillingApp?.roleDetails?.some(role =>
      //         role.moduleData.some(module =>
      //           module.subModuleData?.some(subModule =>
      //             subModule.subModuleKey === subItem.label &&
      //             canAccess(subItem.moduleKey)
      //           )
      //         )
      //       )
      //     )

      //     return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
      //   }

      //   return null
      // }).filter(Boolean) as HorizontalNavItemsType

      //   }

      return menuConfig
        .map(item => {
          if (item.type === 'MenuItem') {
            const moduleExists = UtilityBillingApp?.roleDetails?.some(role =>
              role.moduleData.some(module => module.moduleKey === item.label)
            )

            const hasAbility = canAccess(item.moduleKey)

            return moduleExists && hasAbility ? item : null
          }

          if (item.type === 'SubMenu' && item.children) {
            const parentHasAccess = canAccess(item.moduleKey)

            if (!parentHasAccess) return null

            const filteredChildren = item.children.filter(subItem => {
              const subModuleExists = UtilityBillingApp?.roleDetails?.some(role =>
                role.moduleData.some(module =>
                  module.subModuleData?.some(subModule => subModule.subModuleKey === subItem.label)
                )
              )

              const childHasAccess = canAccess(subItem.moduleKey)

              return subModuleExists && childHasAccess
            })

            return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
          }

          return null
        })
        .filter(Boolean) as HorizontalNavItemsType
    }
  }, [roleSpecificData, utilityName, canAccess])

  //* Super Admin Nav Bar *//

  const handleSuperAdminMenu = useCallback((): HorizontalNavItemsType => {
    const superAdminApp = roleSpecificData.find(app => app.applicationName === 'SuperAdmin')

    if (!superAdminApp) return []

    //    const menuItems: HorizontalNavItemsType = []

    const menuConfig: HorizontalNavItemsType = [
      {
        type: 'MenuItem',
        label: 'Dashboard',
        icon: 'oui:app-dashboard',
        href: addLanguagePrefix('/dashboards/analytics'),
        moduleKey: 'Dashboard'
      },
      {
        type: 'MenuItem',
        label: 'Organization',
        icon: 'oui:app-users-roles',
        href: addLanguagePrefix('/superAdmin/waterPurveyor'),
        moduleKey: 'Organization'
      },
      {
        type: 'MenuItem',
        label: 'Settings',
        icon: 'mdi:settings-outline',
        href: addLanguagePrefix('/pages/account-settings/profile'),
        moduleKey: 'Settings'
      }
    ]

    // menuConfig.forEach(item => {
    //   if (item.type === 'MenuItem') {
    //     if (
    //       superAdminApp &&
    //       superAdminApp.roleDetails &&
    //       superAdminApp.roleDetails.some(role => role.moduleData.some(module => module?.moduleKey === item.label))
    //     ) {
    //       menuItems.push(item)
    //     }
    //   }
    // })

    // return menuItems

    return menuConfig
      .map(item => {
        if (item.type === 'MenuItem') {
          const moduleExists = superAdminApp?.roleDetails?.some(role =>
            role.moduleData.some(module => module.moduleKey === item.label)
          )

          const hasAbility = canAccess(item.moduleKey)

          return moduleExists && hasAbility ? item : null
        }

        if (item.type === 'SubMenu' && item.children) {
          const parentHasAccess = canAccess(item.moduleKey)

          if (!parentHasAccess) return null

          const filteredChildren = item.children.filter(subItem => {
            const subModuleExists = superAdminApp?.roleDetails?.some(role =>
              role.moduleData.some(module =>
                module.subModuleData?.some(subModule => subModule.subModuleKey === subItem.label)
              )
            )

            const childHasAccess = canAccess(subItem.moduleKey)

            return subModuleExists && childHasAccess
          })

          return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
        }

        return null
      })
      .filter(Boolean) as HorizontalNavItemsType
  }, [roleSpecificData, canAccess])

  const handleDispatcherMenu = useCallback((): HorizontalNavItemsType => {
    const dispatcherApp = roleSpecificData.find(app => app.applicationName === 'Dispatcher')

    if (!dispatcherApp) return []

    //   const menuItems: HorizontalNavItemsType = []

    const menuConfig: HorizontalNavItemsType = [
      {
        type: 'MenuItem',
        label: 'Dashboard',
        icon: 'oui:app-dashboard',
        href: addLanguagePrefix('/dashboards/analytics'),
        moduleKey: 'Dashboard'
      },
      {
        type: 'MenuItem',
        label: 'Service Orders',
        icon: 'mdi:account-service-outline',
        href: addLanguagePrefix('/dashboards/analytic'),
        moduleKey: 'Dashboard'
      }
      ,
      {
        type: 'MenuItem',
        label: 'Settings',
        icon: 'mdi:settings-outline', //'mdi:shield-account',
        href: addLanguagePrefix('/pages/account-settings/profile'),
        moduleKey: 'Settings'
      }
    ]

    return menuConfig
      .map(item => {
        if (item.type === 'MenuItem') {
          const moduleExists = dispatcherApp?.roleDetails?.some(role =>
            role.moduleData.some(module => module.moduleKey === item.label)
          )

          const hasAbility = canAccess(item.moduleKey)

          return moduleExists && hasAbility ? item : null
        }

        if (item.type === 'SubMenu' && item.children) {
          const parentHasAccess = canAccess(item.moduleKey)

          if (!parentHasAccess) return null

          const filteredChildren = item.children.filter(subItem => {
            const subModuleExists = dispatcherApp?.roleDetails?.some(role =>
              role.moduleData.some(module =>
                module.subModuleData?.some(subModule => subModule.subModuleKey === subItem.label)
              )
            )

            const childHasAccess = canAccess(subItem.moduleKey)

            return subModuleExists && childHasAccess
          })

          return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
        }

        return null
      })
      .filter(Boolean) as HorizontalNavItemsType

    // menuConfig.forEach(item => {
    //   if (item.type === 'MenuItem') {
    //     if (
    //       dispatcherApp &&
    //       dispatcherApp.roleDetails &&
    //       dispatcherApp.roleDetails.some(role => role.moduleData.some(module => module?.moduleKey === item.label))
    //     ) {
    //       menuItems.push(item)
    //     }
    //   }
    // })

    // return menuItems
  }, [roleSpecificData, canAccess])

  const handleCcAgentMenu = useCallback((): HorizontalNavItemsType => {
    const dispatcherApp = roleSpecificData.find(app => app.applicationName === 'Dispatcher')

    if (!dispatcherApp) return []

    // const menuItems: VerticalNavItemsType = []

    const menuConfig: HorizontalNavItemsType = [
      {
        type: 'MenuItem',
        label: 'Dashboard',
        icon: 'oui:app-dashboard',
        href: addLanguagePrefix('/dashboards/analytics'),
        moduleKey: 'Dashboard'
      },
      {
        type: 'MenuItem',
        label: 'Customers',
        icon: 'tdesign:user',
        href: addLanguagePrefix('/customers'),
        moduleKey: 'Customers'
      },

      {
        type: 'MenuItem',
        label: 'Accounts',
        icon: 'ri:account-box-2-line',
        href: addLanguagePrefix('/accounts'),
        moduleKey: 'Accounts'
      },
      {
        type: 'MenuItem',
        label: 'Parcel',
        icon: 'lucide:land-plot',
        href: addLanguagePrefix('/parcel'),
        moduleKey: 'Parcel'
      },
      {
        type: 'MenuItem',
        label: 'Premises',
        icon: 'solar:home-outline',
        href: addLanguagePrefix('/premises'),
        moduleKey: 'Premises'
      },
      {
        type: 'MenuItem',
        label: 'View All Request',
        icon: 'mdi:circle',
        href: addLanguagePrefix('/requests/viewAllRequest/'),
        moduleKey: 'View All Request'
      },
      {
        type: 'MenuItem',
        label: 'Service Request',
        icon: 'material-symbols:home-repair-service-outline-rounded',
        href: addLanguagePrefix('/serviceRequest'),
        moduleKey: 'Service Request'
      },
      {
        type: 'MenuItem',
        label: 'Service Orders',
        icon: 'mdi:account-service-outline',
        href: addLanguagePrefix('/serviceOrders'),
        moduleKey: 'Service Orders'
      },
      {
        type: 'MenuItem',
        label: 'Settings',
        icon: 'mdi:settings-outline', //'mdi:shield-account',
        href: addLanguagePrefix('/pages/account-settings/profile'),
        moduleKey: 'Settings'
      }
    ]

    // menuConfig.forEach(item => {
    //   if (item.type === 'MenuItem') {
    //     if (
    //       dispatcherApp &&
    //       dispatcherApp.roleDetails &&
    //       dispatcherApp.roleDetails.some(role => role.moduleData.some(module => module?.moduleKey === item.label))
    //     ) {
    //       menuItems.push(item)
    //     }
    //   }

    // })

    // return menuItems

    return menuConfig
      .map(item => {
        if (item.type === 'MenuItem') {
          const moduleExists = dispatcherApp?.roleDetails?.some(role =>
            role.moduleData.some(module => module.moduleKey === item.label)
          )

          const hasAbility = canAccess(item.moduleKey)

          return moduleExists && hasAbility ? item : null
        }

        if (item.type === 'SubMenu' && item.children) {
          const parentHasAccess = canAccess(item.moduleKey)

          if (!parentHasAccess) return null

          const filteredChildren = item.children.filter(subItem => {
            const subModuleExists = dispatcherApp?.roleDetails?.some(role =>
              role.moduleData.some(module =>
                module.subModuleData?.some(subModule => subModule.subModuleKey === subItem.label)
              )
            )

            const childHasAccess = canAccess(subItem.moduleKey)

            return subModuleExists && childHasAccess
          })

          return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
        }

        return null
      })
      .filter(Boolean) as HorizontalNavItemsType

    // TODO

    // return menuConfig.filter(item =>
    //   dispatcherApp?.roleDetails?.some(role =>
    //     role.moduleData.some(module => module?.moduleKey === item.label)
    //   ) && canAccess(item.moduleKey)
    // )
  }, [roleSpecificData, canAccess])


    //* BLM Managment Nav Bar *//
    const handleBLMMenu = useCallback((): HorizontalNavItemsType => {
      const socialMediaApp = roleSpecificData.find(app => app.applicationName === 'Business License Management')


      if (!socialMediaApp) return []

      const commonMenu: HorizontalNavItemsType = [
        {
          type: 'MenuItem',
          label: 'Dashboard',
          icon: 'oui:app-dashboard',
          href: addLanguagePrefix('/dashboards/analytics'),
          moduleKey: 'Dashboard'
        },
        {
          type: 'MenuItem',
          label: 'Parcel',
          icon: 'lucide:land-plot',
          href: addLanguagePrefix('/parcel'),
          moduleKey: 'Parcel'
        },
        {
          type: 'MenuItem',
          label: 'Customers',
          icon: 'tdesign:user',
          href: addLanguagePrefix('/customers'),
          moduleKey: 'Customers'
        },
        {
          type: 'MenuItem',
          label: 'Accounts',
          icon: 'lucide:land-plot',
          href: addLanguagePrefix('/accounts'),
          moduleKey: 'Accounts'
        },
        {
          type: 'SubMenu',
          label: 'Licenses',
          icon: 'mdi:certificate',
          moduleKey: 'Licenses',
          children: [
            {
              type: 'MenuItem',
              label: 'License list',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/licenceList'),
              moduleKey: 'License list'
            },
            {
              type: 'MenuItem',
              label: 'License Application',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/licenceApplication'),
              moduleKey: 'License Application'
            }
          ]
        },
        {
          type: 'SubMenu',
          label: 'Permits',
          icon: 'mdi:certificate',
          moduleKey: 'Permits',
          children: [
            {
              type: 'MenuItem',
              label: 'Permit list',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/licenceList'),
              moduleKey: 'Permit List'
            },
            {
              type: 'MenuItem',
              label: 'Permit Application',
              icon: 'mdi:circle',
              href: addLanguagePrefix('/permitApplication'),
              moduleKey: 'Permit Application'
            }
          ]
        },{
        type: 'MenuItem',
        label: 'Invoices',
        icon: 'ri:file-list-3-line',
        href: addLanguagePrefix('/blm/invoice'),
        moduleKey: 'Invoices'
      },
      {
        type: 'MenuItem',
        label: 'Payments',
        icon: 'ic:outline-payments',
        href: addLanguagePrefix('/blm/payment'),
        moduleKey: 'Payments'
      },
      ]

      if (utilityName === 'ubblmcustdev') {
        commonMenu.push({
          type: 'MenuItem',
          label: 'Settings',
          icon: 'mdi:settings-outline',
          href: addLanguagePrefix('/pages/account-settings/profile'),
          moduleKey: 'Settings'
        })
      }

      return commonMenu
        .map(item => {
          if (item.type === 'MenuItem') {
            const moduleExists = socialMediaApp?.roleDetails?.some(role =>
              role.moduleData.some(module => module.moduleKey === item.moduleKey)
            )

            const hasAbility = canAccess(item.moduleKey)

            return moduleExists && hasAbility ? item : null
          }

          if (item.type === 'SubMenu' && item.children) {
            const parentHasAccess = canAccess(item.moduleKey)

            if (!parentHasAccess) return null

            const filteredChildren = item.children.filter(subItem => {
              const subModuleExists = socialMediaApp?.roleDetails?.some(role =>
                role.moduleData.some(module =>
                  module.subModuleData?.some(subModule => subModule.subModuleKey === subItem.label)
                )
              )

              const childHasAccess = canAccess(subItem.moduleKey)

              return subModuleExists && childHasAccess
            })

            return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
          }

          return null
        })
        .filter(Boolean) as HorizontalNavItemsType

    }, [roleSpecificData, utilityName, canAccess])

  const getMenuItems = useCallback((): HorizontalNavItemsType => {
    if (currentAppType) {
      switch (currentAppType) {
        case 'Administration':
          return handleAdministrationMenu()
        case 'UtilityBilling':
          return handleUtilityBillingMenu()
        case 'SuperAdmin':
          return handleSuperAdminMenu()
        case 'Dispatcher':
          return handleDispatcherMenu()
          case 'Business License Management':
            return handleBLMMenu()
        default:
          return []
      }
    } else if (role) {
      switch (role) {
        case 'CC_AGENTS':
          return handleCcAgentMenu()
        default:
          return []
      }
    } else {
      return []
    }
  }, [currentAppType, role, handleAdministrationMenu, handleUtilityBillingMenu, handleSuperAdminMenu, handleDispatcherMenu, handleBLMMenu, handleCcAgentMenu])

  const formatLabelForDisplay = (label: string) => {
    return label.replace(/([a-z])([A-Z])/g, '$1 $2')
  }

  const [filteredMenuItems, setFilteredMenuItems] = useState<HorizontalNavItemsType>([])
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const getFilteredMenuData = useCallback(
    (
      items: HorizontalNavItemsType,
      query: string
    ): {
      filteredItems: HorizontalNavItemsType
      expandedMenuKeys: string[]
    } => {
      if (!query) return { filteredItems: items, expandedMenuKeys: [] }

      const expandedMenuKeys: string[] = []

      const filteredItems = items.reduce<HorizontalNavItemsType>((filtered, item) => {
        const labelMatches = item.label.toLowerCase().includes(query.toLowerCase())
        let filteredChildren: VerticalNavItem[] | undefined = undefined

        if (item.children) {
          const result = getFilteredMenuData(item.children, query)

          filteredChildren = result.filteredItems

          // If children match, add this menu to expanded list
          if (filteredChildren && filteredChildren.length) {
            expandedMenuKeys.push(item.label)

            // Combine with any expanded submenu keys from deeper levels
            expandedMenuKeys.push(...result.expandedMenuKeys)

            // console.log(expandedMenuKeys)
          }
        }

        if (labelMatches || (filteredChildren && filteredChildren.length)) {
          filtered.push({
            ...item,
            ...(filteredChildren ? { children: filteredChildren } : {})
          })
        }

        return filtered
      }, [])

      return { filteredItems, expandedMenuKeys }
    },
    []
  )

  const menuItems = useMemo(() => getMenuItems(), [getMenuItems])

  const { filteredItems, expandedMenuKeys } = useMemo(
    () => getFilteredMenuData(menuItems, searchQuery),
    [menuItems, searchQuery, getFilteredMenuData]
  )

  // Update how you process the search query
  useEffect(() => {
    setFilteredMenuItems(filteredItems)
    setExpandedMenus(expandedMenuKeys)
  }, [searchQuery, appDetails, currentAppType, filteredItems, expandedMenuKeys])

  const renderMenuItems = (items: HorizontalNavItemsType) => {
    return items.map((item, index) => {
      if (item.type === 'MenuItem') {
        return (
          <MenuItem key={index} href={item.href} icon={<i className={item.icon} />}>
            {formatLabelForDisplay(item.label)}
          </MenuItem>
        )
      } else if (item.type === 'SubMenu') {
        // Check if this submenu should be expanded based on search
        const isExpanded = searchQuery.length > 0 && expandedMenus.includes(item.label)

        return (
          <SubMenu key={`submenu-${item.label}-${index}`} label={item.label} forceExpand={isExpanded}>
            {item.children && renderMenuItems(item.children)}
          </SubMenu>
        )
      }

      return null
    })
  }

  return (
    <AbilityContext.Provider value={ability || defaultAbility}>
      <HorizontalNav
        switchToVertical
        verticalNavContent={VerticalNavContent}
        verticalNavProps={{
          customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
          backgroundColor: 'var(--mui-palette-background-paper)'
        }}
      >
        <div
          style={{
            padding: '12px 8px',
            background: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <TextField
            fullWidth
            variant='outlined'
            size='small'
            placeholder='Search menu...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Icon icon='mdi:search' width={18} height={18} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setSearchQuery('')} size='small'>
                    <Icon icon='mdi:close' width={16} height={16} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
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
        </div>
        <Menu
          rootStyles={menuRootStyles(theme)}
          renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
          menuItemStyles={menuItemStyles(theme, 'tabler-circle')}
          renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
          popoutMenuOffset={{
            mainAxis: ({ level }) => (level && level > 0 ? 14 : 12),
            alignmentAxis: 0
          }}
          verticalMenuProps={{
            menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
            renderExpandIcon: ({ open }) => (
              <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
            ),
            renderExpandedMenuItemIcon: { icon: <i className='tabler-circle text-xs' /> },
            menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
          }}
        >
          {renderMenuItems(filteredMenuItems)}
        </Menu>
      </HorizontalNav>
    </AbilityContext.Provider>
  )
}

export default HorizontalMenu
