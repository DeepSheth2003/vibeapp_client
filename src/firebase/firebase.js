import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCPAK65qBuetXryTic3N9U9hOguvPGGzNA",
  authDomain: "vibe-7b587.firebaseapp.com",
  projectId: "vibe-7b587",
  storageBucket: "vibe-7b587.firebasestorage.app",
  messagingSenderId: "314769516875",
  appId: "1:314769516875:web:0d46708dabf594941c20ce"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});
