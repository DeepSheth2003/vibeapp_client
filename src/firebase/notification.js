import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BEqSG6L57uBwlIY4rkd4zPr_dXnLwj_rQ7Efk8d5sKfImSFdD2seHnx2cP9t_j5bxqE2Zcn6hp5u6c3P5B3UhQs",
    });

    return token;
  } catch (error) {
    console.error("FCM Error:", error);
    return null;
  }
};

export const listenForegroundMessages = (callback) => {
  onMessage(messaging, (payload) => {
    callback(payload);
  });
};