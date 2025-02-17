export interface RouteItem {
  path: string;
  title?: string;
  layoutType?: "dashboard" | "auth";
  menuItem?: boolean;
  icon?: any;
  authType?: "only-authenticated" | "only-unauthenticated";
  // element?: React.LazyExoticComponent<React.FC>;
  element?: React.FC<any>;
  subRoutes?: RouteItem[];
}

export interface RouteConfig {
  path?: string;
  component?: React.ComponentType<any>;
  layoutType?: "auth" | "dashboard";
  authType?: "only-authenticated" | "only-unauthenticated";
  allowedRoles?: string[];
  subRoutes?: RouteConfig[];
  [key: string]: any;
}

export interface AuthWrapperProps {
  type?: "only-authenticated" | "only-unauthenticated" | "none";
  children: React.ReactNode;
}
export interface RouteComponentProps {
  key: string;
  authType?: "only-authenticated" | "only-unauthenticated" | "none";
  layoutType?: "empty" | "auth" | "dashboard" | "none";
  allowedRoles?: string[] | null;
  children: React.ReactNode;
  path?: string;
}

export interface LayoutWrapperProps {
  type?: "empty" | "auth" | "dashboard" | "none";
  children: React.ReactNode;
}
