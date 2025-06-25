import type { ElementType } from 'react';
import { useCallback, useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import type { ButtonProps } from '@mui/material';


import { Box, Button, Card, CardContent, styled } from '@mui/material';

import { axiosInterceptor } from '@/utils/axiosInterceptor'; // Adjusted import

interface TabImageProps {
  orgId: string;
  orgShortName: string;
  tabValue: string;
}

interface OrganizationResponse {
  profileImage?: string;

}

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center',
  },
}));

const TabImage: React.FC<TabImageProps> = ({ orgId, orgShortName, tabValue }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fetchImage = useCallback(async () => {
    if (tabValue !== 'imagetab') return;

    try {
      const response = await axiosInterceptor.get<OrganizationResponse>(
        '/organization/getByOrgShortName',
        {
          params: { orgShortName },
        }
      );

      if (response.data.profileImage) {
        setImageUrl(response.data.profileImage);
      }
    } catch (error: any) {
      toast.error('Failed to load image');
    }
  }, [orgShortName, tabValue]);

  const handleInputImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      try {
        const formData = new FormData();

        formData.append('file', event.target.files[0]);

        await axiosInterceptor.post(
          `${process.env.NEXT_PUBLIC_API_URL}/organization/uploadProfileImage`,
          formData,
          {
            params: { id: orgId },
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        fetchImage();
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  useEffect(() => {
    if (tabValue) {
      fetchImage();
    }
  }, [fetchImage, tabValue]);

  return (
    <Card
      sx={{
        height: 'auto',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CardContent sx={{ pt: 0 }}>
        {imageUrl && (
          <Box
            component='img'
            src={imageUrl}
            alt='Organization Image'
            sx={{ width: 200, height: 200, mb: 2 }}
          />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
            Upload image
            <input
              hidden
              type='file'
              accept='image/png, image/jpeg'
              onChange={handleInputImageChange}
              id='account-settings-upload-image'
            />
          </ButtonStyled>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TabImage;
