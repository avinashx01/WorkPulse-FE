'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';

import toast from 'react-hot-toast';

import axiosInstance from '@/utils/axiosInterceptor';
import Icon from '@/components/icon';

interface ApplicationType {
  id: string;
  applicationName: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  operationType: string;
}

interface OrgApplicationType {
  id: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isDelete: boolean;
  applicationType: ApplicationType | null;
}

interface TabProps {
  orgId: string;
  tabValue: string;
  orgnType?: string;
}

const TabAppType: React.FC<TabProps> = ({ orgId, tabValue, orgnType }) => {
  const [allAppTypes, setAllAppTypes] = useState<ApplicationType[]>([]);
  const [orgAppTypes, setOrgAppTypes] = useState<OrgApplicationType[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Fetch all available application types
  const fetchAllAppTypes = useCallback(async () => {
    try {
      const response = await axiosInstance.get<ApplicationType[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/organization/applicationType`
      );
      
      setAllAppTypes(response.data);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to load all application types.';
      
        toast.error(message);
    }
  }, []);

  // Fetch organization's application types
  const fetchOrgAppTypes = useCallback(async () => {
    if (!orgId || tabValue !== 'apptype') return;

    setLoading(true);

    try {
      const response = await axiosInstance.get<OrgApplicationType[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/organization/getApplicationTypes/${orgId}`
      );

      setOrgAppTypes(response.data);

      const existingIds = response.data
        .filter((item) => item.applicationType !== null && !item.isDelete)
        .map((item) => item.applicationType!.id);

      setSelectedIds(new Set(existingIds));
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Failed to load organization application types.';
        
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [orgId, tabValue]);

  // Initial data fetch
  useEffect(() => {
    if (tabValue === 'apptype') {
      fetchAllAppTypes();
      fetchOrgAppTypes();
    }
  }, [tabValue, fetchAllAppTypes, fetchOrgAppTypes]);

  // Memoize orgAppTypes for efficient lookup
  const orgAppTypeMap = useMemo(() => {
    const map = new Map<string, OrgApplicationType>();

    orgAppTypes.forEach(orgApp => {
      if (orgApp.applicationType) {
        map.set(orgApp.applicationType.id, orgApp);
      }
    });

    return map;
  }, [orgAppTypes]);

  const handleCheckbox = (id: string) => {
    if (loading || saving) return; // Prevent changes during loading/saving

    setSelectedIds(prev => {
      const updated = new Set(prev);

      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }

      return updated;
    });
  };

  const addAppTypes = async () => {
    setSaving(true);

    const newTypes = Array.from(selectedIds).filter(
      id => !orgAppTypeMap.has(id)
    );

    if (newTypes.length === 0) {
      toast.error('No new application types selected.');
      setSaving(false);

      return;
    }

    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/organization/CreateApplication`,
        { applicationTypeId: newTypes }, // Updated key to 'applicationTypeId'
        {
          params: {
            organizationId: orgId, // Passing orgId as a query parameter
          },
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success('Application types added successfully.');
        fetchOrgAppTypes();
      } else {
        toast.error('Failed to add application types.');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error adding application types.';

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAppType = async (id: string) => {
    setLoading(true);

    try {
      const response = await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/organization/deleteApplication/${id}`
      );

      if (response.status === 200 || response.status === 204) {
        toast.success('Application type deleted.');
        fetchOrgAppTypes();
      } else {
        toast.error('Failed to delete application type.');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error deleting application type.';
     
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Grid container spacing={4}>
          {orgnType === 'WP' ? (
            <Grid item xs={12} sm={12}>
              <Typography variant="h5" gutterBottom>
                Application Types
              </Typography>

              {loading || saving ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : allAppTypes.length === 0 ? (
                <Typography>No application types available.</Typography>
              ) : (
                allAppTypes.map(app => {
                  const isChecked = selectedIds.has(app.id);
                  const orgApp = orgAppTypeMap.get(app.id);

                  return (
                    <Box key={app.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleCheckbox(app.id)}
                        color="primary"
                        disabled={loading || saving}
                      />
                      <Typography sx={{ flexGrow: 1 }}>{app.applicationName}</Typography>

                      {orgApp && !orgApp.isDelete && (
                        <IconButton
                          onClick={() => {
                            if (orgApp.id) {
                              deleteAppType(orgApp.id);
                            } else {
                              toast.error('Application type not found.');
                            }
                          }}
                          color="error"
                          disabled={loading || saving}
                        >
                          <Icon icon="bx:trash-alt" fontSize={20} />
                        </IconButton>
                      )}
                    </Box>
                  );
                })
              )}

              {allAppTypes.length > 0 && (
                <Button
                  variant="contained"
                  onClick={addAppTypes}
                  disabled={selectedIds.size === 0 || saving || loading}
                  sx={{ mt: 3 }}
                >
                  {saving ? <CircularProgress size={24} /> : 'ADD'}
                </Button>
              )}
            </Grid>
          ) : (
            <Grid item xs={12} sm={12}>
              <Typography variant="h6">Backflow Testing Company</Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>

      {/* Loading Overlay */}
      {(loading || saving) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Card>
  );
};

export default TabAppType;
