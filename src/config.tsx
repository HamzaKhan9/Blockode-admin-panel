import { RouteItem } from "./types/routes";
// import {
//   // DashboardOutlined,
//   UserOutlined,
//   LineChartOutlined,
// } from "@ant-design/icons";

import Login from "./pages/login";
import Profile from "./pages/profile";
import PageNotFound from "./pages/404";
import Users from "./pages/user";
import Dashboard from "./pages/dashboard";
import GameStatistics from "./pages/gameStatistics";
import GameInformation from "./pages/gameStatistics/GamesInformation";
import NoAccess from "./pages/noAccess";

export const routes: RouteItem[] = [
  {
    path: "/",
    layoutType: "dashboard",
    menuItem: true,
    title: "Dashboard",
    // icon: () => <LineChartOutlined />,
    authType: "only-authenticated",
    element: Dashboard,
  },
  {
    path: "/users",
    layoutType: "dashboard",
    menuItem: true,
    title: "Users",
    // icon: () => <LineChartOutlined />,
    authType: "only-authenticated",
    element: Users,
  },
  // {
  //   path: "/goals",
  //   layoutType: "dashboard",
  //   menuItem: true,
  //   title: "Goals",
  //   // icon: () => <UserOutlined />,
  //   authType: "only-authenticated",
  //   element: Goals,
  // },

  {
    path: "/game-statistics",
    layoutType: "dashboard",
    menuItem: true,
    title: "Game Stats",
    // icon: () => <LineChartOutlined />,
    authType: "only-authenticated",
    element: GameStatistics,
  },
  {
    path: "/game-statistics/:uid",
    layoutType: "dashboard",
    menuItem: false,
    authType: "only-authenticated",
    element: GameInformation,
  },
  {
    path: "/no-access",
    element: NoAccess,
  },

  // {
  //   path: "/category",
  //   layoutType: "dashboard",
  //   menuItem: true,
  //   title: "Categories",
  //   icon: () => <ProfileOutlined />,
  //   authType: "only-authenticated",
  //   element: Category,
  // },

  // {
  //   path: "/activity",
  //   layoutType: "dashboard",
  //   menuItem: true,
  //   title: "Activities",
  //   icon: () => <AppstoreOutlined />,
  //   authType: "only-authenticated",
  //   element: Activity,
  // },

  {
    path: "/profile",
    layoutType: "dashboard",
    menuItem: false,
    authType: "only-authenticated",
    element: Profile,
  },

  {
    path: "/login",
    layoutType: "auth",
    authType: "only-unauthenticated",
    element: Login,
  },

  {
    path: "/",
    element: PageNotFound,
  },
];
