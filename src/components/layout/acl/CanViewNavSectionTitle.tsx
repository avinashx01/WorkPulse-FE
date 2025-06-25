// src/layouts/components/acl/CanViewNavSectionTitle.tsx
import type { ReactNode} from 'react';
import { useContext } from 'react'

import type { NavSectionTitle } from '../types/acl';
import { AbilityContext } from './Can';

// ** Types
interface Props {
  children: ReactNode
  navTitle?: NavSectionTitle
}

const CanViewNavSectionTitle = (props: Props) => {
  const { children, navTitle } = props
  const ability = useContext(AbilityContext)

  
return ability && ability.can(navTitle?.action, navTitle?.subject) ? <>{children}</> : null
}

export default CanViewNavSectionTitle
