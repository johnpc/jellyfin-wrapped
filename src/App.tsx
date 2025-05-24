import "@radix-ui/themes/styles.css";
import { ErrorBoundary } from "react-error-boundary";
import { Theme } from "@radix-ui/themes";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import MinutesPlayedPerDayPage from "./components/pages/MinutesPlayedPerDayPage";
import DeviceStatsPage from "./components/pages/DeviceStatsPage";
import ShowOfTheMonthPage from "./components/pages/ShowOfTheMonthPage";
import UnfinishedShowsPage from "./components/pages/UnfinishedShowsPage";
import CriticallyAcclaimedPage from "./components/pages/CriticallyAcclaimedPage";
import TopTenPage from "./components/pages/TopTenPage";
import { useEffect } from "react";
import ActivityCalendarPage from "./components/pages/ActivityCalendarPage";
import Navigation from "./components/Navigation";

// Create a client
const queryClient = new QueryClient();

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

function RootLayout() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ScrollToTop />
      <QueryClientProvider client={queryClient}>
        <Theme>
          <Navigation />
          <Outlet />
        </Theme>
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
        path: "/minutes-per-day",
        element: <MinutesPlayedPerDayPage />,
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
