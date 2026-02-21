import { useState, useEffect, useRef } from 'react';
import { Box, Stack, ScrollArea, TextInput, ActionIcon, Group, Avatar, Text, Paper, Flex, Loader, Center } from '@mantine/core';
import { IconSend, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import io from 'socket.io-client';
import api from '../services/axios';
import { useSelector } from 'react-redux';

const SOCKET_ENDPOINT = "http://localhost:5000";
let socket;

export default function ChatWindow() {
const { chatId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const viewport = useRef(null);
  const lastTypingTimeRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partner, setPartner] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const user = useSelector((state) => state.auth.user);

  /* ================= SOCKET INIT ================= */
  useEffect(() => {
    socket = io(SOCKET_ENDPOINT);
    socket.emit("setup", user);

    socket.on("connected", () => setSocketConnected(true));

    return () => {
      socket.disconnect();
    };
  }, []);

  /* ================= JOIN CHAT ================= */
  useEffect(() => {
    if (!socket || !chatId) return;
    socket.emit("join chat", chatId);
  }, [chatId]);

  /* ================= STATUS + TYPING LISTENERS ================= */
  useEffect(() => {
    if (!socket) return;

    const statusHandler = (data) => {
      if (partner && partner._id === data.userId) {
        setPartner((prev) => ({
          ...prev,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen
        }));
      }
    };

    const typingHandler = (room) => {
      if (room === chatId) setIsTyping(true);
    };

    const stopTypingHandler = (room) => {
      if (room === chatId) setIsTyping(false);
    };

    socket.on("user status", statusHandler);
    socket.on("typing", typingHandler);
    socket.on("stop typing", stopTypingHandler);

    return () => {
      socket.off("user status", statusHandler);
      socket.off("typing", typingHandler);
      socket.off("stop typing", stopTypingHandler);
    };
  }, [chatId, partner]);

  /* ================= MESSAGE LISTENER ================= */
  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMsg) => {
      if (chatId === newMsg.chatId._id) {
        setMessages((prev) => [...prev, newMsg]);
        api.patch(`/message/read/${chatId}`);
        scrollToBottom();
      }
    };

    socket.on("message received", messageHandler);
    return () => socket.off("message received", messageHandler);
  }, [chatId]);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: msgs } = await api.get(`/message/${chatId}?page=1&limit=50`);
      setMessages(msgs);

      const { data: chatData } = await api.get(`/chat/${chatId}`);
      const otherUser = chatData.participants.find(p => p._id !== user._id);
      setPartner(otherUser);

      await api.patch(`/message/read/${chatId}`);

      setLoading(false);
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatId) fetchData();
  }, [chatId]);

  /* ================= TYPING ================= */
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", chatId);
    }

    lastTypingTimeRef.current = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTimeRef.current;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", chatId);
        setTyping(false);
      }
    }, timerLength);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    socket.emit("stop typing", chatId);
    setTyping(false);

    try {
      const { data } = await api.post('/message', { content: newMessage, chatId });
      setNewMessage("");
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    } catch (error) {}
  };

  /* ================= SCROLL ================= */
  const scrollToBottom = () => {
    if (viewport.current) {
      setTimeout(() => {
        viewport.current.scrollTo({
          top: viewport.current.scrollHeight,
          behavior: "smooth"
        });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Flex direction="column" h="100vh" bg="#0b0b0d" style={{ position: 'relative' }}>
      
      {/* HEADER: Dynamic Status & Back Button */}
      <Paper p="xs" radius={0} bg="#1a1b1e" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", zIndex: 10 }}>
        <Group justify="space-between">
          <Group gap="sm">
            {isMobile && (
              <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/chat')}>
                <IconArrowLeft size={20} />
              </ActionIcon>
            )}
            <Avatar src={partner?.avatar} radius="xl" color="indigo">
              {partner?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Text size="sm" fw={600} c="white">{partner?.username || "Vibe User"}</Text>
              {isTyping ? (
                <Box className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </Box>
              ) : partner?.isOnline ? (
                <Group gap={4}>
                  <Box w={6} h={6} bg="green" style={{ borderRadius: '50%' }} />
                  <Text size="xs" c="green">Online</Text>
                </Group>
              ) : (
                <Text size="xs" c="dimmed">
                  Last seen {partner?.lastSeen ? new Date(partner.lastSeen).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "offline"}
                </Text>
              )}
            </Box>
          </Group>
          <Text 
            size="20px" 
            weight={900} 
            variant="gradient" 
            gradient={{ from: 'cyan', to: 'indigo' }}
            style={{ letterSpacing: '-1px' }}
          >
            VibeApp
          </Text>
        </Group>
      </Paper>

      {/* CHAT AREA: Modern Bubbles with Double Ticks */}
      <ScrollArea flex={1} p="lg" viewportRef={viewport} style={{ background: "linear-gradient(180deg, #13131b 0%, #141517 100%)" }}>
        {loading && <Center><Loader size="xs" color="indigo" /></Center>}
        <Stack gap="xs">
          {messages.map((m) => (
            <Box key={m._id} style={{ alignSelf: m.sender._id === user._id ? 'flex-end' : 'flex-start' }}>
              <Paper 
                p="xs" 
                radius="lg" 
                bg={m.sender._id === user._id ? "#5F3DC4" : "#25262B"} 
                style={{ 
                  color: "white", 
                  maxWidth: '280px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  borderBottomRightRadius: m.sender._id === user._id ? '4px' : '16px',
                  borderBottomLeftRadius: m.sender._id !== user._id ? '4px' : '16px',
                }}
              >
                <Text size="sm" style={{ wordBreak: 'break-word' }}>{m.text}</Text>
                <Group justify="flex-end" gap={4} mt={2}>
                  <Text size="10px" opacity={0.5}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {m.sender._id === user._id && (
                    <IconCheck size={14} color={m.isRead ? "#00ff00" : "gray"} stroke={3} />
                  )}
                </Group>
              </Paper>
            </Box>
          ))}
        </Stack>
      </ScrollArea>

      {/* INPUT: Custom Styling */}
      <Box p="md" bg="#141517">
        <Group gap="xs">
          <TextInput
            placeholder="Type your vibe..."
            radius="xl"
            flex={1}
            styles={{ 
              input: { 
                backgroundColor: "#25262B", 
                border: 'none', 
                color: 'white',
                '&:focus': { border: '1px solid #5F3DC4' }
              } 
            }}
            value={newMessage}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <ActionIcon 
            color="indigo" 
            size="xl" 
            radius="xl" 
            variant="filled" 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            <IconSend size={20} />
          </ActionIcon>
        </Group>
      </Box>
    </Flex>
  );
}