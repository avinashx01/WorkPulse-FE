import React, { useEffect, useState } from 'react';

import * as yup from 'yup';
import { useTheme } from '@mui/material/styles';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Typography
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Toaster } from 'react-hot-toast';

import PlaceAutocomplete from '@/components/auto-complete/PlaceAutoComplete';
import DatePickerWrapper from '@/libs/styles/DatePickerWrapper';
import axiosInstance from '@/utils/axiosInterceptor';
import Icon from '@/@core/components/icon';
import DrawerCloseWarningDialog from '@/components/DrawerCloseWarningDialog';
import CustomTextField from '@/@core/components/mui/TextField';

interface FormSchema {
  id?: string | null;
  organizationName?: string | null;
  organizationDescription?: string | null;
  phoneNo?: string | null;
  organizationShortName?: string | null;
  custPortalshortName?: string | null
  emailId?: string | null;
  organizationType?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  isActive?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  placeId?: string | null;
  county?: string | null;
  addressLine2?: string | null;
  country?: string | null;
  streetNo?: string | null;
  streetName?: string | null;
  addressId?: number | null;
}

interface AddEditSuperAdminProps {
  openModal: boolean;
  closeModal: () => void;
  editRowData: FormSchema;
  editRow: boolean;
  ReFetchListing: () => void;
}

const schema: yup.ObjectSchema<FormSchema> = yup.object({
  id: yup.string().nullable().notRequired(),
  organizationName: yup.string().nullable().notRequired(),
  organizationDescription: yup.string().nullable().notRequired(),
  phoneNo: yup
    .string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .nullable()
    .notRequired(),
  organizationShortName: yup.string().nullable().notRequired(),
  custPortalshortName: yup.string().nullable().notRequired(),
  emailId: yup.string().email('Invalid email').nullable().notRequired(),
  organizationType: yup.string().nullable().notRequired(),
  addressLine1: yup.string().nullable().notRequired(),
  city: yup.string().nullable().notRequired(),
  state: yup.string().nullable().notRequired(),
  postalCode: yup.string().nullable().notRequired(),
  isActive: yup.string().nullable().notRequired(),
  latitude: yup.string().nullable().notRequired(),
  longitude: yup.string().nullable().notRequired(),
  placeId: yup.string().nullable().notRequired(),
  county: yup.string().nullable().notRequired(),
  addressLine2: yup.string().nullable().notRequired(),
  country: yup.string().nullable().notRequired(),
  streetNo: yup.string().nullable().notRequired(),
  streetName: yup.string().nullable().notRequired(),
  addressId: yup.number().nullable().notRequired()
});

const AddEditSuperAdmin: React.FC<AddEditSuperAdminProps> = ({
  openModal,
  closeModal,
  editRowData,
  editRow,
  ReFetchListing
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)


  const {
    reset,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isDirty, isValid }
  } = useForm<FormSchema>({
    resolver: yupResolver(schema),
    mode: 'onChange',

    defaultValues: editRow
      ? {
          ...editRowData,
          organizationType: editRowData.organizationType || 'WaterPurveyor',
          isActive: editRowData.isActive || 'true'
        }
      : {
          organizationName: '',
          organizationDescription: '',
          phoneNo: '',
          organizationShortName: '',
          custPortalshortName: '',
          emailId: '',
          organizationType: 'WaterPurveyor',
          addressLine1: '',
          city: '',
          state: '',
          postalCode: '',
          isActive: 'true'
        }
  });

  useEffect(() => {
    if (editRow) {
      Object.keys(editRowData).forEach((key) => {
        setValue(key as keyof FormSchema, editRowData[key as keyof FormSchema]);
      });
    } else {
      reset();
    }
  }, [editRow, editRowData, reset, setValue]);

  const setAddress = (place: any, onChange: (value: string) => void) => {

    // console.log('Selected place:', place);
    setValue('city', place.city || '');
    setValue('state', place.state || '');
    setValue('postalCode', place.postalCode || '');
    setValue('country', place.country || '');
    setValue('latitude', place.lat || '');
    setValue('longitude', place.lng || '');
    setValue('placeId', place.placeId || '');
    setValue('streetNo', place.street_number || '');
    setValue('streetName', place.route || '');
    setValue('county', place.county || '');
    onChange(place.description);
  };

  const handleConfirmClose = () => {
    closeModal()
    reset()
    setIsConfirmationOpen(false)
  }

  const handleCancelClose = () => {
    setIsConfirmationOpen(false)
  }

  const handleClose = () => {
    if (isDirty) {
      setIsConfirmationOpen(true)
    } else {
      closeModal()
      reset()
    }
  }

  const handleFormSubmit = async (formData: FormSchema) => {
    setLoading(true);

    try {
      const isActiveBool =
        formData.isActive === 'true'
          ? true
          : formData.isActive === 'false'
          ? false
          : undefined;

      const payload = {
        orgDetails: {
          organizationName: formData.organizationName,
          organizationDescription: formData.organizationDescription,
          phoneNo: formData.phoneNo,
          organizationShortName: formData.organizationShortName,
          custPortalshortName: formData.custPortalshortName,
          emailId: formData.emailId,
          updatedBy: 'john@gmail.com',
          organizationType: formData.organizationType,
          timezone: 'john@gmail.com',
          ...(editRow
            ? {}
            : {
                createdBy: 'john@gmail.com',
                isActive: isActiveBool,
                organizationLogo:
                  'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
                profileImage:
                  'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg'
              })
        },
        addresses: [
          {
            county: formData.county,
            addressType: 'MA_ADD',
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            country: formData.country || 'US',
            zipCode: formData.postalCode,
            streetNo: formData.streetNo,
            streetName: formData.streetName,
            latitude: formData.latitude,
            longitude: formData.longitude,
            placeId: formData.placeId,
            state: formData.state,
            ...(editRow ? { id: formData.addressId } : {})
          }
        ]
      };

      if (editRow && formData.id) {
        await axiosInstance.put(`/organization/${formData.id}`, payload);
      } else {
        await axiosInstance.post('/organization', payload);
      }

      ReFetchListing();
setError(false)
      reset();
      closeModal();
    } catch (err) {
      setError(true)
      console.error('Error saving organization:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={openModal} onClose={handleClose}>
      <DatePickerWrapper>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText
            }
          }}
        />
        {error ? (
                    <Toaster
                      position='bottom-center'
                      toastOptions={{
                        style: {
                          backgroundColor: theme.palette.secondary.main,
                          color: theme.palette.secondary.contrastText
                        }
                      }}
                      containerStyle={{
                        position: 'fixed',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999
                      }}
                    />
                  ) : null}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Box sx={{ width: 800, padding: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
  <Typography variant="h6">
    {editRow ? 'Edit Organization' : 'Add Organization'}
  </Typography>
  <IconButton size="small" onClick={handleClose} sx={{ color: 'text.primary' }}>
    <Icon icon="bx:x" fontSize={20} />
  </IconButton>
</Box>

            <Grid container spacing={4}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Controller
                    name="organizationName"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label="Organization Name"
                        error={!!errors.organizationName}
                        helperText={errors.organizationName?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Controller
                    name="organizationDescription"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label="Organization Description"
                        error={!!errors.organizationDescription}
                        helperText={errors.organizationDescription?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Controller
                    name="organizationShortName"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label="Organization Short Name"
                        error={!!errors.organizationShortName}
                        helperText={errors.organizationShortName?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Controller
                    name="custPortalshortName"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label="Customer Portal Short Name"
                        error={!!errors.custPortalshortName}
                        helperText={errors.custPortalshortName?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Controller
                    name="phoneNo"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label="Phone No"
                        error={!!errors.phoneNo}
                        helperText={errors.phoneNo?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Controller
                    name="emailId"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        type='email'
                        label="Email"
                        error={!!errors.emailId}
                        helperText={errors.emailId?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Controller
                    name="addressLine1"
                    control={control}
                    render={({ field }) => (
                      <PlaceAutocomplete
                        value={field.value || ''}
                        label="Address Line 1"
                        onPlaceSelect={(place) => setAddress(place, field.onChange)}
                        errors={!!errors.addressLine1}
                      />
                    )}
                  />
                  {errors.addressLine1 && (
                    <FormHelperText error>{errors.addressLine1.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
              <FormControl fullWidth>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label="City"
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label="State"
                        error={!!errors.state}
                        helperText={errors.state?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <Controller
                    name="postalCode"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        label="Postal Code"
                        error={!!errors.postalCode}
                        helperText={errors.postalCode?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <Controller
                    name="organizationType"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField select {...field} error={!!errors.organizationType} label="Organization Type">
                        <MenuItem value="WaterPurveyor">Water Purveyor</MenuItem>
                        <MenuItem value="Supplier">Supplier</MenuItem>
                      </CustomTextField>
                    )}
                  />
                  {errors.organizationType && (
                    <FormHelperText error>{errors.organizationType.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField select {...field} error={!!errors.isActive} label="Status">
                        <MenuItem value="true">Active</MenuItem>
                        <MenuItem value="false">Inactive</MenuItem>
                      </CustomTextField>
                    )}
                  />
                  {errors.isActive && (
                    <FormHelperText error>{errors.isActive.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
            <Box mt={4} display="flex" justifyContent="space-between">
  <Button
    onClick={handleClose}
    variant="outlined"
    sx={{ mr: 2 }}
  >
    Cancel
  </Button>
  <Button
    type="submit"
    variant="contained"
    color="primary"
    disabled={!(isValid && isDirty) || loading}
  >
    {loading ? <CircularProgress color='inherit' size='1.9em' /> :editRow ? 'Update' : 'Submit'}
  </Button>
</Box>
          </Box>
        </form>
        <DrawerCloseWarningDialog
          open={isConfirmationOpen}
          onClose={handleCancelClose}
          onConfirm={handleConfirmClose}
        />
      </DatePickerWrapper>
    </Drawer>
  );
};

export default AddEditSuperAdmin;
