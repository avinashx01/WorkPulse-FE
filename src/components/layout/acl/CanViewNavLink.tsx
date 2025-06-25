// src/layouts/components/acl/CanViewNavLink.tsx
import type { ReactNode} from 'react';
import { useContext } from 'react'

import type { NavLink } from '../types/acl';
import { AbilityContext } from './Can';

// ** Types
interface Props {
  navLink?: NavLink
  children: ReactNode
}

const CanViewNavLink = (props: Props) => {
  const { children, navLink } = props
  const ability = useContext(AbilityContext)

  
return ability && ability.can(navLink?.action, navLink?.subject) ? <>{children}</> : null
}

export default CanViewNavLink
