"use client";

import React, { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import type { TooltipProps } from "@mui/material";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Grid,
  Tooltip,
  Typography
} from "@mui/material";
import type { GridColDef, GridSortModel } from "@mui/x-data-grid";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { format } from "date-fns";
import styled from "@emotion/styled";

import ExportToCsvButton from "@/components/ExportComponent";
import AddEditSuperAdmin from "@/views/superAdmin/AddEditSuperAdmin";
import type { AdminOrganizationType } from "@/types/superAdminTypes/superAdminTypes";
import axiosInstance from "@/utils/axiosInterceptor";
import Icon from "@/components/icon";

// ----------------------------------------------------
// Custom Tooltip styling
// ----------------------------------------------------
const ListToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }: any) => `
  & .MuiTooltip-tooltip {
    background-color: white;
    color: ${theme.palette.primary.main};
    font-size: 0.8rem;
  }

  & .MuiTooltip-arrow {
    color: ${theme.palette.primary.main};
  }
`);

// ----------------------------------------------------
// Data shape from API
// ----------------------------------------------------
interface OrganizationResponse {
  data: AdminOrganizationType[];
  totalItems: number;
  totalPages: number;
}

// ----------------------------------------------------
// Main Component
// ----------------------------------------------------
const WaterPurveyorOrganizationListing = () => {
  // ---------------------------------------------
  // Local UI states
  // ---------------------------------------------
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editRowData, setEditRowData] = useState<any>();
  const [editRow, setEditRow] = useState(false);

  // ---------------------------------------------
  // Table + pagination states
  // ---------------------------------------------
  const [rows, setRows] = useState<AdminOrganizationType[]>([]);

  const [pageState, setPageState] = useState({
    isLoading: false,
    page: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    sortBy: "id",
    sortByDirection: "DESC"
  });

  // ---------------------------------------------
  // Toggles
  // ---------------------------------------------
  const toggleOpen = () => {
    setAddEditModalOpen((prev) => !prev);
  };

function formatAddress(addrArr?: any[]): string {
    if (!addrArr || addrArr.length === 0) return 'No address found';

    const primaryAddr = addrArr[0];

    return [
      primaryAddr.addressLine1,
      primaryAddr.addressLine2,
      primaryAddr.city,
      primaryAddr.state,
      primaryAddr.zipCode
    ]
      .filter(Boolean)
      .join(', ');
  }


  const toggleEdit = (row: AdminOrganizationType) => {
    if (!row.organizationName) {
      console.error("organizationName is undefined");

      return;
    }

    setAddEditModalOpen(true);
    setEditRow(true);
    setEditRowData(row);
  };

  const closeModal = () => {
    setAddEditModalOpen(false);
    setEditRow(false);
    setEditRowData(null);
  };

  // ---------------------------------------------
  // CRUD ops
  // ---------------------------------------------
  // const handleDelete = async (id: string) => {
  //   const confirmDelete = window.confirm(
  //     "Are you sure you want to delete this organization?"
  //   );

  //   if (!confirmDelete) return;

  //   try {
  //     await axiosInstance.delete(
  //       `${process.env.NEXT_PUBLIC_API_URL}/organization/${id}`
  //     );
  //     await fetchOrganizations();
  //   } catch (error) {
  //     console.error("Error deleting data:", error);
  //   }
  // };

  // ---------------------------------------------
  // Fetch data
  // ---------------------------------------------
  const fetchOrganizations = useCallback(async () => {
    setPageState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response :any= await axiosInstance.get<OrganizationResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/organization`,
        {
          params: {

            page: pageState.page,
            pageSize: pageState.pageSize,
            sortBy: `${pageState.sortBy}:${pageState.sortByDirection}`
          }
        }
      );

      const { data } = response.data;

      data.forEach((org:any) => {
        if (org.address && org.address.length > 0) {
          const addr = org.address[0]

          org.addressLine1 = addr.addressLine1 || ''
          org.addressLine2 = addr.addressLine2 || ''
          org.city = addr.city || ''
          org.state = addr.state || ''
          org.postalCode = addr.zipCode || ''
        }
      })

      setRows(data)

    //  console.log(response)

      setPageState(old => ({
        ...old,
        isLoading: false,
        totalPages: response.data.meta.totalPages,
        totalItems: response.data.meta.totalItems,
        page: response.data.meta.currentPage - 1
      }))
    } catch (error) {
      console.error("Error fetching data:", error);
      setPageState((prev) => ({ ...prev, isLoading: false }));
    }


  }, [pageState.page, pageState.pageSize, pageState.sortBy, pageState.sortByDirection]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);


  //console.log(pageState)

  // ---------------------------------------------
  // DataGrid columns
  // ---------------------------------------------
  const columns : GridColDef<any>[]= [
    {
      flex: 0.1,
      minWidth: 80,
      headerName: "ID",
      field: "id",
      renderCell: ({ row }: { row: AdminOrganizationType }) => (
        <Typography noWrap sx={{ fontWeight: 400, color: "text.secondary" , fontSize: '14px'}}>
          {row.id}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      headerName: "Name",
      field: "organizationName",
      renderCell: ({ row }: { row: AdminOrganizationType }) => (
        <Link
          href={`/en/pages/adminapp-settings/apptype?orgId=${row.id}&orgType=WP`}
          passHref
          style={{
            textDecoration: "none",
            fontWeight: 400,
            color: "blue",
            cursor: "pointer", fontSize: '14px'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          {row.organizationName}
        </Link>
      )
    },
    {
      flex: 0.1,
      minWidth: 210,
      headerName: "Description",
      field: "organizationDescription",
      renderCell: ({ row }: { row: AdminOrganizationType }) => (
        <Typography noWrap sx={{ fontWeight: 400, color:  'text.primary', fontSize: '14px' }}>
          {row.organizationDescription}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 130,
      headerName: "Short Name",
      field: "organizationShortName",
      renderCell: ({ row }: { row: AdminOrganizationType }) => (
        <Typography noWrap sx={{ fontWeight: 400, color:  'text.primary', fontSize: '14px' }}>
          {row.organizationShortName}
        </Typography>
      )
    },
    {
        flex: 0.1,
        minWidth: 200,
        headerName: 'Address',
        field: 'address',
        renderCell: ({ row }: { row: any }) => {
          const addressString = formatAddress(row.address);

          return (
            <ListToolTip title={addressString}>
              <Typography noWrap sx={{ fontWeight: 400, color:  'text.primary', fontSize: '14px' }}>
                {addressString}
              </Typography>
            </ListToolTip>
          );
        }
      }
,
    {
      flex: 0.1,
      minWidth: 150,
      headerName: "Actions",
      field: "actions",
      sortable: false,
      type: "actions" as const,
      getActions: (params: any) => [
        <GridActionsCellItem
          icon={<Icon icon="bx:pencil" fontSize={20} />}
          label="Edit"
          onClick={() => toggleEdit(params.row)}
          key="edit"
        />

        // <GridActionsCellItem
        //   icon={<Icon icon="bx:trash-alt" fontSize={20} />}
        //   label="Delete"
        //   onClick={() => handleDelete(params.row.id)}
        //   key="delete"
        // />
      ]
    }
  ];

  // ---------------------------------------------
  // Export function
  // ---------------------------------------------
  const fetchOrganizationsForExport = async (): Promise<AdminOrganizationType[]> => {
    try {
      const response = await axiosInstance.get<OrganizationResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/organization`,
        { params: { page: 0, pageSize: 1000 } }
      );

      return response.data.data;
    } catch (error) {
      console.error("Error exporting data:", error);

      return [];
    }
  };

  // ---------------------------------------------
  // Render
  // ---------------------------------------------
  return (
    <>
      <Grid container spacing={6} padding={0}>
        <Grid item xs={12}>
          <Card>
            <CardHeader style={{ paddingTop: 12, paddingBottom: 12 }} title="Organizations" />
            <Divider sx={{ m: '0 !important' }} />
            <Box
              sx={{
                p: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <ExportToCsvButton
                getDataAsync={fetchOrganizationsForExport}
                headersArray={[
                  { label: "ID", key: "id" },
                  { label: "Organization Name", key: "organizationName" },
                  { label: "Description", key: "organizationDescription" },
                  { label: "Short Name", key: "organizationShortName" }
                ]}
                fileNameInputs={`WaterPurveyor_Data_${format(new Date(), "MM-dd-yyyy_HH:mm:ss")}`}
              />
              <Button variant="contained" color="primary" onClick={toggleOpen}>
                Add
              </Button>
            </Box>
              <Grid item xs={12}  sx={{padding:0, margin:0}}>
              <DataGrid
                autoHeight
                rowHeight={45}
                columnHeaderHeight={40}
                disableRowSelectionOnClick
                rows={rows}
                rowCount={pageState.totalItems}
                columns={columns}
                loading={pageState.isLoading}
                paginationMode="server"
                sortingMode="server"
                pagination
                pageSizeOptions={[5, 10, 25, 50]}

                paginationModel={{
                  page: pageState.page,
                  pageSize: pageState.pageSize
                }}
                onPaginationModelChange={(model) => {
                  setPageState((prev) => ({
                    ...prev,
                    page: model.page,
                    pageSize: model.pageSize
                  }));
                }}
                sx={{

                  paddingTop:10,
                 '& .MuiDataGrid-cell': {
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'flex-start',
                   paddingLeft:5,

                 //  fontSize: '16px'

                 },
                 border: 0,
                 '& .MuiDataGrid-columnHeaders': {
                   backgroundColor: '#F5F6F8',
                 },
               '& .MuiDataGrid-columnHeaderTitle': {
                 paddingLeft:2,
                 textTransform: 'uppercase',
               }
               }}
                onSortModelChange={(sortModel: GridSortModel) => {
                  if (sortModel.length > 0) {
                    const { field, sort } = sortModel[0];

                    setPageState((prev) => ({
                      ...prev,
                      sortBy: field,
                      sortByDirection: sort === "desc" ? "DESC" : "ASC"
                    }));
                  }
                }}
              />
             </Grid>
                      </Card>
                    </Grid>
                  </Grid>

      <AddEditSuperAdmin
        openModal={addEditModalOpen}
        closeModal={closeModal}
        editRow={editRow}
        editRowData={editRowData}
        ReFetchListing={fetchOrganizations}
      />
    </>
  );
};

export default WaterPurveyorOrganizationListing;
