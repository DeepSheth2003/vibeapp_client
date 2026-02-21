import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export const vibeNotify = {
  // 1. Success Toast with dynamic Title and Message
  success: (title, message) => notifications.show({
    title: title,
    message: message,
    color: 'teal',
    icon: <IconCheck size={18} />,
    radius: 'md',
    withBorder: true,
  }),

  // 2. Error Toast with dynamic Title and Message
  error: (title, message) => notifications.show({
    title: title,
    message: message,
    color: 'red',
    icon: <IconX size={18} />,
    radius: 'md',
    withBorder: true,
  }),

  // 3. Loading Toast (returns an ID)
  loading: (title, message) => notifications.show({
    id: 'vibe-action-load',
    loading: true,
    title: title,
    message: message,
    autoClose: false,
    withCloseButton: false,
    radius: 'md',
  }),

  // 4. Update the loader to a final state with dynamic title/message
  stopLoading: (status, title, message) => notifications.update({
    id: 'vibe-action-load',
    color: status === 'success' ? 'teal' : 'red',
    title: title,
    message: message,
    icon: status === 'success' ? <IconCheck size={18} /> : <IconX size={18} />,
    loading: false,
    autoClose: 3000,
  }),
};