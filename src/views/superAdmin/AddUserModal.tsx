'use client';

import React, { useCallback, useEffect, useState } from 'react';

import type { BoxProps } from '@mui/material';
import {
  Dialog,
  DialogActions,
  Button,
  Grid,
  Typography,
  FormControl,
  FormHelperText,
  IconButton,
  Box,
  styled,
  InputLabel,
  CircularProgress,
  DialogContent,
  Autocomplete,
  InputAdornment,
  OutlinedInput,
  useTheme,
  Alert
} from '@mui/material';

import type { Resolver } from 'react-hook-form';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import toast, { Toaster } from 'react-hot-toast';
import { isAxiosError } from 'axios';

import axiosInstance from '@/utils/axiosInterceptor';

import Icon from '@/components/icon';
import type { UserType } from './TabAdminUsers';

// Import the custom PasswordField component
import PasswordField from '@/@core/components/passwordComponent/page';
import CustomTextField from '@/@core/components/mui/TextField';


// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

// The API returns each role object in userRole as either:
//   { id: number; isDelete: boolean; roleKey: string; }
// or (in some responses) as nested:
//   { id: number; isDelete: boolean; role: { id: string; roleName: string; roleKey: string; ... } }
// We'll look for a nested role if it exists; otherwise use the top-level properties.

export interface RoleIdsType {
  id: string;
  roleName: string;
  roleKey: string;
  roleDescription: string;
  isActive: boolean;
  isDelete: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  applicationType?: {
    id: string;
    applicationName: string;
  };
  operationType?: string;
}

interface ProfileInfoResponse {
  result: {
    id: number;
  };
}

interface AddUserModalProps {
  orgId: string;
  isOpen: boolean;
  onClose: () => void;
  editData?: UserType | null;
  orgnType?: string;
  onSuccess: () => void; // Trigger refetch after success
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  username: string;
  roleIds: RoleIdsType[];
}

interface State {
  showPassword: boolean;
  showConfirmPassword: boolean;
}


// ---------------------------------------------------------------------
// Styled Header Component
// ---------------------------------------------------------------------

const Header = styled(Box)<BoxProps>(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}));


// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------

const AddUserModal: React.FC<AddUserModalProps> = ({
  orgId,
  isOpen,
  onClose,
  editData = null,
  orgnType,
  onSuccess
}) => {
  const theme = useTheme();

  // State declarations
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [categories, setCategories] = useState<RoleIdsType[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [usernameChanged, setUsernameChanged] = useState(false);
  const [debouncedEmail, setDebouncedEmail] = useState('');

  const [values, setValues] = useState<State>({
    showPassword: false,
    showConfirmPassword: false
  });


  // ---------------------------------------------------------------------
  // Validation Schema
  // ---------------------------------------------------------------------

  const schema = yup.object().shape({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    username: yup.string(),
    email: yup
      .string()
      .email('Invalid email format')
      .required('Email is required')
      .trim()
      .label('Email'),

    ...(editData === null && {
      password: yup
        .string()
        .required('Password is required')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character'
        ),
      confirmPassword: yup
        .string()
        .required('Confirm Password is required')
        .oneOf([yup.ref('password'), ''], 'Passwords do not match')
    }),

    phoneNumber: yup
      .string()
      .required('Phone Number is required')
      .matches(/^\d{10}$/, 'Please enter a valid 10-digit number.')
      .label('Phone Number'),

    roleIds: yup
      .array()
      .of(
        yup.object({
          id: yup.string().required(),
          roleName: yup.string().required(),
          roleKey: yup.string().required(),
          roleDescription: yup.string().required(),
          isActive: yup.boolean().required(),
          isDelete: yup.boolean().required(),
          createdAt: yup.string().required(),
          createdBy: yup.string().required(),
          updatedAt: yup.string().required(),
          updatedBy: yup.string().required(),
          applicationType: yup
            .object({
              id: yup.string().required(),
              applicationName: yup.string().required(),
              createdAt: yup.string().required(),
              createdBy: yup.string().required(),
              updatedAt: yup.string().required(),
              updatedBy: yup.string().required(),
              operationType: yup.string().required()
            })
            .optional()
        })
      )
      .min(1, 'At least one role must be selected')
      .required('Roles are required')
  });


  // ---------------------------------------------------------------------
  // React Hook Form
  // ---------------------------------------------------------------------

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      username: '',
      roleIds: []
    },
    mode: 'onChange',
    resolver: yupResolver(schema) as Resolver<FormValues>
  });

  const emailValue = watch('email');


  // ---------------------------------------------------------------------
  // Fetch Roles (Categories)
  // ---------------------------------------------------------------------

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosInstance.get<RoleIdsType[]>(`/role/orgBasedList/${orgId}`);

      // Flatten the response if needed
      const flattenedArray: RoleIdsType[] = response.data.flat();

      setCategories(flattenedArray);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to fetch roles. Please try again later.');
    }
  }, [orgId]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);


  // ---------------------------------------------------------------------
  // Refetch User Details if Modal is Open (Edit Mode)
  // ---------------------------------------------------------------------

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get<UserType>(`/users/${editData?.id}`);
        const userDetails = response.data;

        // Update form values with latest details
        setValue('email', userDetails.email);
        setValue('firstName', userDetails.firstName);
        setValue('lastName', userDetails.lastName);
        setValue('username', userDetails.username);
        setValue('phoneNumber', userDetails.phoneNo.replace(/^\+1/, ''));

        if (categories.length > 0 && userDetails.userRole) {
          const fullRoles: RoleIdsType[] = userDetails.userRole
            .map((r: any) => {
              // Use the nested property if it exists, else use r directly.
              const roleKey = r.role ? r.role.roleKey : r.roleKey;

              return categories.find((c) => c.roleKey === roleKey) || null;
            })
            .filter((role): role is RoleIdsType => role !== null);

          setValue('roleIds', fullRoles);
        }
      } catch (error: any) {
        console.error('Error refetching user details:', error);

      }
    };

    if (isOpen && editData?.id) {
      fetchUserDetails();
    }
  }, [isOpen, editData, categories, setValue]);


  // ---------------------------------------------------------------------
  // Toggle Confirm Password Visibility
  // ---------------------------------------------------------------------

  const handleClickShowConfirmPassword = () => {
    setValues((prev) => ({
      ...prev,
      showConfirmPassword: !prev.showConfirmPassword
    }));
  };


  // ---------------------------------------------------------------------
  // Close Modal Helpers
  // ---------------------------------------------------------------------

  const closeModal = () => {
    onClose();
    reset();
    setApiError(null);
  };

  const handleClose = () => {
    if (isDirty) {
      setIsConfirmationOpen(true);
    } else {
      closeModal();
    }
  };

  const handleConfirmClose = () => {
    setIsConfirmationOpen(false);
    closeModal();
  };

  const handleCancelClose = () => {
    setIsConfirmationOpen(false);
  };


  // ---------------------------------------------------------------------
  // Delete Roles (Edit Flow)
  // Using the `/role/{id}` API endpoint
  // ---------------------------------------------------------------------

  const deleteSelectedRoles = useCallback(async (toDeleteIds: string[]) => {
    try {
      await Promise.all(toDeleteIds.map((id) => axiosInstance.delete(`/users/${id}/`)));

      return true;
    } catch (error: any) {
      console.error('Error deleting roles:', error);

      if (isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Unable to delete roles. Please try again.');
      }

      return false;
    }
  }, []);


  // ---------------------------------------------------------------------
  // Submit Handler
  // ---------------------------------------------------------------------

  const onSubmit = async (data: FormValues) => {
    setButtonLoading(true);

    try {
      // Send role IDs as strings to match backend expectations
      const AddedRoleIds = data.roleIds.map((role) => role.id);

      if (editData?.id) {
        // EDIT USER
        const userDataRoleIds = data.roleIds.map((role) => role.id);

        // Identify roles to delete by comparing existing roles in editData.userRole
        const rolesToDelete = editData.userRole.filter((r: any) =>
          !userDataRoleIds.includes(String(r.id))
        );

        const toDeleteIds = rolesToDelete.map((r: any) => r.id.toString());

        // Update user details and roles using editData.id
        await axiosInstance.put(`/users/${editData.id}`, {
          userId: editData.id,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNo: `+1${data.phoneNumber}`,
          organization: orgId,
          roleIds: AddedRoleIds
        });

        // Delete roles that were removed
        const deleteSuccess = await deleteSelectedRoles(toDeleteIds);

        if (deleteSuccess) {
          toast.success('User updated successfully');
          closeModal();
          onSuccess(); // Trigger refetch
        }

      } else {
        // CREATE NEW USER
        const profileInfoResponse = await axiosInstance.post<ProfileInfoResponse>(`/auth/profileInfo`, {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
          phoneNo: `+1${data.phoneNumber}`,
          signUpType: 'AdminSignUpFlow',
          organizationId: orgId,
          roleIds: orgnType === 'WP' ? AddedRoleIds : ['42']
        });

        const userId = profileInfoResponse.data.result.id;

        const assignOrgResponse = await axiosInstance.patch(`/auth/addOrgToUser/${orgId}`, { userId });

        if (assignOrgResponse.status === 200 || assignOrgResponse.status === 201) {
          toast.success('User created successfully');
          closeModal();
          onSuccess(); // Trigger refetch
        } else {
          toast.error('Failed to assign organization to user');
        }
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);

      if (isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Unable to process your request. Please try again.');
      }
    } finally {
      setButtonLoading(false);
    }
  };

  // ---------------------------------------------------------------------
  // Debounce Email Input
  // ---------------------------------------------------------------------

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(emailValue);
    }, 1000);

    return () => clearTimeout(handler);
  }, [emailValue]);


  // ---------------------------------------------------------------------
  // Check Username Availability
  // ---------------------------------------------------------------------

  useEffect(() => {
    const checkUsername = async () => {
      if (!usernameChanged || !debouncedEmail) return;

      try {
        await axiosInstance.get(`/auth/ToCheckExistingUsername`, {
          params: { username: debouncedEmail }
        });

        setApiError(null);
      } catch (error: any) {
        if (isAxiosError(error) && error.response?.data?.message) {
          setApiError(error.response.data.message);
        } else {
          setApiError('Username validation failed. Please try again.');
        }
      }
    };

    checkUsername();

    return () => setApiError(null);
  }, [debouncedEmail, usernameChanged]);


  // ---------------------------------------------------------------------
  // Populate Form Fields for Edit
  // Using the new response shape where user details are at the top level
  // and roles come via "userRole"
  // ---------------------------------------------------------------------

  useEffect(() => {
    if (editData?.id && categories.length > 0) {
      const fullRoles: RoleIdsType[] = editData.userRole
        .map((r: any) => {
          const roleKey = r.role && r.role.roleKey ? r.role.roleKey : r.roleKey;

          return categories.find((c) => c.roleKey === roleKey) || null;
        })
        .filter((role): role is RoleIdsType => role !== null);

      setValue('email', editData.email);
      setValue('firstName', editData.firstName);
      setValue('lastName', editData.lastName);
      setValue('username', editData.email);
      setValue('phoneNumber', editData.phoneNo.replace(/^\+1/, ''));
      setValue('roleIds', fullRoles);
      setUsernameChanged(false);
    }
  }, [editData, setValue, categories]);


  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  return (
    <Dialog fullWidth maxWidth="md" scroll="body" open={isOpen} onClose={handleClose}>
      <Toaster
        position="bottom-center"
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

      <Header>
        <Typography variant="h6">{editData?.id ? 'Edit User' : 'Add User'}</Typography>
        <IconButton size="small" onClick={handleClose} sx={{ color: 'text.primary' }}>
          <Icon icon="bx:x" fontSize={20} />
        </IconButton>
      </Header>

      <Box sx={{ p: 5 }}>
        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">
              Please fix the following errors:
              <ul>
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error?.message}</li>
                ))}
              </ul>
            </Alert>
          </Box>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {/* First Name */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label="First Name *"
                      error={Boolean(errors.firstName)}
                      helperText={errors.firstName?.message}
                      fullWidth
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label="Last Name *"
                      error={Boolean(errors.lastName)}
                      helperText={errors.lastName?.message}
                      fullWidth
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      type="email"
                      label="Email *"
                      disabled={!!editData?.id}
                      onChange={(e) => {
                        setUsernameChanged(true);
                        field.onChange(e);
                      }}
                      error={Boolean(apiError) || Boolean(errors.email)}
                      helperText={errors.email?.message || apiError}
                      fullWidth
                      sx={
                        editData?.id
                          ? { '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#7f7f7f' } }
                          : undefined
                      }
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Username (read-only) */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label="Username"
                      disabled
                      fullWidth
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#7f7f7f' }
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Password & Confirm Password (Only Add Mode) */}
            {!editData?.id && (
              <>
                {/* Password */}
                <Grid item xs={12} sm={6}>
                  <PasswordField
                    name="password"
                    label="Password *"
                    control={control}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 6 }}>
                    <InputLabel htmlFor="confirm-password" error={Boolean(errors.confirmPassword)}>
                      Confirm Password *
                    </InputLabel>

                    <Controller
                      name="confirmPassword"
                      control={control}
                      render={({ field }) => (
                        <OutlinedInput
                          {...field}
                          id="confirm-password"
                          type={values.showConfirmPassword ? 'text' : 'password'}
                          label="Confirm Password *"
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                onClick={handleClickShowConfirmPassword}
                                onMouseDown={(e) => e.preventDefault()}
                              >
                                <Icon fontSize={20} icon={values.showConfirmPassword ? 'bx:show' : 'bx:hide'} />
                              </IconButton>
                            </InputAdornment>
                          }
                          error={Boolean(errors.confirmPassword)}
                        />
                      )}
                    />

                    {errors.confirmPassword && (
                      <FormHelperText sx={{ color: 'error.main' }}>
                        {errors.confirmPassword.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Phone Number */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mb: 6 }}>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      label="Phone Number *"
                      error={Boolean(errors.phoneNumber)}
                      helperText={errors.phoneNumber?.message}
                      fullWidth
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Role(s) Selection */}
            <Grid item xs={12} sm={12} mt={5}>
              <FormControl fullWidth>
                <Controller
                  name="roleIds"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={categories.sort((a, b) => a.roleName.localeCompare(b.roleName))}
                      getOptionLabel={(option) => option.roleName}
                      onChange={(_, data) => field.onChange(data)}
                      value={field.value}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      renderInput={(params) => (
                        <CustomTextField
                          {...params}
                          label="Role(s) Selection *"
                          variant="outlined"
                          error={Boolean(errors.roleIds)}
                          helperText={errors.roleIds ? errors.roleIds.message : ''}
                        />
                      )}
                    />
                  )}
                />

                {errors.roleIds && (
                  <FormHelperText sx={{ color: 'error.main' }}>
                    {errors.roleIds.message}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {/* Submit and Cancel Buttons */}
          <DialogActions sx={{ display: 'flex', justifyContent:'flex-end', mt: 5 }}>
            {/* <Button size="large" variant="outlined" color="secondary" onClick={closeModal} sx={{ ml: -6 }}>
              Cancel
            </Button> */}

            <Button size="large" type="submit" variant="contained" disabled={!isValid || Boolean(apiError) || buttonLoading}>
              {buttonLoading ? <CircularProgress color="inherit" size="1.9em" /> : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Box>

      {/* Confirmation Dialog (for unsaved changes) */}
      <Dialog open={isConfirmationOpen} onClose={handleCancelClose} aria-labelledby="confirmation-dialog-title" aria-describedby="confirmation-dialog-description">
        <DialogContent sx={{ textAlign: 'center', padding: '16px 24px' }}>
          <Typography sx={{ fontWeight: 400, color:  'text.primary', fontSize: '14px' }} gutterBottom>
            You have unsaved changes.
          </Typography>
          <Typography sx={{ fontWeight: 400, color:  'text.primary', fontSize: '14px' }}>
            Are you sure you want to discard them?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', padding: '8px 24px' }}>
          <Button onClick={handleCancelClose} color="primary" variant ='tonal' size='small'>
            Cancel
          </Button>
          <Button onClick={handleConfirmClose} color="secondary" variant ='outlined' size='small' autoFocus>
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AddUserModal;
