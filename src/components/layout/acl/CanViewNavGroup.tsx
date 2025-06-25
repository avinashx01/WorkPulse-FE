// src/layouts/components/acl/CanViewNavGroup.tsx
import type { ReactNode} from 'react';
import { useContext } from 'react'

import type { NavGroup, NavLink } from '../types/acl';
import { AbilityContext } from './Can';

// ** Types
interface Props {
  navGroup?: NavGroup
  children: ReactNode
}

const CanViewNavGroup = (props: Props) => {
  const { children, navGroup } = props
  const ability = useContext(AbilityContext)

  const checkForVisibleChild = (arr: NavLink[] | NavGroup[]): boolean => {
    return arr.some((i: NavGroup | NavLink) => {
      if ('children' in i && i.children) {
        return checkForVisibleChild(i.children)
      } else {
        return ability?.can(i.action, i.subject)
      }
    })
  }

  const canViewMenuGroup = (item: NavGroup) => {
    const hasAnyVisibleChild = item.children && checkForVisibleChild(item.children)

    if (!(item.action && item.subject)) {
      return hasAnyVisibleChild
    }

    
return ability && ability.can(item.action, item.subject) && hasAnyVisibleChild
  }

  
return navGroup && canViewMenuGroup(navGroup) ? <>{children}</> : null
}

export default CanViewNavGroup
