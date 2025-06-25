"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

// MUI Imports
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Link,
  Typography,
} from "@mui/material";

import { isAxiosError } from "axios";

// MUI DataGrid Imports
import type { GridColDef, GridSortModel } from "@mui/x-data-grid";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";

// Utility Imports
import { format } from "date-fns";
import toast from "react-hot-toast";

// Local Component Imports
import ExportToCsvButton from "@/components/ExportComponent";
import Icon from "@/components/icon";
import AddUserModal from "./AddUserModal";

// Axios Instance Import
import axiosInstance from "@/utils/axiosInterceptor";
import { preparePaginationParams } from "@/utils/utils";
import CustomTextField from "@/@core/components/mui/TextField";

// ------------------------------------------------
// Types (match your API data)
// ------------------------------------------------
export interface UserType {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNo: string;
  userRole: {
    id: number;
    isDelete: boolean;
    roleKey: string;
  }[];
  organization?: {
    organizationName: string;
    city?: string;
  };
}

interface PaginationParamsWithUser {
  page: number;
  limit: number;
  sortBy: string;
  sortByDirection: "ASC" | "DESC";
  search: string;
  totalPages: number;
  organizationId: string;
}

interface PaginationMeta {
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
}

interface TabProps {
  orgId: string;
  tabValue: string;
  orgnType?: string;
}

// Helper to format phone numbers (e.g. convert from scientific notation)
const formatPhoneNo = (phone: string) => {
  if (!phone) return "";

  if (phone.includes("E")) {
    return Number(phone).toLocaleString("fullwide", { useGrouping: false });
  }

  return phone.replace(/^\+1/, "");
};

// ------------------------------------------------
// Component
// ------------------------------------------------
const TabAdminUsers = ({ orgId, tabValue, orgnType }: TabProps) => {
  const [userList, setUserList] = useState<UserType[]>([]);

  const [pageState, setPageState] = useState({
    isLoading: false,
    totalPages: 0,
    totalItems: 0,
    search: "",
    page: 0,
    sortBy: "id",
    sortByDirection: "DESC" as "DESC" | "ASC",
    pageSize: 10,
  });

  const [isAddEditUserModalOpen, setIsAddEditUserModalOpen] = useState(false);
  const [editData, setEditData] = useState<UserType | null>(null);

  // Debounce ref for search input
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Opens modal for adding a new user; resets editData to null.
  const handleOpenAddUserModal = () => {
    setEditData(null);
    setIsAddEditUserModalOpen(true);
  };

  // Opens modal in "edit" mode.
  const handleEditUser = (user: UserType) => {
    setEditData(user);
    setIsAddEditUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddEditUserModalOpen(false);
    setEditData(null);
  };

  // Fetch users from API
  const fetchUserList = useCallback(
    async (params: PaginationParamsWithUser) => {
      if (!orgId || tabValue !== "adminusers") return;
      setPageState((old) => ({ ...old, isLoading: true }));
      const urlParams = preparePaginationParams(params);

      try {
        const organizationType = orgnType === "WP" ? "WaterPurveyor" : "TestingCompany";

        const response = await axiosInstance.get<any>(`/users/userDataBasedOnRoleId`, {
          params: { organizationId: orgId, organizationType, ...urlParams },
        });

        if (response.status === 204) {
          setPageState((prev) => ({
            ...prev,
            isLoading: false,
            totalPages: 0,
            totalItems: 0,
            page: 0,
            search: "",
            sortBy: "id",
            sortByDirection: "DESC",
            pageSize: 10,
          }));
          setUserList([]);

          return;
        }

        setUserList(response.data.data);
        const meta: PaginationMeta = response.data.meta;

        setPageState((old) => ({
          ...old,
          isLoading: false,
          totalPages: meta.totalPages,
          pageSize: meta.itemsPerPage,
          totalItems: meta.totalItems,
          page: meta.currentPage - 1, // assuming API pages start at 1
        }));
      } catch (error: any) {
        setPageState((old) => ({ ...old, isLoading: false }));

        if (isAxiosError(error) && error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("An error occurred while fetching users.");
          console.error(error);
        }
      }
    },
    [orgId, orgnType, tabValue]
  );

  useEffect(() => {
    fetchUserList({
      page: pageState.page,
      limit: pageState.pageSize,
      sortBy: pageState.sortBy,
      sortByDirection: pageState.sortByDirection,
      search: pageState.search,
      totalPages: pageState.totalPages,
      organizationId: orgId,
    });
  }, [
    orgId,
    fetchUserList,
    pageState.page,
    pageState.pageSize,
    pageState.sortBy,
    pageState.sortByDirection,
    pageState.search,
    pageState.totalPages,
    tabValue,
  ]);

  // Define table columns
  const columns: GridColDef[] = [
    {
      minWidth: 80,
      field: "id",
      headerName: "ID",
      renderCell: ({ row }: { row: UserType }) => (
        <Typography
          noWrap
          sx={{
            fontWeight: 600,
            color: "primary.main",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {/* Clicking the ID will trigger edit */}
          <Link onClick={() => handleEditUser(row)} sx={{ cursor: "pointer" }}>
            {row.id}
          </Link>
        </Typography>
      ),
    },
    {
      minWidth: 200,
      field: "fullName",
      headerName: "Name",
      sortable: false,
      renderCell: ({ row }: { row: UserType }) => (
        <Typography noWrap sx={{ fontWeight: 600, color: "text.secondary" }}>
          {`${row.firstName} ${row.lastName}`}
        </Typography>
      ),
    },
    {
      minWidth: 200,
      field: "username",
      headerName: "User Name",
      sortable: false,
      renderCell: ({ row }: { row: UserType }) => (
        <Typography noWrap sx={{ fontWeight: 600, color: "text.secondary" }}>
          {row.email}
        </Typography>
      ),
    },
    {
      minWidth: 300,
      field: "email",
      headerName: "Email",
      sortable: false,
      renderCell: ({ row }: { row: UserType }) => (
        <Typography noWrap sx={{ fontWeight: 600, color: "text.secondary" }}>
          {row.email}
        </Typography>
      ),
    },
    {
      minWidth: 150,
      field: "phoneNo",
      headerName: "Phone",
      sortable: false,
      renderCell: ({ row }: { row: UserType }) => (
        <Typography noWrap sx={{ fontWeight: 600, color: "text.secondary" }}>
          {formatPhoneNo(row.phoneNo)}
        </Typography>
      ),
    },
    {
      minWidth: 100,
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: ({ row }: { row: UserType }) => (
        <>
          <GridActionsCellItem
            label="Edit"
            icon={<Icon icon="bx:pencil" fontSize={20} />}
            onClick={() => handleEditUser(row)}
            showInMenu
          />
          {/*
          <GridActionsCellItem
            label="Delete"
            icon={<Icon icon="bx:trash-alt" fontSize={20} />}
            onClick={() => handleDelete(row.id)}
            showInMenu
          />
          */}
        </>
      ),
    },
  ];

  // CSV Export setup (using the helper to format phone numbers)
  const headers = [
    { label: "Id", key: "id" },
    { label: "Name", key: "fullName" },
    { label: "Username", key: "username" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phoneNo" },
    { label: "Organization Name", key: "organization.organizationName" },
    { label: "City", key: "organization.city" },
  ];

  const formattedDate = format(new Date(), "MM-dd-yyyy_HH-mm-ss");
  const fileName = `AdminUsers_Data_${formattedDate}`;

  const getExportData = useCallback(async () => {
    try {
      const organizationType = orgnType === "WP" ? "WaterPurveyor" : "TestingCompany";

      const response = await axiosInstance.get<any>(`/users/userDataBasedOnRoleId`, {
        params: {
          organizationId: orgId,
          organizationType,
          page: 0,
          limit: 1000, // Adjust as needed
          sortBy: "id",
          sortByDirection: "ASC",
          search: "",
        },
      });

      if (response.status === 204) {
        toast.error("No data available to export.");

        return [];
      }

      const exportData = response.data.data.map((user: UserType) => ({
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        username: user.username,
        email: user.email,
        phoneNo: formatPhoneNo(user.phoneNo),
        "organization.organizationName": user.organization?.organizationName || "",
        "organization.city": user.organization?.city || "",
      }));

      return exportData;
    } catch (error: any) {
      toast.error("Failed to export data.");
      console.error(error);

      return [];
    }
  }, [orgId, orgnType]);

  // Debounced search handler
  const searchData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setPageState((prev) => ({ ...prev, search: value }));

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchUserList({
        page: 0,
        limit: pageState.pageSize,
        sortBy: pageState.sortBy,
        sortByDirection: pageState.sortByDirection,
        search: value,
        totalPages: pageState.totalPages,
        organizationId: orgId,
      });
    }, 800);
  };

  const handleSuccess = () => {
    fetchUserList({
      page: pageState.page,
      limit: pageState.pageSize,
      sortBy: pageState.sortBy,
      sortByDirection: pageState.sortByDirection,
      search: pageState.search,
      totalPages: pageState.totalPages,
      organizationId: orgId,
    });
  };

  return (
    <Box>
      <Card>
        <CardHeader title="Admin Users" />
        <Divider sx={{ my: "0 !important" }} />
        <CardContent>
          <Grid container spacing={2}>
            {/* CSV Export and Add User Button */}
            <Grid item sm={6} xs={12}>
              <ExportToCsvButton
                getDataAsync={getExportData}
                headersArray={headers}
                fileNameInputs={fileName}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <Box
                sx={{
                  justifyContent: "flex-end",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <CustomTextField
                  size="small"
                  placeholder="Search..."
                  sx={{ marginRight: "20px", width: "100%" }}
                  value={pageState.search}
                  onChange={searchData}
                />
                <Button variant="contained" color="primary" onClick={handleOpenAddUserModal}>
                  Add User
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <DataGrid
                autoHeight
                getRowId={(row) => row.id}
                disableRowSelectionOnClick
                rows={userList}
                rowCount={pageState.totalItems}
                columns={columns}
                loading={pageState.isLoading}
                paginationMode="server"
                sortingMode="server"
                paginationModel={{ page: pageState.page, pageSize: pageState.pageSize }}
                onPaginationModelChange={(model) =>
                  setPageState((prev) => ({
                    ...prev,
                    page: model.page,
                    pageSize: model.pageSize,
                  }))
                }
                onSortModelChange={(sortModel: GridSortModel) => {
                  if (sortModel.length > 0) {
                    const { field, sort } = sortModel[0];

                    setPageState((prev) => ({
                      ...prev,
                      sortBy: field,
                      sortByDirection: sort === "desc" ? "DESC" : "ASC",
                    }));
                  }
                }}
              />
            </Grid>
          </Grid>

          {/* Add/Edit User Modal */}
          <AddUserModal
            orgId={orgId}
            isOpen={isAddEditUserModalOpen}
            onClose={handleCloseAddUserModal}
            editData={editData}
            orgnType={orgnType}
            onSuccess={handleSuccess}
          />

          {/* Optionally add DeleteUser modal here */}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TabAdminUsers;
