import React, { useCallback, useEffect, useState } from 'react';

import { Box, Button, Typography } from '@mui/material';

import type { AxiosResponse } from 'axios';


import { axiosInterceptor } from '@/utils/axiosInterceptor';

interface StripeConfigCardProps {
  orgId: string;
  tabValue: string;
}

// Define the response interfaces
interface ConnectAccountResponse {
  url: string;
}

// interface StripeAccountResponse {
//   isStripeAccountConnected: boolean;
//   connectedAccountId: string;
// }

const StripeConfigCard: React.FC<StripeConfigCardProps> = ({ orgId, tabValue }) => {
  const [isStripeAccountConnected, setIsStripeAccountConnected] = useState<boolean>(false);
  const [connectId, setConnectId] = useState<{ connectedAccountId: string }>({ connectedAccountId: '' });

  const connectToStripe = useCallback(async () => {
    const inputData = {
      refreshUrl: `${process.env.NEXT_PUBLIC_DEPLOYED_URL}/pages/adminapp-settings/stripepayment`,
      returnUrl: `${process.env.NEXT_PUBLIC_DEPLOYED_URL}/pages/adminapp-settings/stripepayment`,
      orgId: orgId,
    };

    try {
      const response: AxiosResponse<ConnectAccountResponse> = await axiosInterceptor.post(
        `${process.env.NEXT_PUBLIC_API_URL}/stripe/account`,
        { ...inputData }
      );

      window.location.assign(response.data.url);
    } catch (error) {
      console.error('Error connecting to Stripe:', error);
    }
  }, [orgId]);

  useEffect(() => {
    if (tabValue !== 'stripepayment') return;

    const fetchData = async () => {
      // try {
      //   const response: AxiosResponse<StripeAccountResponse> = await axiosInterceptor.get(
      //     `${process.env.NEXT_PUBLIC_API_URL}/accounts/stripe/${orgId}`
      //   );

      //   setIsStripeAccountConnected(response.data.isStripeAccountConnected);
      //   setConnectId({ connectedAccountId: response.data.connectedAccountId });
      // } catch (error) {
      //   console.error('Error fetching Stripe account data:', error);
      // }


      setIsStripeAccountConnected(false)
      setConnectId({ connectedAccountId: '' })





    };

    fetchData();
  }, [orgId, tabValue]);

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between">
      {isStripeAccountConnected ? (
        <Typography>Your Stripe Account is already connected</Typography>
      ) : (
        <Typography sx={{ marginTop: 3 }}>
          Stripe Connect Id: <b>{connectId.connectedAccountId}</b>
        </Typography>
      )}

      <Button
        sx={{ width: 200, marginTop: 6 }}
        disabled={isStripeAccountConnected}
        onClick={connectToStripe}
        variant="outlined"
      >
        Connect To Stripe
      </Button>
    </Box>
  );
};

export default StripeConfigCard;
