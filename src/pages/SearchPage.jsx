import { useState, useEffect } from "react";
import {
  TextInput,
  Stack,
  Avatar,
  Group,
  Text,
  Button,
  Loader,
  Box,
  ScrollArea,
  UnstyledButton,
} from "@mantine/core";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import api from "../services/axios";
import { useDebouncedValue } from "@mantine/hooks";
import { useSelector } from "react-redux";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query, 400);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const authUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debounced) {
        setUsers([]);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/users/search?query=${debounced}`);
        setUsers(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    searchUsers();
  }, [debounced]);

  const handleFollow = async (targetUserId) => {
    try {
      await api.post(`/users/follow/${targetUserId}`);

      // Update UI instantly
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUserId
            ? {
                ...u,
                followRequests: [...(u.followRequests || []), authUser._id],
              }
            : u
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // Matches the Login Page: 100dvh to prevent scroll issues
    <Box h="100dvh" w="100%" bg="transparent">
      <Stack h="100%" spacing={0}>
        
        {/* Search Header - Sticky and Premium */}
        <Box p="xl" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Box maw={600} mx="auto" w="100%">
            <TextInput
              placeholder="Search people on Vibe..."
              leftSection={<IconSearch size={20} stroke={1.5} />}
              size="lg"
              radius="md"
              variant="filled"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              rightSection={loading && <Loader size="xs" color="cyan" />}
              styles={{
                input: {
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '16px',
                  '&:focus': {
                    borderColor: 'var(--mantine-color-indigo-6)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }
                }
              }}
            />
          </Box>
        </Box>

        {/* Results Area - Scrollable */}
        <ScrollArea flex={1} scrollbarSize={4}>
          <Box maw={600} mx="auto" w="100%" p="md">
            <Stack spacing={4}>
              {users.map((user) => (
                <UnstyledButton
                  key={user._id}
                  p="md"
                  style={{
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                  }}
                  className="user-row-hover"
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group wrap="nowrap" gap="md">
                      <Avatar 
                        radius="xl" 
                        size="lg" 
                        src={user.avatar} // Uses user avatar if available
                        variant="gradient" 
                        gradient={{ from: 'purple', to: 'cyan' }}
                      >
                        {user.username.substring(0, 1).toUpperCase()}
                      </Avatar>
                      
                      <Box>
                        <Text fw={500} size="md" color="white">
                          @{user.username}
                        </Text>
                        <Text size="xs" color="dimmed" fw={500}>
                          {user.followers?.length || 0} followers • Catching the vibe
                        </Text>
                      </Box>
                    </Group>

                    {(() => {
                      const isFollowing = user.followers?.includes(authUser._id);
                      const isRequested = user.followRequests?.includes(authUser._id);

                      if (isFollowing) {
                        return (
                          <Button size="xs" radius="xl" variant="light" disabled>
                            Following
                          </Button>
                        );
                      }

                      if (isRequested) {
                        return (
                          <Button size="xs" radius="xl" variant="subtle" disabled>
                            Requested
                          </Button>
                        );
                      }

                      return (
                        <Button
                          variant="gradient"
                          gradient={{ from: "cyan", to: "purple" }}
                          size="xs"
                          radius="xl"
                          px="lg"
                          leftSection={<IconUserPlus size={14} />}
                          style={{ height: "32px" }}
                          onClick={() => handleFollow(user._id)}
                        >
                          Follow
                        </Button>
                      );
                    })()}
                  </Group>
                </UnstyledButton>
              ))}

              {!loading && query && users.length === 0 && (
                <Stack align="center" mt="xl" pt="xl">
                  <Text size="sm" color="dimmed" fw={500}>
                    No vibes found for "{query}"
                  </Text>
                </Stack>
              )}

              {!query && (
                <Stack align="center" mt="xl" pt="xl" spacing="xs">
                  <Text size="lg" fw={700} color="dimmed" opacity={0.5}>
                    Search for your friends
                  </Text>
                  <Text size="xs" color="dimmed">
                    Enter a username to start vibing.
                  </Text>
                </Stack>
              )}
            </Stack>
          </Box>
        </ScrollArea>
      </Stack>
    </Box>
  );
};

export default SearchPage;