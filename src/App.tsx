import "./styles/global/index.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ConfigProvider, theme } from "antd";
import { ThemeProvider } from "react-jss";

import Router from "./Router";

function App() {
  const { token } = theme.useToken();

  return (
    <ConfigProvider theme={{ token }}>
      <ThemeProvider theme={token}>
        <Router />
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
