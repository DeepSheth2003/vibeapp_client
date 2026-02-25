import {
  Box,
  Text,
  Center,
  Stack,
  ThemeIcon,
  Container,
  rem,
  Group,
} from "@mantine/core";
import {
  IconMessageHeart,
  IconSparkles,
  IconUsersGroup,
} from "@tabler/icons-react";
import { SiLivechat } from "react-icons/si";

export default function Dashboard() {
  // Advertise Quotes Suggestions:
  // 1. "Echo your soul, one vibe at a time."
  // 2. "Where conversations turn into connections."
  // 3. "Don't just chat, feel the frequency."

  return (
    <Box
      h="100vh"
      w="100%"
      bg="#0b0b0d"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at center, #1a1b1e 0%, #0b0b0d 100%)",
        overflow: "hidden",
      }}
    >
      <Container size="sm">
        <Center>
          <Stack align="center" gap="md">
            {/* --- Icon Group with Soft Glow --- */}
            <Box style={{ position: "relative", marginBottom: rem(20) }}>
              <ThemeIcon
                size={rem(80)}
                radius="100%"
                variant="gradient"
                gradient={{ from: "indigo", to: "white", deg: 45 }}
                style={{ boxShadow: "0 0 40px rgba(95, 61, 196, 0.4)" }}
              >
                <SiLivechat size={rem(45)} stroke={1.5} color="white" />
              </ThemeIcon>
              {/* Decorative Floating Sparkle Icon */}
              <Box style={{ position: "absolute", top: -10, right: -10 }}>
                <IconSparkles
                  size={rem(24)}
                  color="#22d3ee"
                  style={{ opacity: 0.8 }}
                />
              </Box>
            </Box>

            {/* --- Main Logo Text (Responsive Size) --- */}
            <Text
              ta="center"
              fw={400}
              variant="gradient"
              gradient={{ from: "indigo", to: "white", deg: 90 }}
              style={{
                lineHeight: 1,
                fontSize: "clamp(40px, 8vw, 65px)", // Responsive font scaling
                letterSpacing: "-1.5px",
              }}
            >
              VibeApp
            </Text>

            {/* --- Subtext (Responsive Layout) --- */}
            <Group gap="xs" mt="xs" wrap="nowrap" justify="center">
              <IconUsersGroup
                size={rem(20)}
                color="white"
                style={{ opacity: 0.5 }}
              />
              <Text
                size="clamp(14px, 4vw, 18px)"
                c="white"
                ta="center"
                style={{ opacity: 0.6, fontWeight: 400 }}
              >
                Make friends to start a vibing conversation
              </Text>
            </Group>

            {/* --- Advertise Quote Section --- */}
            <Stack align="center" mt={rem(50)} gap={4}>
              <Text
                size="xs"
                c="indigo.2"
                fw={700}
                style={{
                  letterSpacing: rem(2),
                  textTransform: "uppercase",
                  opacity: 0.8,
                }}
              >
                The Ultimate Vibe
              </Text>

              <Text
                ta="center"
                px="md"
                size="sm"
                c="white"
                italic
                style={{
                  opacity: 0.4,
                  maxWidth: rem(400),
                  lineHeight: 1.6,
                }}
              >
                "Don't just chat, feel the frequency. Experience the joy of
                vibing chat with VibeApp — where every chat is a soul-stirring
                vibe!"
              </Text>
            </Stack>

            {/* --- Developed by Credit --- */}
            <Text
              mt={rem(40)}
              size="10px"
              c="white"
              style={{
                opacity: 0.4,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Developed & Maintained by{" "}
              <a
                href="https://www.instagram.com/deep_.088"
                target="_blank"
                rel="noreferrer"
                style={{ color: "cyan", textDecoration: "none" }}
              >
                Deep
              </a>
            </Text>
          </Stack>
        </Center>
      </Container>
    </Box>
  );
}
