import posthog from "posthog-js";
import ReactGA from "react-ga4";
import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  useLocation,
  useNavigationType,
  matchRoutes,
  createRoutesFromChildren,
} from "react-router-dom";
import { ENV } from "./supabase.config";
// const ENV = "prod";

const initAnalytics = () => {
  if (ENV === "prod") {
    // Initialize PostHog
    posthog.init(import.meta.env.VITE_APP_POSTHOG_KEY, {
      api_host: "https://app.posthog.com",
    });

    // Initialize Google Analytics
    ReactGA.initialize("G-Z3PHCT9V4W");

    // Initialize Sentry
    Sentry.init({
      dsn: "https://08e7b0ff48a8e7d526579e504e8ae95c@o1387563.ingest.us.sentry.io/4507274438639616",
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect: useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        }),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

const trackEvent = (event: string, properties = {}) => {
  if (ENV === "prod") {
    // Track event with PostHog
    posthog.capture(event, properties);

    // Track event with Google Analytics
    ReactGA.event({
      category: "Event",
      action: event,
      ...properties,
    });

    // Track event with Sentry
    Sentry.captureMessage(event, {
      level: "info",
      tags: properties,
    });
  }
};

const trackPage = (currentPath: string) => {
  if (ENV === "prod") {
    posthog.capture("$pageview", {
      url: currentPath,
    });

    ReactGA.send({ hitType: "pageview", page: currentPath });

    // Track page view with Sentry
    Sentry.addBreadcrumb({
      category: "navigation",
      message: `Navigated to ${currentPath}`,
      level: "info",
    });
  }
};

const identifyUser = (userId: string, properties = {}) => {
  if (ENV === "prod") {
    // Identify user with PostHog
    posthog.identify(userId, properties);

    // Set user ID in Google Analytics
    ReactGA.set({ userId });

    // Set user properties in Google Analytics
    ReactGA.set(properties);

    // Set user context in Sentry
    Sentry.setUser({ id: userId, ...properties });
  }
};

export default {
  init: initAnalytics,
  trackEvent,
  identifyUser,
  trackPage,
};
