import { useEffect, useState } from "react";
import { Indicator } from "@mantine/core";
import api from "../services/axios";
import { Stack, Tooltip, ActionIcon } from "@mantine/core";
import {
  IconMessageCircle,
  IconSearch,
  IconBell,
  IconSettings,
  IconUserFilled,
} from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ onAction }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);

  const iconSize = 22;

  const navItems = [
    { icon: <IconMessageCircle size={iconSize} />, path: "/chat" },
    { icon: <IconSearch size={iconSize} />, path: "/search" },
    { icon: <IconBell size={iconSize} />, path: "/notifications" },
    { icon: <IconUserFilled size={iconSize} />, path: "/profile" },
    { icon: <IconSettings size={iconSize} />, path: "/settings" },
  ];

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get("/notifications");
        const unread = res.data.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUnread();
  }, [location.pathname]); // refresh when page changes

  const handleNav = (path) => {
    navigate(path);
    if (onAction) onAction(); // Closes AntD drawer on mobile
  };

  return (
    <Stack
      align="center"
      justify="space-between"
      h="100vh"
      p="md"
      style={{
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Stack gap="lg">
        {navItems.map((item, index) => (
          <Tooltip
            key={index}
            label={item.path.replace("/", "") || "chats"}
            position="right"
          >
            <ActionIcon
              variant={location.pathname === item.path ? "filled" : "subtle"}
              size="lg"
              radius="xl"
              onClick={() => handleNav(item.path)}
            >
              {item.path === "/notifications" ? (
                <Indicator
                  inline
                  label={unreadCount > 9 ? "9+" : unreadCount}
                  size={16}
                  disabled={unreadCount === 0}
                  color="red"
                >
                  {item.icon}
                </Indicator>
              ) : (
                item.icon
              )}
            </ActionIcon>
          </Tooltip>
        ))}
      </Stack>
    </Stack>
  );
};

export default Sidebar;
