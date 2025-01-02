import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import SplashPage from "./components/pages/SplashPage";
import ServerConfigurationPage from "./components/pages/ServerConfigurationPage";
import MoviesReviewPage from "./components/pages/MoviesReviewPage";
import ShowReviewPage from "./components/pages/ShowReviewPage";
import LiveTvReviewPage from "./components/pages/LiveTvReviewPage";
import AudioReviewPage from "./components/pages/AudioReviewPage";

// Layout component that wraps all routes
function RootLayout() {
  return (
    <Theme>
      <Outlet />
    </Theme>
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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
