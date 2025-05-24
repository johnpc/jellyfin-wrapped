import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@stitches/react";
import { motion } from "framer-motion";
import TimeframeSelector from "./TimeframeSelector";
import { TimeframeOption } from "../lib/timeframe";

// Define navigation items with their paths and display names
const navigationItems = [
  { path: "/TopTen", name: "Top 10" },
  { path: "/movies", name: "Movies" },
  { path: "/shows", name: "TV Shows" },
  { path: "/audio", name: "Music" },
  { path: "/music-videos", name: "Music Videos" },
  { path: "/actors", name: "Favorite Actors" },
  { path: "/genres", name: "Genres" },
  { path: "/tv", name: "Live TV" },
  { path: "/critically-acclaimed", name: "Critically Acclaimed" },
  { path: "/oldest-movie", name: "Oldest Movie" },
  { path: "/oldest-show", name: "Oldest Show" },
  { path: "/holidays", name: "Holiday Watching" },
  { path: "/minutes-per-day", name: "Minutes Per Day" },
  { path: "/show-of-the-month", name: "Show of the Month" },
  { path: "/unfinished-shows", name: "Unfinished Shows" },
  { path: "/device-stats", name: "Device Stats" },
  { path: "/punch-card", name: "Activity Calendar" },
];

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show navigation on splash or configuration pages
  if (location.pathname === "/" || location.pathname === "/configure") {
    return null;
  }

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    // Refresh the current page to apply the new timeframe
    console.log({timeframe});
    void navigate(0);
  };

  return (
    <>
      <NavToggle onClick={toggleNav}>{isOpen ? "✕" : "☰"}</NavToggle>

      <SideNav
        as={motion.div}
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ duration: 0.3 }}
      >
        <NavHeader>
          <NavTitle>Jellyfin Wrapped</NavTitle>
          <CloseButton onClick={toggleNav}>✕</CloseButton>
        </NavHeader>

        <TimeframeContainer>
          <TimeframeSelector onTimeframeChange={handleTimeframeChange} />
        </TimeframeContainer>

        <NavList>
          {navigationItems.map((item) => (
            <NavItem
              key={item.path}
              isActive={location.pathname === item.path}
              onClick={() => {
                void navigate(item.path);
                setIsOpen(false);
              }}
            >
              {item.name}
            </NavItem>
          ))}
        </NavList>
      </SideNav>

      {isOpen && <Overlay onClick={toggleNav} />}
    </>
  );
};

const SideNav = styled("nav", {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: "280px",
  backgroundColor: "rgba(45, 0, 247, 0.95)",
  backdropFilter: "blur(10px)",
  boxShadow: "2px 0 10px rgba(0, 0, 0, 0.3)",
  zIndex: 1000,
  overflowY: "auto",
  padding: "20px 0",
  display: "flex",
  flexDirection: "column",
});

const NavHeader = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 20px 20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  marginBottom: "20px",
});

const TimeframeContainer = styled("div", {
  padding: "0 20px 20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  marginBottom: "20px",
});

const NavTitle = styled("h2", {
  color: "#FFD700",
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: "bold",
});

const CloseButton = styled("button", {
  background: "none",
  border: "none",
  color: "white",
  fontSize: "1.5rem",
  cursor: "pointer",
  padding: "5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    color: "#FFD700",
  },
});

const NavList = styled("ul", {
  listStyle: "none",
  padding: 0,
  margin: 0,
  flexGrow: 1,
});

const NavItem = styled("li", {
  padding: "12px 20px",
  color: "white",
  cursor: "pointer",
  transition: "all 0.2s ease",
  borderLeft: "4px solid transparent",

  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderLeftColor: "#FFD700",
  },

  variants: {
    isActive: {
      true: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderLeftColor: "#FFD700",
        fontWeight: "bold",
      },
    },
  },
});

const NavToggle = styled("button", {
  position: "fixed",
  top: "20px",
  left: "20px",
  zIndex: 1001,
  backgroundColor: "rgba(45, 0, 247, 0.8)",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
  cursor: "pointer",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  transition: "all 0.2s ease",

  "&:hover": {
    backgroundColor: "#4D2DFF",
    transform: "scale(1.05)",
  },
});

const Overlay = styled("div", {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 999,
});

export default Navigation;
