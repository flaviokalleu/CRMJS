import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleDrawerClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "grey.900",
        overflow: "hidden", // Prevent overflow at root level
      }}
    >
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={sidebarOpen}
        onClose={handleDrawerClose}
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            bgcolor: "grey.800",
            color: "white",
            borderRight: "1px solid",
            borderColor: "grey.700",
            overflowY: "auto", // Allow scrolling within sidebar if needed
          },
        }}
      >
        <Sidebar open={sidebarOpen} handleDrawerClose={handleDrawerClose} />
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden", // Prevent content overflow
        }}
      >
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: "grey.900",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            ...(isMobile && sidebarOpen && { display: "none" }),
          }}
        >
          
        </AppBar>

        {/* Content Area */}
        <Box
          component="main"
          
        >
          <Box
            sx={{
              flexGrow: 1, // Take up all available space
              width: "100%", // Full width of parent
              height: "100%", // Full height of parent
              boxSizing: "border-box",
              overflow: "auto", // Allow scrolling if content overflows
            }}
          >
            {children}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: "grey.900",
           
            borderColor: "grey.700",
            flexShrink: 0, // Prevent footer from shrinking
          }}
        >
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;