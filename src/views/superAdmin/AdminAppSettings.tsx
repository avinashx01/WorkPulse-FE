"use client";

import type { SyntheticEvent, ReactElement } from "react";
import React, { useState, useEffect, useCallback } from "react";

// ** Next.js 13 App Router Hooks
import { useParams, useSearchParams, useRouter } from "next/navigation";

// ** MUI Imports
import { CircularProgress, Grid, Tab, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";

import type { TabListProps } from "@mui/lab/TabList";
import MuiTabList from "@mui/lab/TabList";
import toast from "react-hot-toast";

// ** Icon Imports
import Icon from "@/components/icon";

// ** Example Hooks or Utils
// import { useAuth } from '@/hooks/useAuth'
// import axios from 'axios'

// ** Example Tab Components
import TabAppType from "./TabAppType";
import {axiosInterceptor} from "@/utils/axiosInterceptor"; // Adjusted based on ESLint fix
import TabAdminUsers from "./TabAdminUsers";
import TabStripePayment from "./TabStripePayment";
import TabImage from "./TabImage";

// --------------------------------------------------
// Example: organizationData interface
// --------------------------------------------------
export interface OrganizationData {
  orgId?: string;
  organizationName: string;
  organizationShortName: string;
  email?: string;
}



// --------------------------------------------------
// Styled TabList
// --------------------------------------------------
const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  "& .MuiTabs-indicator": {
    display: "none",
  },
  "& .MuiTab-root": {
    minWidth: 25,
    minHeight: 20,
    fontSize: "0.775rem",
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    "&.Mui-selected": {
      color: theme.palette.common.white,
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

// --------------------------------------------------
// Utility Function
// --------------------------------------------------
const getParamAsString = (param?: string | string[]): string => {
  if (Array.isArray(param)) {
    return param[0];
  }

  return param || "";
};

// --------------------------------------------------
// Main Component
// --------------------------------------------------
export default function AdminAppSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Extract parameters safely
  const lang = getParamAsString(params.lang);
  const tab = getParamAsString(params.tab);

  // -----------------------------
  // Local state
  // -----------------------------
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Active tab = dynamic segment, fallback to 'apptype'
  const [activeTab, setActiveTab] = useState<string>(tab || "apptype");

  // orgId and orgType from query params
  const [orgId, setOrgId] = useState<string>("");
  const [orgType, setOrgType] = useState<string>("");

  // Example: (Optional) store data fetched from the server
  const [data, setData] = useState<OrganizationData>({
    orgId: "",
    organizationName: "",
    organizationShortName: "",
    email: "",
  });

  // MUI media query for hiding text on small screens
  const hideText = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // -----------------------------
  // Effects
  // -----------------------------

  // Effect: On mount or when `params` / `searchParams` changes, update local states
  useEffect(() => {
    const newTab = getParamAsString(params.tab) || "apptype";

    setActiveTab(newTab);

    const newOrgId = searchParams.get("orgId") || "";
    const newOrgType = searchParams.get("orgType") || "";

    setOrgId(newOrgId);
    setOrgType(newOrgType);

  }, [params, searchParams]);


  const fetchData = useCallback(async () => {
    try {
      if (!orgId) return;

      // Define the response type
      interface OrganizationResponse {
        id: string;
        organizationName: string;
        organizationShortName: string;
        emailId: string;


      }

      const response = await axiosInterceptor.get<OrganizationResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/organization/${orgId}`
      );

      setData({
        orgId: response.data.id,
        organizationName: response.data.organizationName,
        organizationShortName: response.data.organizationShortName,
        email: response.data.emailId,
      });
    } catch (error) {
      toast.error("Failed to get organization data");
    }
  }, [orgId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -----------------------------
  // Tab Navigation
  // -----------------------------
  const handleChange = (event: SyntheticEvent, value: string) => {
    setIsLoading(true);

    router.push(`/${lang}/pages/adminapp-settings/${value}?orgId=${orgId}&orgType=${orgType}`);
    setTimeout(() => setIsLoading(false), 500);
  };

  // Mapping each tab value to its component
  const tabContentList: { [key: string]: ReactElement } = {
    apptype: <TabAppType orgId={orgId} tabValue={activeTab} orgnType={orgType} />,
    adminusers: <TabAdminUsers orgId={orgId} tabValue={activeTab} orgnType={orgType} />,
    stripepayment : <TabStripePayment orgId={orgId} tabValue={activeTab} />,
    imagetab : <TabImage orgId={orgId} tabValue={activeTab} orgShortName={data.organizationShortName} />

  };

  // If the user typed a tab that doesn’t exist, default to 'apptype'
  const currentContent = tabContentList[activeTab] || tabContentList["apptype"];

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TabContext value={activeTab}>
          <Grid container spacing={3}>
            {/* Left side: Organization Info (replace with your real data) */}
            <Grid item xs={2.5}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "column",
                  height: "58px",
                  padding: "0 16px",
                  backgroundColor: "background.paper",
                  boxShadow: (theme: Theme) => theme.shadows[3],
                  borderRadius: "4px",
                  mr: 2,
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "text.primary", fontSize: "0.75rem" }}>
                  Organization Name
                  <span style={{ color: "blue", fontSize: "0.75rem", marginLeft: 5 }}>
                    {data.organizationName}
                  </span>
                </Typography>
              </Box>
            </Grid>

            {/* Top Tabs */}
            <Grid item xs={9.5}>
              <TabList
                variant="scrollable"
                scrollButtons="auto"
                TabScrollButtonProps={{ sx: { color: "blue" } }}
                onChange={handleChange}
                aria-label="Admin App Settings Tabs"
              >
                <Tab
                  value="apptype"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", marginLeft: -2 }}>
                      <Icon icon="bx:food-menu" />
                      {!hideText && "App Type"}
                    </Box>
                  }
                />
                <Tab
                  value="adminusers"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", marginLeft: -1 }}>
                      <Icon icon="material-symbols:account-balance-outline" />
                      {!hideText && "Admin Users"}
                    </Box>
                  }
                />


                <Tab
                  value="stripepayment"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                      <Icon icon="mdi:clock-time-three-outline" />
                      {!hideText && "Stripe Payment"}
                    </Box>
                  }
                />


                {orgType === "WP" && (
                  <Tab
                    value="imagetab"
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column", marginLeft: -1 }}>
                        <Icon icon="hugeicons:image-upload" /> {!hideText && "Image"}
                      </Box>
                    }
                  />
                )}
              </TabList>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12}>
              {isLoading ? (
                <Box sx={{ mt: 6, display: "flex", alignItems: "center", flexDirection: "column" }}>
                  <CircularProgress sx={{ mb: 4 }} />
                  <Typography>Loading...</Typography>
                </Box>
              ) : (
                <TabPanel sx={{ p: 0, border: 0, boxShadow: 0, backgroundColor: "transparent" }} value={activeTab}>
                  {currentContent}
                </TabPanel>
              )}
            </Grid>
          </Grid>
        </TabContext>
      </Grid>
    </Grid>
  );
}
