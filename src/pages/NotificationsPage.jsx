import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Text,
  Avatar,
  Group,
  ScrollArea,
  UnstyledButton,
  Badge,
  Loader,
  Button,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import api from "../services/axios";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleAccept = async (notification) => {
    try {
      await api.post(`/users/accept/${notification.sender._id}`);

      // 🔥 delete notification permanently
      await api.delete(`/notifications/${notification._id}`);

      setNotifications((prev) =>
        prev.filter((n) => n._id !== notification._id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (notification) => {
    try {
      await api.post(`/users/reject/${notification.sender._id}`);

      // 🔥 delete notification permanently
      await api.delete(`/notifications/${notification._id}`);

      setNotifications((prev) =>
        prev.filter((n) => n._id !== notification._id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}`);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        p="xl"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Group gap="xs">
          <IconBell size={22} />
          <Text fw={400} size="lg">
            Notifications
          </Text>
        </Group>
      </Box>

      {/* Content */}
      <ScrollArea style={{ flex: 1 }}>
        <Box maw={600} mx="auto" w="100%" p="md">
          {loading ? (
            <Stack align="center" mt="xl">
              <Loader />
            </Stack>
          ) : notifications.length === 0 ? (
            <Stack align="center" mt="xl">
              <Text c="dimmed">No notifications yet</Text>
            </Stack>
          ) : (
            <Stack spacing={6}>
              {notifications.map((notification) => (
                <UnstyledButton
                  key={notification._id}
                  p="md"
                  onClick={() =>
                    !notification.isRead &&
                    handleMarkAsRead(notification._id)
                  }
                  style={{
                    borderRadius: 12,
                    backgroundColor: notification.isRead
                      ? "transparent"
                      : "rgba(0, 150, 255, 0.08)",
                    transition: "0.2s ease",
                  }}
                >
                  <Group justify="space-between" align="flex-start">
                    <Group gap="md" align="flex-start">
                        <Avatar radius="xl">
                        {notification.sender?.username?.[0]?.toUpperCase()}
                        </Avatar>

                        <Box>
                        <Text size="sm" fw={500}>
                            {notification.type === "follow_request" && !notification.isRead &&
                            `${notification.sender?.username} sent you a follow request`}
                            {notification.type === "follow_accept" &&
                            `${notification.sender?.username} accepted your follow request`}
                        </Text>

                        <Text size="xs" c="dimmed">
                            {new Date(notification.createdAt).toLocaleString()}
                        </Text>

                        {/* 🔥 ADD THIS BLOCK */}
                        {notification.type === "follow_request" && (
                            <Group mt="xs">
                            <Button
                                size="xs"
                                onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(notification);
                                }}
                            >
                                Accept
                            </Button>

                            <Button
                                size="xs"
                                variant="subtle"
                                color="red"
                                onClick={(e) => {
                                e.stopPropagation();
                                handleReject(notification);
                                }}
                            >
                                Reject
                            </Button>
                            </Group>
                        )}
                        </Box>
                    </Group>

                    {!notification.isRead && (
                        <Badge color="cyan" variant="filled" size="xs">
                        New
                        </Badge>
                    )}
                    </Group>
                </UnstyledButton>
              ))}
            </Stack>
          )}
        </Box>
      </ScrollArea>
    </Box>
  );
};

export default NotificationsPage;