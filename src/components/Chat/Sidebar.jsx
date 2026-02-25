import {
  TextInput,
  ScrollArea,
  Group,
  Avatar,
  Text,
  UnstyledButton,
  Stack,
  rem,
  Box,
  Loader,
  Menu,
  Center,
  Badge,
  Indicator,
} from "@mantine/core";
import { IconSearch, IconMessagePlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/axios";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const SOCKET_ENDPOINT =
  import.meta.env.VITE_SOCKET_ENDPOINT || "http://localhost:5000";
let socket;

export default function Sidebar() {
  const navigate = useNavigate();
  const { chatId: activeChatId } = useParams();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chat");
      setChats(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load chats", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();

    // --- Socket for Real-time List Update ---
    socket = io(SOCKET_ENDPOINT);
    socket.emit("setup", user);

    socket.on("message received", (newMessage) => {
      // Jab naya message aaye, puri list refresh karo ya local state update karo
      fetchChats();
    });

    return () => socket.disconnect();
  }, [user]);

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      const { data } = await api.get(`/users/search?query=${query}`);
      setSearchResults(data);
      setSearchLoading(false);
    } catch (error) {
      setSearchLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      const { data } = await api.post("/chat", { userId });
      fetchChats();
      setSearch("");
      setSearchResults([]);
      navigate(`/chat/${data._id}`);
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const getSender = (loggedUser, participants) => {
    return participants[0]._id === loggedUser._id
      ? participants[1]
      : participants[0];
  };

  return (
    <Box
      p="md"
      h="100vh"
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1A1B1E",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Header Section */}
      <Group justify="space-between" mb="xl">
        <Text
          fw={400}
          size="xl"
          variant="gradient"
          gradient={{ from: "cyan", to: "white" }}
        >
          Chats
        </Text>
      </Group>

      {/* Search Section */}
      <Menu shadow="md" width="target" opened={searchResults.length > 0}>
        <Menu.Target>
          <TextInput
            placeholder="Search friends..."
            mb="md"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            leftSection={
              <IconSearch
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
            rightSection={searchLoading && <Loader size="xs" />}
            radius="xl"
            styles={{
              input: {
                backgroundColor: "#25262B",
                border: "none",
                color: "white",
              },
            }}
          />
        </Menu.Target>
        <Menu.Dropdown bg="#25262B" style={{ border: "1px solid #373A40" }}>
          {searchResults.map((userResult) => (
            <Menu.Item
              key={userResult._id}
              onClick={() => accessChat(userResult._id)}
              closeMenuOnClick
            >
              <Group>
                <Avatar size="sm" radius="xl" color="indigo">
                  {userResult.username[0].toUpperCase()}
                </Avatar>
                <Text size="sm" c="white">
                  {userResult.username}
                </Text>
              </Group>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      {/* Chat List */}
      <ScrollArea scrollbarSize={4} style={{ flex: 1 }} mx="-md" px="md">
        <Stack gap={4}>
          {loading ? (
            <Center mt="xl">
              <Loader color="indigo" variant="dots" />
            </Center>
          ) : chats.length === 0 ? (
            // --- EMPTY STATE ---
            <Center h={300}>
              <Stack align="center" gap="xs">
                <IconMessagePlus size={40} color="#5C5F66" stroke={1.5} />
                <Text c="dimmed" size="sm" ta="center">
                  You don't have any chats yet.
                  <br />
                  Start your first vibe!
                </Text>
              </Stack>
            </Center>
          ) : (
            chats.map((chat) => {
              const partner = getSender(user, chat.participants);
              const isActive = activeChatId === chat._id;

              return (
                <UnstyledButton
                  key={chat._id}
                  onClick={() => navigate(`/chat/${chat._id}`)}
                  p="sm"
                  style={{
                    borderRadius: "8px",
                    backgroundColor: isActive ? "#2C2E33" : "transparent",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    !isActive &&
                    (e.currentTarget.style.backgroundColor = "#25262B")
                  }
                  onMouseLeave={(e) =>
                    !isActive &&
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Group wrap="nowrap">
                    <Indicator
                      color="green"
                      offset={5}
                      size={9}
                      disabled={!partner?.isOnline}
                      withBorder
                    >
                      <Avatar
                        radius="xl"
                        size="lg"
                        src={partner?.avatar}
                        color="indigo"
                      >
                        {partner?.username[0].toUpperCase()}
                      </Avatar>
                    </Indicator>

                    <Box style={{ flex: 1 }}>
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="sm" fw={600} c="white" truncate>
                          {partner?.username}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {chat.latestMessage
                            ? new Date(
                                chat.latestMessage.createdAt,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </Text>
                      </Group>

                      <Group justify="space-between" wrap="nowrap" mt={2}>
                        <Text
                          size="xs"
                          c={chat.unreadCount > 0 ? "indigo.3" : "dimmed"}
                          truncate
                          style={{ maxWidth: "180px" }}
                        >
                          {chat.latestMessage
                            ? chat.latestMessage.text
                            : "Tap to vibe ✨"}
                        </Text>
                        {chat.unreadCount > 0 && (
                          <Badge size="xs" circle color="indigo">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </Group>
                    </Box>
                  </Group>
                </UnstyledButton>
              );
            })
          )}
        </Stack>
      </ScrollArea>
    </Box>
  );
}
