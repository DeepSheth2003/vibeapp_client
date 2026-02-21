import React, { useState } from "react";
import { Layout, Drawer, Grid } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const { Content, Sider } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = () => {
  const screens = useBreakpoint();
  const [visible, setVisible] = useState(false);

  // Responsive logic: Sidebar is permanent on 'md' (768px) and above
  const isMobile = !screens.md;

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "transparent" }}>
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Sider
          width={80}
          theme="dark" // AntD default, but Mantine sidebar will override look
          style={{
            backgroundColor: "transparent",
            height: "100vh",
            position: "fixed",
            left: 0,
          }}
        >
          <Sidebar />
        </Sider>
      )}

      {/* MOBILE DRAWER */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setVisible(false)}
        open={visible}
        width={80}
        styles={{ body: { padding: 0, backgroundColor: "#1A1B1E" } }} // Match Mantine dark theme
      >
        <Sidebar onAction={() => setVisible(false)} />
      </Drawer>

      <Layout 
        style={{ 
          marginLeft: isMobile ? 0 : 80, 
          transition: "margin 0.2s",
          backgroundColor: "transparent"
        }}
      >
        <Content style={{ display: "flex", flexDirection: "column", color: "white" }}>
          <Outlet />
        </Content>
      </Layout>

      {/* Mobile-only floating button to open menu if needed */}
      {isMobile && (
        <div 
          onClick={() => setVisible(true)}
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 100,
            width: 40,
            height: 40,
            background: 'rgba(95, 61, 196, 1)',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          ☰
        </div>
      )}
    </Layout>
  );
};

export default MainLayout;