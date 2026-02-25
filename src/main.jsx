import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { Provider } from "react-redux";
import { store, persistor } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css"; // Don't forget this line!
import "@mantine/notifications/styles.css";
import "antd/dist/reset.css"; // Add this line at the top

const theme = createTheme({
  /** Put your Vibe theme customizations here */
  primaryColor: "violet",
  fontFamily: "Inter, sans-serif",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <BrowserRouter>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="top-left" zIndex={9999} />
          <App />
        </MantineProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>,
);
