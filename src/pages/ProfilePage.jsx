import {
  Container,
  Avatar,
  Text,
  Group,
  Stack,
  Button,
  Divider,
  TextInput,
  Title,
  Box,
  Grid,
  Modal,
  ScrollArea,
  UnstyledButton,
  Center,
  PasswordInput,
  ActionIcon,
  Paper,
} from "@mantine/core";
import {
  IconLogout,
  IconExternalLink,
  IconChevronRight,
  IconShieldCheck,
  IconUserCircle,
  IconAt,
  IconSettings,
  IconMail,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import api from "../services/axios";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempName, setTempName] = useState("");
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

  // Modals States
  const [editModal, setEditModal] = useState(false);
  const [securityModal, setSecurityModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [networkModal, setNetworkModal] = useState({
    open: false,
    type: "followers",
  });

  // --- 1. Fetch User Profile Data ---
  // Yeh function component mount hone par (useEffect) ya kisi update ke baad profile refresh karne ke liye hai.
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users/profile");
      setProfile(data);
      setLoading(false);
    } catch (error) {
      notifications.show({
        title: "Fetch Error",
        message: error.response?.data?.message || "Failed to load profile",
        color: "red",
      });
      setLoading(false);
    }
  };

  // useEffect mein fetchProfile ke baad ise set karein
  useEffect(() => {
    fetchProfile();
  }, []);

  // Naya useEffect add karein jo profile load hote hi tempName set kare
  useEffect(() => {
    if (profile) setTempName(profile.name || "");
  }, [profile]);

  // --- 2. Update Basic Profile (Name) ---
  // Note: Username aur Email disabled hain, toh abhi sirf 'name' update hoga.
  const handleUpdateProfile = async (newName) => {
    if (!newName.trim()) return;
    try {
      const { data } = await api.put("/users/profile/update", {
        name: newName,
      });

      notifications.show({
        title: "Success",
        message: "Profile updated successfully ✨",
        color: "green",
      });

      setEditModal(false);
      fetchProfile(); // Data refresh karne ke liye
    } catch (error) {
      notifications.show({
        title: "Update Failed",
        message: error.response?.data?.message || "Something went wrong",
        color: "red",
      });
    }
  };

  // --- 3. Change Password Logic ---
  // Iske liye hume currentPassword, newPassword aur confirmPassword backend par bhejna hoga.
  const handlePasswordChange = async () => {
    // Frontend Validations
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      return notifications.show({
        message: "All fields are required",
        color: "orange",
      });
    }

    if (passwords.new !== passwords.confirm) {
      return notifications.show({
        message: "New passwords do not match",
        color: "red",
      });
    }

    if (passwords.new.length < 8) {
      return notifications.show({
        message: "Password must be at least 8 characters",
        color: "orange",
      });
    }

    try {
      await api.put("/users/profile/password", {
        oldPassword: passwords.old,
        newPassword: passwords.new,
      });

      notifications.show({
        title: "Security Updated",
        message: "Password changed successfully. Keep it safe!",
        color: "green",
      });

      // Reset state and close modal
      setSecurityModal(false);
      setPasswords({ old: "", new: "", confirm: "" });
    } catch (error) {
      notifications.show({
        title: "Security Error",
        message: error.response?.data?.message || "Failed to update password",
        color: "red",
      });
    }
  };

  // --- 4. Handle User Logout ---
  // Backend par status 'offline' mark karke local state aur storage clear karta hai.
  const handleLogout = async () => {
    try {
      // Optional: Backend notify karna ki user logout kar raha hai
      await api.post("/auth/logout");

      // Clear Redux State
      dispatch(logout());

      // Clear Local Storage
      localStorage.removeItem("token");

      // Redirect to Login
      navigate("/login");

      notifications.show({
        title: "Logged Out",
        message: "Come back soon to vibe again! 👋",
        color: "blue",
      });
    } catch (error) {
      // Error aane par bhi user ko logout kar dena chahiye safe side ke liye
      dispatch(logout());
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (loading)
    return (
      <Center h="100vh" bg="#050505">
        <Stack align="center" gap="xs">
          <Box className="loader-pulse" /> {/* Add CSS pulse for vibe */}
          <Text c="indigo.4" fw={700} lts={2} size="sm">
            VIBING...
          </Text>
        </Stack>
      </Center>
    );

  return (
    <Box minHeight="100vh" py={{ base: 40, sm: 80 }}>
      <Container size="sm">
        {/* --- Profile Header Card --- */}
        <Paper p={{ base: "lg", sm: "xl" }} radius="lg" style={{}}>
          <Grid gutter={30} align="center">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Center>
                <Box style={{ position: "relative" }}>
                  <Avatar
                    src={profile.avatar}
                    size={120}
                    radius="100%"
                    styles={{
                      root: {
                        border: "3px solid #6366f1",
                        padding: "4px",
                        backgroundColor: "#0b0b0d",
                      },
                    }}
                  >
                    {profile.username[0].toUpperCase()}
                  </Avatar>
                </Box>
              </Center>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 8 }}>
              <Stack gap="xs" align={{ base: "center", sm: "flex-start" }}>
                <Group justify="space-between" w="100%">
                  <Title
                    order={2}
                    c="white"
                    fw={600}
                    style={{ letterSpacing: "-0.5px" }}
                  >
                    {profile.username}
                  </Title>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    radius="md"
                    onClick={() => setEditModal(true)}
                  >
                    <IconSettings size={20} />
                  </ActionIcon>
                </Group>

                <Text size="sm" c="dimmed" fw={500}>
                  {profile.name || "Vibe Member"}
                </Text>

                <Group gap="xl" mt="md">
                  <StatButton
                    label="Followers"
                    count={profile.followers?.length}
                    onClick={() =>
                      setNetworkModal({ open: true, type: "followers" })
                    }
                  />
                  <StatButton
                    label="Following"
                    count={profile.following?.length}
                    onClick={() =>
                      setNetworkModal({ open: true, type: "following" })
                    }
                  />
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* --- Quick Actions --- */}
        <Stack gap={10} mt={30}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={1} px="md">
            Account Preferences
          </Text>
          <Paper
            bg="#0b0b0d"
            radius="lg"
            style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}
          >
            <SettingItem
              icon={<IconUserCircle size={20} />}
              label="Edit Public Profile"
              onClick={() => setEditModal(true)}
            />
            <Divider color="#1a1a1a" />
            <SettingItem
              icon={<IconShieldCheck size={20} />}
              label="Security & Password"
              onClick={() => setSecurityModal(true)}
            />
            <Divider color="#1a1a1a" />
            <SettingItem
              icon={<IconLogout size={20} />}
              label="Log out of session"
              color="red.4"
              onClick={() => setLogoutModal(true)}
            />
          </Paper>
          <Text size="xs" ta="center" c="dimmed" mt="lg">
            Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </Stack>
      </Container>

      {/* --- REFINED MODALS --- */}

      {/* Network Modal */}
      <Modal
        opened={networkModal.open}
        onClose={() => setNetworkModal({ ...networkModal, open: false })}
        title={
          <Text fw={700} size="lg">
            {networkModal.type === "followers" ? "Followers" : "Following"}
          </Text>
        }
        centered
        radius="lg"
        styles={modalStyles}
      >
        <ScrollArea h={350} scrollbarSize={4}>
          <Stack gap="xs" p="xs">
            {profile[networkModal.type]?.map((user) => (
              <Group
                key={user._id}
                justify="space-between"
                p="sm"
                className="hover-list-item"
                style={{ borderRadius: "12px", transition: "0.2s" }}
              >
                <Group gap="sm">
                  <Avatar size="md" radius="xl" src={user.avatar}>
                    {user.username[0]}
                  </Avatar>
                  <Stack gap={0}>
                    <Text size="sm" fw={600} c="white">
                      @{user.username}
                    </Text>
                    <Text size="xs" c="dimmed">
                      View Profile - feature coming soon!
                    </Text>
                  </Stack>
                </Group>
                <ActionIcon variant="light" color="indigo" radius="md">
                  <IconExternalLink size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        </ScrollArea>
      </Modal>

      {/* Logout Confirmation */}
      <Modal
        opened={logoutModal}
        onClose={() => setLogoutModal(false)}
        centered
        withCloseButton={false}
        size="xs"
        radius="lg"
        styles={{
          content: { backgroundColor: "#0b0b0d", border: "1px solid #262626" },
        }}
      >
        <Stack gap="md" p="xl" ta="center">
          <IconLogout size={40} color="#f03e3e" style={{ margin: "0 auto" }} />
          <Box>
            <Text fw={700} c="white" size="lg">
              Logging out?
            </Text>
            <Text size="sm" c="dimmed">
              You will need to login again to access your vibes.
            </Text>
          </Box>
          <Group grow>
            <Button
              variant="default"
              onClick={() => setLogoutModal(false)}
              radius="md"
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleLogout} radius="md">
              Logout
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        opened={editModal}
        onClose={() => setEditModal(false)}
        title={<Text fw={700}>Edit Profile</Text>}
        centered
        radius="lg"
        styles={modalStyles}
      >
        <Stack gap="lg">
          <TextInput
            label="Name"
            placeholder="Enter your name"
            leftSection={<IconUserCircle size={18} />}
            defaultValue={profile.name}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            styles={inputStyles}
          />
          <TextInput
            label="Username"
            leftSection={<IconAt size={18} />}
            defaultValue={profile.username}
            disabled
            description="Feature coming soon!"
            styles={inputStyles}
          />
          <TextInput
            label="Email"
            leftSection={<IconMail size={18} />}
            defaultValue={profile.email}
            disabled
            description="Email links with your account it cannot be changed, contact support if you need assistance."
            styles={inputStyles}
          />
          <Button
            fullWidth
            radius="md"
            variant="gradient"
            gradient={{ from: "pink", to: "red" }}
            size="md"
            onClick={() => handleUpdateProfile(tempName)}
          >
            Save Changes
          </Button>
        </Stack>
      </Modal>

      {/* 4. Security & Password Modal */}
      <Modal
        opened={securityModal}
        onClose={() => setSecurityModal(false)}
        title={<Text fw={700}>Security & Password</Text>}
        centered
        radius="lg"
        styles={modalStyles}
      >
        <Stack gap="lg">
          <Box>
            <PasswordInput
              label="Current Password"
              placeholder="Your current password"
              styles={inputStyles}
              // 🔥 ADD THIS:
              value={passwords.old}
              onChange={(e) =>
                setPasswords({ ...passwords, old: e.target.value })
              }
            />
          </Box>

          <Divider
            color="#1a1a1a"
            label="New Credentials"
            labelPosition="center"
          />

          <Stack gap="sm">
            <PasswordInput
              label="New Password"
              placeholder="Minimum 8 characters"
              styles={inputStyles}
              // 🔥 ADD THIS:
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Repeat new password"
              styles={inputStyles}
              // 🔥 ADD THIS:
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
            />
          </Stack>

          <Button
            fullWidth
            radius="md"
            variant="gradient"
            gradient={{ from: "red", to: "pink" }}
            size="md"
            mt="md"
            // 🔥 CHANGE THIS:
            onClick={handlePasswordChange}
          >
            Update Password
          </Button>
        </Stack>
      </Modal>
    </Box>
  );
}

// --- Sub-Components ---

function StatButton({ label, count, onClick }) {
  return (
    <UnstyledButton onClick={onClick} style={{ textAlign: "center" }}>
      <Text size="xl" fw={800} c="white" style={{ lineHeight: 1 }}>
        {count || 0}
      </Text>
      <Text size="xs" c="dimmed" tt="uppercase" lts={1} fw={700} mt={4}>
        {label}
      </Text>
    </UnstyledButton>
  );
}

function SettingItem({ icon, label, color = "white", onClick }) {
  return (
    <UnstyledButton
      onClick={onClick}
      p="md"
      w="100%"
      style={{ transition: "0.2s" }}
      className="setting-item"
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#121212")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <Group justify="space-between">
        <Group gap="md">
          <Box c={color} style={{ display: "flex" }}>
            {icon}
          </Box>
          <Text size="sm" fw={500} c={color}>
            {label}
          </Text>
        </Group>
        <IconChevronRight size={16} color="#363636" stroke={3} />
      </Group>
    </UnstyledButton>
  );
}

// --- Styling Consts ---

const modalStyles = {
  content: {
    backgroundColor: "#0b0b0d",
    color: "white",
    border: "1px solid #1a1a1a",
  },
  header: { backgroundColor: "#0b0b0d" },
  title: { color: "white" },
};

const inputStyles = {
  input: {
    backgroundColor: "#121212",
    border: "1px solid #262626",
    color: "white",
    height: "46px",
    "&:focus": { borderColor: "#6366f1" },
  },
  label: {
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#eee",
  },
  description: { fontSize: "11px", marginTop: "4px" },
};
