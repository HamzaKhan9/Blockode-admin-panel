import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global/index.scss";
import { Provider } from "react-redux";
import { store } from "./store";
import analytics from "./analytics";
// import { persistor } from "./store";
// import { PersistGate } from "redux-persist/integration/react";

analytics.init();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      <App />
      {/* </PersistGate> */}
    </Provider>
  </React.StrictMode>
);
