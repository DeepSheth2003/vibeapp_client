import { Flex, Box, Text } from "@mantine/core";
import { Outlet, useParams } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import ChatListSidebar from "../components/Chat/Sidebar";

const ChatPage = () => {
  const { chatId } = useParams();
  // Mobile breakpoint (768px)
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Mobile logic: Jab chatId ho to sirf chat dikhe, jab na ho to sirf list dikhe
  const showList = isMobile ? !chatId : true;
  const showChat = isMobile ? !!chatId : true;

  return (
    <Flex
      h="100vh"
      w="100%"
      style={{ overflow: "hidden", backgroundColor: "#1A1B1E" }}
    >
      {/* LEFT: 30% Chat List Sidebar */}
      {showList && (
        <Box
          w={isMobile ? "100%" : 350}
          h="100%"
          style={{
            zIndex: 10,
          }}
        >
          <ChatListSidebar />
        </Box>
      )}

      {/* RIGHT: Chat Window / Outlet */}
      {showChat && (
        <Box style={{ flex: 1 }} h="100%">
          {chatId ? (
            <Outlet />
          ) : (
            // Desktop Welcome Screen
            !isMobile && (
              <Flex
                h="100%"
                align="center"
                justify="center"
                direction="column"
                bg="#131313"
              >
                <div style={{ textAlign: "center", opacity: 1 }}>
                  <Text
                    size="50px"
                    weight={900}
                    variant="gradient"
                    gradient={{ from: "cyan", to: "indigo" }}
                    style={{ letterSpacing: "-1px" }}
                  >
                    VibeApp
                  </Text>
                  <p
                    style={{ color: "white", marginTop: "10px", opacity: 0.5 }}
                  >
                    Select a friend to start a vibing conversation
                  </p>

                  {/* --- Developed by Credit --- */}
                  <Text
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
                      @Deep
                    </a>
                  </Text>
                </div>
              </Flex>
            )
          )}
        </Box>
      )}
    </Flex>
  );
};

export default ChatPage;
