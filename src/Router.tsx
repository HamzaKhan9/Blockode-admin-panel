import {
  Routes,
  Route,
  BrowserRouter,
  useLocation,
  useNavigate,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  detectOS,
  getRoutePath,
  getWorkplaceId,
  getWorkplaceName,
  pickByKeys,
} from "./utils";
import { Session } from "@supabase/supabase-js";
import supabase from "./supabase.config";
import { routes } from "./config";
import { useDispatch } from "react-redux";
import { setComputedRoutes } from "./models/router";
import { getProfile } from "./models/auth";
import {
  RouteItem,
  RouteConfig,
  AuthWrapperProps,
  RouteComponentProps,
  LayoutWrapperProps,
} from "./types/routes";

// const DashboardLayout = React.lazy(() => import("./layouts/DashboardLayout"));
// const AuthLayout = React.lazy(() => import("./layouts/AuthLayout"));
// const EmptyLayout = React.lazy(() => import("./layouts/EmptyLayout"));

import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import EmptyLayout from "./layouts/EmptyLayout";
import { useAppDispatch, useAppSelector } from "./store";
import { Status } from "./utils/statusHandler";
import analytics from "./analytics";

const routeRenderer = (
  routes: RouteItem[],
  prefix = "",
  basePath = "",
  parentConfig: RouteConfig = {}
): [RouteComponentProps[], RouteConfig[]] => {
  const allRoutes: RouteComponentProps[] = [];
  const computedRoutes: RouteConfig[] = [];

  routes.forEach((route, i) => {
    const routePath = getRoutePath(basePath, route?.path || "");
    if (route.subRoutes) {
      const [ar, cr] = routeRenderer(
        route.subRoutes,
        prefix + i + ".",
        routePath,
        route
      );
      allRoutes.push(...ar);
      computedRoutes.push(...cr);
    }

    if (route?.path && route.element) {
      allRoutes.push({
        key: prefix + i,
        layoutType: route.layoutType || parentConfig.layoutType,
        authType: route.authType || parentConfig.authType,
        path: route.path || parentConfig.path,
        children: <route.element />,
      });
      computedRoutes.push({
        ...route,
        key: prefix + i,
        // path: routePath,
        // route: { route.path, path: routePath },
      });
    }
  });

  return [allRoutes, computedRoutes];
};

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ type, children }) => {
  switch (type) {
    case "empty":
      return <EmptyLayout hasMaxWidth={true}>{children}</EmptyLayout>;
    case "auth":
      return <AuthLayout>{children}</AuthLayout>;
    case "dashboard":
      return <DashboardLayout>{children}</DashboardLayout>;
    case "none":
    default:
      return children;
  }
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ type, children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState<Session | null>();
  const profileLoading = useAppSelector(
    (state) => state.profile.getProfileStatus === Status.LOADING
  );

  useEffect(() => {
    analytics.trackPage(window.location.href);
  }, [location]);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      const isGoogle = session.user.identities?.find(
        (i) => i.provider === "google"
      );

      dispatch(getProfile({ id: session?.user.id, isGoogle })).then(
        ({ payload }: any) => {
          // @ts-ignore
          analytics.identifyUser({
            email: payload?.email,
            workplace_id: getWorkplaceId(payload),
            workplace_name: getWorkplaceName(payload),
            operating_system: detectOS(),
          });
          analytics.trackEvent("session_start");
        }
      );
    }
  }, [session?.user.id]);

  const [isRendered, setIsRendered] = useState(false);

  //TO Do Expairy
  useEffect(() => {
    if (session === undefined) {
      setIsRendered(false);
    } else {
      switch (type) {
        case "only-authenticated":
          if (!session?.user.id) {
            navigate("/login", { state: { from: location } });
            setIsRendered(false);
          } else {
            setIsRendered(true);
          }
          break;
        case "only-unauthenticated":
          if (session?.user.id) {
            navigate("/", { state: { from: location } });
            setIsRendered(false); // Return null or a loading indicator
          } else {
            setIsRendered(true);
          }
          break;
        case "none":
        default:
          setIsRendered(true);
      }
    }
  }, [type, session]);

  return isRendered && !profileLoading ? children : null;
};

export default function Router() {
  const dispatch = useDispatch();
  const [ar, cr] = routeRenderer(routes);

  dispatch(setComputedRoutes(cr.map((r) => pickByKeys(r, ["path", "key"])))); // You need to implement pickByKeys

  return (
    <BrowserRouter>
      {/* <RootWrapper> */}
      <Routes>
        {ar.map((props) => (
          <Route
            key={props.key}
            path={props.path}
            element={
              <AuthWrapper type={props.authType}>
                <LayoutWrapper type={props.layoutType}>
                  {props.children}
                </LayoutWrapper>
              </AuthWrapper>
            }
          />
        ))}
      </Routes>
      {/* </RootWrapper> */}
    </BrowserRouter>
  );
}
