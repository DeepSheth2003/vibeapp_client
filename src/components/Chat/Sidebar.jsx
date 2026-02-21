import { TextInput, ScrollArea, Group, Avatar, Text, UnstyledButton, Stack, rem, Box, Loader, Menu } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import { useSelector } from 'react-redux';

export default function Sidebar() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search States
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Local storage se user data nikalna (Logged in user ki info)
  const user = useSelector((state) => state.auth.user); 

  // --- Logic 1: Fetch Existing Chat List ---
  const fetchChats = async () => {
    try {
      const { data } = await api.get('/chat'); // Axios instance handles headers usually
      setChats(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load chats", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // --- Logic 2: Search Friends Logic ---
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
      console.error("Search failed");
      setSearchLoading(false);
    }
  };

  // --- Logic 3: Start/Access Chat ---
  const accessChat = async (userId) => {
    try {
      const { data } = await api.post('/chat', { userId });
      
      // Agar chat list mein ye chat nahi hai, toh turant add karo list mein
      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }
      
      setSearch(""); 
      setSearchResults([]);
      navigate(`/chat/${data._id}`);
    } catch (error) {
      // Error: "You can only chat with friends!" alert
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  // Helper: Chat list mein samne wale ka naam nikalne ke liye
  const getSender = (loggedUser, participants) => {
    return participants[0]._id === loggedUser._id ? participants[1] : participants[0];
  };

  return (
    <Box p="md" h="100vh" style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
      
      {/* --- Search Section --- */}
      <Menu shadow="md" width="target" opened={searchResults.length > 0}>
        <Menu.Target>
          <TextInput
            placeholder="Search friends..."
            mb="md"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            rightSection={searchLoading && <Loader size="xs" />}
            radius="xl"
          />
        </Menu.Target>

        <Menu.Dropdown>
          {searchResults.map((userResult) => (
            <Menu.Item key={userResult._id} onClick={() => accessChat(userResult._id)}>
              <Group>
                <Avatar size="sm" radius="xl" color="blue">{userResult.username[0].toUpperCase()}</Avatar>
                <div>
                  <Text size="sm" fw={500}>{userResult.username}</Text>
                  <Text size="xs" c="dimmed">Click to start chat</Text>
                </div>
              </Group>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      {/* --- Chat List Section --- */}
      <ScrollArea scrollbarSize={4} style={{ flex: 1 }}>
        <Stack gap={0}>
          {loading ? <Loader size="sm" mx="auto" mt="xl" /> : chats.map((chat) => {
            const partner = getSender(user, chat.participants);
            return (
              <UnstyledButton
                key={chat._id}
                onClick={() => navigate(`/chat/${chat._id}`)}
                p="sm"
                style={(theme) => ({
                  borderRadius: theme.radius.md,
                  '&:hover': { backgroundColor: '#f5f5f5' },
                })}
              >
                <Group>
                  <Avatar radius="xl" size="lg" color="blue">
                    {partner.username[0].toUpperCase()}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Group justify="space-between">
                      <Text size="sm" fw={600}>{partner.username}</Text>
                      <Text size="xs" c="dimmed">
                        {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed" truncate="end">
                      {chat.latestMessage ? chat.latestMessage.text : "No messages yet"}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>
      </ScrollArea>
    </Box>
  );
}