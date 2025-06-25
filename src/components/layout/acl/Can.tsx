'use client'

import { createContext, useContext } from 'react'

import { createContextualCan } from '@casl/react'

// Use the more generic `AnyAbility` type from CASL
import type { AnyAbility} from '@casl/ability';
import { createMongoAbility } from '@casl/ability'

const defaultAbility: AnyAbility = createMongoAbility([])  // A dummy or default ability, depending on your setup

export const AbilityContext = createContext<AnyAbility>(defaultAbility)

// The `Can` component to check permissions in React
const Can = createContextualCan(AbilityContext.Consumer)

export default Can

// Optional hook to use the current ability
export const useAbility = () => {
  const ability = useContext(AbilityContext)

  if (!ability) {
    throw new Error('useAbility must be used within an AbilityContext.Provider')
  }

  return ability
}
