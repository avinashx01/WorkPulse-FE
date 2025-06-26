'use client'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
//import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'

//import type { NotificationsType } from '@components/layout/shared/NotificationsDropdown'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'

//import LanguageDropdown from '@components/layout/shared/LanguageDropdown'
import ModeDropdown from '@components/layout/shared/ModeDropdown'

//import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'

//import NotificationsDropdown from '@components/layout/shared/NotificationsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import ShortcutsDropdown from '../shared/ShortcutsDropdown'
import Customizer from '@/@core/components/customizer'

import { useAppDetails } from '@/hooks/useAppDetails' // Import the custom hook


const NavbarContent = () => {

  

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        <NavSearch />
      </div>
      <div className='flex items-center'>
        {/* <LanguageDropdown />

       <ShortcutsDropdown shortcuts={shortcuts} />

        <NotificationsDropdown notifications={notifications} /> */}
       

        <ModeDropdown />
        <Customizer />
        <UserDropdown />

      </div>
    </div>
  )
}

export default NavbarContent
