import "@radix-ui/themes/styles.css";
import { ErrorBoundary } from "react-error-boundary";
import { Theme } from "@radix-ui/themes";
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  useOutlet,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import React, { useMemo, useEffect, useRef, useState } from "react";
import { getAvailablePages, ALL_PAGES } from "./lib/navigation";
import SplashPage from "./components/pages/SplashPage";
import ServerConfigurationPage from "./components/pages/ServerConfigurationPage";
import MoviesReviewPage from "./components/pages/MoviesReviewPage";
import ShowReviewPage from "./components/pages/ShowReviewPage";
import LiveTvReviewPage from "./components/pages/LiveTvReviewPage";
import AudioReviewPage from "./components/pages/AudioReviewPage";
import FavoriteActorsPage from "./components/pages/FavoriteActorsPage";
import OldestShowPage from "./components/pages/OldestShowPage";
import OldestMoviePage from "./components/pages/OldestMoviePage";
import MusicVideoPage from "./components/pages/MusicVideoPage";
import GenreReviewPage from "./components/pages/GenreReviewPage";
import HolidayReviewPage from "./components/pages/HolidayReviewPage";
import DeviceStatsPage from "./components/pages/DeviceStatsPage";
import ShowOfTheMonthPage from "./components/pages/ShowOfTheMonthPage";
import UnfinishedShowsPage from "./components/pages/UnfinishedShowsPage";
import CriticallyAcclaimedPage from "./components/pages/CriticallyAcclaimedPage";
import TopTenPage from "./components/pages/TopTenPage";
import ActivityCalendarPage from "./components/pages/ActivityCalendarPage";
import TotalTimePage from "./components/pages/TotalTimePage";
import StreaksPage from "./components/pages/StreaksPage";
import PersonalityPage from "./components/pages/PersonalityPage";
import DecadeBreakdownPage from "./components/pages/DecadeBreakdownPage";
import WatchEvolutionPage from "./components/pages/WatchEvolutionPage";
import SharePage from "./components/pages/SharePage";
import Navigation from "./components/Navigation";
import { NavigationButtons } from "./components/NavigationButtons";
import { LoadingPage } from "./components/pages/LoadingPage";
import { DataProvider } from "./contexts/DataContext";
import { isAuthenticated, verifySession } from "./lib/backend-api";
import { LoadingSpinner } from "./components/LoadingSpinner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

// Layout component that wraps all routes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}

// Store previous path globally to track navigation direction
let previousPath = "";

// Get navigation direction: 1 = forward (scrolling down), -1 = backward (scrolling up)
function getNavigationDirection(currentPath: string): number {
  const pages = getAvailablePages();
  const prevIndex = pages.indexOf(previousPath);
  const currentIndex = pages.indexOf(currentPath);

  // Update previous path for next navigation
  previousPath = currentPath;

  if (prevIndex === -1 || currentIndex === -1) {
    return 1; // Default to forward
  }

  return currentIndex > prevIndex ? 1 : -1;
}

// Direction-aware page transition variants - smooth scroll effect
// Forward (Next): new page slides up from bottom, old page slides up and out
// Backward (Previous): new page slides down from top, old page slides down and out
const pageVariants = {
  initial: (direction: number) => ({
    y: direction > 0 ? "100%" : "-100%",
    zIndex: 1,
  }),
  animate: {
    y: 0,
    zIndex: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: (direction: number) => ({
    y: direction > 0 ? "-100%" : "100%",
    zIndex: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const PageWrapper = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ width: "100%", minHeight: "100vh", background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)", ...style }} {...props}>{children}</div>
);

const TransitionContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", background: "#030304", ...style }} {...props}>{children}</div>
);

const ScrollablePageWrapper = ({ children, style, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div style={{ position: "absolute", top: 0, left: 0, right: 0, width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)", willChange: "transform", transform: "translateZ(0)", WebkitTransform: "translateZ(0)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", ...style }} {...props}>{children}</motion.div>
);

// Component that freezes its children on first render
function FrozenRoute({ outlet }: { outlet: React.ReactNode }) {
  const frozen = useRef(outlet);
  return <>{frozen.current}</>;
}

// AnimatedOutlet component to handle page transitions with direction tracking
function AnimatedOutlet() {
  const location = useLocation();
  const outlet = useOutlet();

  // Calculate direction synchronously before render
  const direction = useMemo(() => {
    return getNavigationDirection(location.pathname);
  }, [location.pathname]);

  return (
    <TransitionContainer>
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <ScrollablePageWrapper
          data-scroll-container="true"
          key={location.pathname}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <PageWrapper>
            <FrozenRoute outlet={outlet} />
          </PageWrapper>
        </ScrollablePageWrapper>
      </AnimatePresence>
    </TransitionContainer>
  );
}

// Error fallback component
const ErrorFallback = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)", color: "#f8fafc", fontFamily: "'Sora', sans-serif", textAlign: "center", padding: "2rem", ...style }} {...props}>{children}</div>
);

function ErrorFallbackComponent({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary: () => void }) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return (
    <ErrorFallback>
      <h1>Something went wrong</h1>
      <p>{message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </ErrorFallback>
  );
}

function RootLayout() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <Theme>
          <Navigation />
          <AnimatedOutlet />
          <NavigationButtons />
        </Theme>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Check if user has valid JWT token
function hasValidCredentials(): boolean {
  return isAuthenticated();
}

// AuthGuard: Ensures the user is authenticated before rendering children
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [shouldRedirectToLoading, setShouldRedirectToLoading] = useState(false);
  const location = useLocation();
  const hasCheckedRedirect = useRef(false);

  useEffect(() => {
    const authenticate = async () => {
      // Check if JWT token exists
      if (!hasValidCredentials()) {
        setAuthState("unauthenticated");
        return;
      }

      try {
        // Verify session with backend
        const isValid = await verifySession();
        setAuthState(isValid ? "authenticated" : "unauthenticated");

        // On refresh/initial load, redirect to loading page to show the recap loading screen
        // Only check once on mount, and only if we're not already on /loading
        // Use window.location.pathname to get the actual browser URL (more reliable on refresh)
        const currentPath = window.location.pathname;
        if (isValid && !hasCheckedRedirect.current && currentPath !== "/loading") {
          hasCheckedRedirect.current = true;

          // Check if this is a page load/refresh (not a client-side navigation)
          const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
          const isPageLoad = navEntries.length > 0 &&
            (navEntries[0].type === "reload" || navEntries[0].type === "navigate");

          // On page load, clear the completed loading flag so we can redirect again
          // This allows refreshes to show the loading screen
          if (isPageLoad) {
            sessionStorage.removeItem("hasCompletedLoading");
          }

          // Check if we've already completed a loading cycle in this navigation session
          // This prevents redirect loops when navigating from /loading to content pages
          const hasCompletedLoading = sessionStorage.getItem("hasCompletedLoading") === "true";

          // Only redirect if:
          // 1. This is a page load (refresh or initial navigation)
          // 2. We haven't already redirected in this session
          // 3. We haven't completed a loading cycle in this navigation session
          if (isPageLoad && !sessionStorage.getItem("hasRedirectedToLoading") && !hasCompletedLoading) {
            sessionStorage.setItem("hasRedirectedToLoading", "true");

            // Determine redirect URL:
            // - If on a content page, redirect back to that page
            // - Otherwise, use first available page or default to /total-time
            let redirectUrl: string = "/total-time";
            const contentPages = ALL_PAGES.map(p => p.path) as string[];

            if (contentPages.includes(currentPath)) {
              // Coming from a specific content page, redirect back to it
              redirectUrl = currentPath;
            } else {
              // Coming from login or other page, use first available page
              const availablePages = getAvailablePages();
              if (availablePages.length > 0) {
                redirectUrl = availablePages[0];
              }
            }

            // Store redirect URL and trigger navigation
            sessionStorage.setItem("loadingRedirectUrl", redirectUrl);
            setShouldRedirectToLoading(true);
            return;
          }
        }
      } catch (error) {
        console.error("Authentication failed:", error);
        setAuthState("unauthenticated");
      }
    };

    void authenticate();
  }, []); // Only run on mount, not on location changes

  // Clear redirect flag when on loading page, and mark loading as complete when we leave it
  useEffect(() => {
    if (location.pathname === "/loading") {
      sessionStorage.removeItem("hasRedirectedToLoading");
      sessionStorage.removeItem("loadingRedirectUrl");
      setShouldRedirectToLoading(false);
    } else {
      // When we navigate away from /loading, mark that we've completed the loading cycle
      // This prevents redirect loops when navigating to content pages
      const wasOnLoading = sessionStorage.getItem("wasOnLoading") === "true";
      if (wasOnLoading) {
        sessionStorage.setItem("hasCompletedLoading", "true");
        sessionStorage.removeItem("wasOnLoading");
      }
    }
  }, [location.pathname]);

  // Track when we're on the loading page
  useEffect(() => {
    if (location.pathname === "/loading") {
      sessionStorage.setItem("wasOnLoading", "true");
    }
  }, [location.pathname]);

  if (authState === "loading") {
    return <LoadingSpinner />;
  }

  if (authState === "unauthenticated") {
    return <Navigate to="/configure" replace />;
  }

  // Redirect to loading page using React Router (client-side navigation)
  if (shouldRedirectToLoading && location.pathname !== "/loading") {
    const redirectUrl = sessionStorage.getItem("loadingRedirectUrl") || "/total-time";
    // Ensure we never redirect back to /loading
    const safeRedirectUrl = redirectUrl === "/loading" ? "/total-time" : redirectUrl;
    return <Navigate to={`/loading?redirect=${encodeURIComponent(safeRedirectUrl)}`} replace />;
  }

  return <>{children}</>;
}

// Wrap content pages with DataProvider
function DataWrappedLayout() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallbackComponent}
      onReset={() => {
        // On error reset, redirect to loading page to re-fetch data
        // Use current path as redirect, or default to /total-time
        const currentPath = window.location.pathname;
        const contentPages = ALL_PAGES.map(p => p.path) as string[];
        const redirectUrl: string = contentPages.includes(currentPath) ? currentPath : "/total-time";
        const safeRedirectUrl = redirectUrl === "/loading" ? "/total-time" : redirectUrl;
        window.location.href = `/loading?redirect=${encodeURIComponent(safeRedirectUrl)}`;
      }}
    >
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          <DataProvider>
            <Theme>
              <Navigation />
              <AnimatedOutlet />
              <NavigationButtons />
            </Theme>
          </DataProvider>
        </AuthGuard>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <SplashPage />,
      },
      {
        path: "/configure",
        element: <ServerConfigurationPage />,
      },
    ],
  },
  {
    element: <DataWrappedLayout />,
    children: [
      {
        path: "/loading",
        element: <LoadingPage />,
      },
      {
        path: "/total-time",
        element: <TotalTimePage />,
      },
      {
        path: "/streaks",
        element: <StreaksPage />,
      },
      {
        path: "/personality",
        element: <PersonalityPage />,
      },
      {
        path: "/decades",
        element: <DecadeBreakdownPage />,
      },
      {
        path: "/watch-evolution",
        element: <WatchEvolutionPage />,
      },
      {
        path: "/movies",
        element: <MoviesReviewPage />,
      },
      {
        path: "/oldest-show",
        element: <OldestShowPage />,
      },
      {
        path: "/oldest-movie",
        element: <OldestMoviePage />,
      },
      {
        path: "/shows",
        element: <ShowReviewPage />,
      },
      {
        path: "/tv",
        element: <LiveTvReviewPage />,
      },
      {
        path: "/audio",
        element: <AudioReviewPage />,
      },
      {
        path: "/critically-acclaimed",
        element: <CriticallyAcclaimedPage />,
      },
      {
        path: "/actors",
        element: <FavoriteActorsPage />,
      },
      {
        path: "/music-videos",
        element: <MusicVideoPage />,
      },
      {
        path: "/genres",
        element: <GenreReviewPage />,
      },
      {
        path: "/holidays",
        element: <HolidayReviewPage />,
      },
      {
        path: "/show-of-the-month",
        element: <ShowOfTheMonthPage />,
      },
      {
        path: "/unfinished-shows",
        element: <UnfinishedShowsPage />,
      },
      {
        path: "/device-stats",
        element: <DeviceStatsPage />,
      },
      {
        path: "/punch-card",
        element: <ActivityCalendarPage />,
      },
      {
        path: "/TopTen",
        element: <TopTenPage />,
      },
      {
        path: "/share",
        element: <SharePage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
