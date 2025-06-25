import React from 'react'

import { Box, Card, CardContent } from '@mui/material'

import StripeConfigCard from './StripeConfigCard'


// import StripeConfigCard from './stripePayment/StripeConfigCard'

interface TabProps {
  orgId: string
  tabValue: string
}

const TabStripePayment = ({ orgId, tabValue }: TabProps) => {

  return (
    <Box>
      <Card>
        <CardContent>
          <StripeConfigCard orgId={orgId} tabValue={tabValue} />
        </CardContent>
      </Card>
    </Box>
  )
}

export default TabStripePayment
