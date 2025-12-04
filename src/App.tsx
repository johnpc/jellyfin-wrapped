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
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useEffect, useRef, useState } from "react";
import { getAvailablePages } from "./lib/navigation";
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
import Navigation from "./components/Navigation";
import { NavigationButtons } from "./components/NavigationButtons";
import { LoadingPage } from "./components/pages/LoadingPage";
import { DataProvider } from "./contexts/DataContext";
import { styled } from "@stitches/react";
import {
  getCacheValue,
  JELLYFIN_SERVER_URL_CACHE_KEY,
  JELLYFIN_AUTH_TOKEN_CACHE_KEY,
  JELLYFIN_USERNAME_CACHE_KEY,
} from "./lib/cache";
import { getEnvVar, getAuthenticatedJellyfinApi } from "./lib/jellyfin-api";
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
      duration: 0.5,
      ease: [0.32, 0.72, 0, 1],
    },
  },
  exit: (direction: number) => ({
    y: direction > 0 ? "-100%" : "100%",
    zIndex: 0,
    transition: {
      duration: 0.5,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};

const PageWrapper = styled("div", {
  width: "100%",
  minHeight: "100vh",
  background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)",
});

const TransitionContainer = styled("div", {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: "hidden",
  background: "#030304",
});

const ScrollablePageWrapper = styled(motion.div, {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  width: "100%",
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)",
  // Custom scrollbar
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0, 0, 0, 0.2)",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(0, 240, 255, 0.3)",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "rgba(0, 240, 255, 0.5)",
  },
});

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
const ErrorFallback = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)",
  color: "#f8fafc",
  fontFamily: "'Sora', sans-serif",
  textAlign: "center",
  padding: "2rem",
  
  "& h1": {
    fontSize: "2rem",
    marginBottom: "1rem",
    color: "#f43f5e",
  },
  
  "& p": {
    color: "#94a3b8",
    marginBottom: "2rem",
  },
  
  "& button": {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 100%)",
    border: "none",
    borderRadius: "12px",
    color: "#030304",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s ease",
    
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
});

function ErrorFallbackComponent({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <ErrorFallback>
      <h1>Something went wrong</h1>
      <p>{error.message || "An unexpected error occurred"}</p>
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

// Check if Jellyfin credentials are configured
function hasValidCredentials(): boolean {
  // Check for environment variables first
  const envServerUrl = getEnvVar("JELLYFIN_SERVER_URL");
  if (envServerUrl) {
    return true;
  }
  
  // Check for cached credentials
  const serverUrl = getCacheValue(JELLYFIN_SERVER_URL_CACHE_KEY);
  const authToken = getCacheValue(JELLYFIN_AUTH_TOKEN_CACHE_KEY);
  const username = getCacheValue(JELLYFIN_USERNAME_CACHE_KEY);
  
  // Need server URL and either auth token or username
  return !!(serverUrl && (authToken || username));
}

// AuthGuard: Ensures the user is authenticated before rendering children
function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    const authenticate = async () => {
      // First check if credentials exist
      if (!hasValidCredentials()) {
        setAuthState("unauthenticated");
        return;
      }

      try {
        // Try to authenticate with stored credentials
        await getAuthenticatedJellyfinApi();
        setAuthState("authenticated");
      } catch (error) {
        console.error("Authentication failed:", error);
        setAuthState("unauthenticated");
      }
    };

    void authenticate();
  }, []);

  if (authState === "loading") {
    return <LoadingSpinner />;
  }

  if (authState === "unauthenticated") {
    return <Navigate to="/configure" replace />;
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
        window.location.href = "/loading";
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
      {
        path: "/loading",
        element: <LoadingPage />,
      },
    ],
  },
  {
    element: <DataWrappedLayout />,
    children: [
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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

