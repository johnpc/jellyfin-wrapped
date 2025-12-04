import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@stitches/react";
import { motion, AnimatePresence } from "framer-motion";
import TimeframeSelector from "./TimeframeSelector";
import { TimeframeOption } from "../lib/timeframe";
import { getAvailablePages } from "../lib/navigation";
import {
  Menu,
  X,
  Trophy,
  Film,
  Tv,
  Music,
  Video,
  Users,
  Layers,
  Radio,
  Star,
  Clock,
  Clapperboard,
  PartyPopper,
  BarChart3,
  Calendar as CalendarIcon,
  MonitorSmartphone,
  Activity,
  CirclePause,
  Zap,
  LucideIcon,
} from "lucide-react";

// Map paths to icons
const pathToIcon: Record<string, LucideIcon> = {
  "/TopTen": Trophy,
  "/movies": Film,
  "/shows": Tv,
  "/audio": Music,
  "/music-videos": Video,
  "/actors": Users,
  "/genres": Layers,
  "/tv": Radio,
  "/critically-acclaimed": Star,
  "/oldest-movie": Clapperboard,
  "/oldest-show": Clock,
  "/holidays": PartyPopper,
  "/minutes-per-day": BarChart3,
  "/show-of-the-month": CalendarIcon,
  "/unfinished-shows": CirclePause,
  "/device-stats": MonitorSmartphone,
  "/punch-card": Activity,
};

// Map paths to display names
const pathToName: Record<string, string> = {
  "/TopTen": "Top 10",
  "/movies": "Movies",
  "/shows": "TV Shows",
  "/audio": "Music",
  "/music-videos": "Music Videos",
  "/actors": "Favorite Actors",
  "/genres": "Genres",
  "/tv": "Live TV",
  "/critically-acclaimed": "Critically Acclaimed",
  "/oldest-movie": "Oldest Movie",
  "/oldest-show": "Oldest Show",
  "/holidays": "Holiday Watching",
  "/minutes-per-day": "Minutes Per Day",
  "/show-of-the-month": "Show of the Month",
  "/unfinished-shows": "Unfinished Shows",
  "/device-stats": "Device Stats",
  "/punch-card": "Activity Calendar",
};

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Get available pages (only pages with content)
  const navigationItems = useMemo(() => {
    const availablePaths = getAvailablePages();
    return availablePaths.map(path => ({
      path,
      name: pathToName[path] || path,
      icon: pathToIcon[path] || Trophy,
    }));
  }, []);

  // Don't show navigation on splash or configuration pages
  if (location.pathname === "/" || location.pathname === "/configure" || location.pathname === "/loading") {
    return null;
  }

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    console.log({ timeframe });
    void navigate(0);
  };

  return (
    <>
      <NavToggle 
        onClick={toggleNav}
        as={motion.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        isOpen={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </NavToggle>

      <AnimatePresence>
        {isOpen && (
          <>
            <Overlay
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={toggleNav}
            />
            <SideNav
              as={motion.nav}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 200 }}
            >
              {/* Top gradient accent */}
              <TopAccent />
              
              <NavHeader>
                <NavTitle>
                  <NavLogo>
                    <Zap size={18} />
                  </NavLogo>
                  <TitleText>
                    <span>Jellyfin</span>
                    <SubText>Wrapped</SubText>
                  </TitleText>
                </NavTitle>
              </NavHeader>

              <TimeframeContainer>
                <TimeframeSelector onTimeframeChange={handleTimeframeChange} />
              </TimeframeContainer>

              <NavList>
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <NavItem
                      as={motion.li}
                      key={item.path}
                      isActive={isActive}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => {
                        void navigate(item.path);
                        setIsOpen(false);
                      }}
                    >
                      <NavItemIcon isActive={isActive}>
                        <Icon size={17} />
                      </NavItemIcon>
                      <NavItemText>{item.name}</NavItemText>
                      {isActive && (
                        <ActiveIndicator
                          as={motion.div}
                          layoutId="activeIndicator"
                          transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        />
                      )}
                    </NavItem>
                  );
                })}
              </NavList>

              <NavFooter>
                <FooterBadge>
                  <span>🔐</span>
                  <FooterText>Data stays local</FooterText>
                </FooterBadge>
              </NavFooter>
            </SideNav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const SideNav = styled("nav", {
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  width: "320px",
  background: "rgba(8, 9, 12, 0.97)",
  backdropFilter: "blur(40px) saturate(180%)",
  WebkitBackdropFilter: "blur(40px) saturate(180%)",
  borderRight: "1px solid rgba(255, 255, 255, 0.04)",
  boxShadow: "4px 0 60px rgba(0, 0, 0, 0.6)",
  zIndex: 1000,
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
});

const TopAccent = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "2px",
  background: "linear-gradient(90deg, #00f0ff 0%, #a855f7 50%, #f59e0b 100%)",
  opacity: 0.8,
});

const NavHeader = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "28px 24px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
});

const NavLogo = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 50%, #10b981 100%)",
  borderRadius: "12px",
  marginRight: "14px",
  color: "#030304",
  boxShadow: "0 4px 20px rgba(0, 240, 255, 0.3)",
});

const TitleText = styled("div", {
  display: "flex",
  flexDirection: "column",
});

const SubText = styled("span", {
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "#00f0ff",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
});

const TimeframeContainer = styled("div", {
  padding: "20px 24px 24px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
});

const NavTitle = styled("h2", {
  display: "flex",
  alignItems: "center",
  color: "#f8fafc",
  margin: 0,
  fontSize: "1.15rem",
  fontWeight: 700,
  fontFamily: "'Sora', sans-serif",
  letterSpacing: "-0.02em",
});

const NavList = styled("ul", {
  listStyle: "none",
  padding: "16px 12px",
  margin: 0,
  flexGrow: 1,
});

const NavItem = styled("li", {
  position: "relative",
  display: "flex",
  alignItems: "center",
  padding: "13px 16px",
  margin: "3px 0",
  color: "#94a3b8",
  cursor: "pointer",
  borderRadius: "14px",
  transition: "all 0.2s ease",
  fontFamily: "'Sora', sans-serif",
  fontSize: "0.9rem",
  fontWeight: 500,

  "&:hover": {
    background: "rgba(0, 240, 255, 0.04)",
    color: "#e2e8f0",
  },

  variants: {
    isActive: {
      true: {
        background: "rgba(0, 240, 255, 0.08)",
        color: "#f8fafc",
      },
    },
  },
});

const NavItemIcon = styled("span", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "38px",
  height: "38px",
  marginRight: "14px",
  borderRadius: "11px",
  background: "rgba(255, 255, 255, 0.02)",
  color: "#475569",
  transition: "all 0.25s ease",
  
  variants: {
    isActive: {
      true: {
        background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 100%)",
        color: "#030304",
        boxShadow: "0 4px 16px rgba(0, 240, 255, 0.3)",
      },
    },
  },
});

const NavItemText = styled("span", {
  flex: 1,
  letterSpacing: "-0.01em",
});

const ActiveIndicator = styled("div", {
  position: "absolute",
  left: 0,
  top: "50%",
  transform: "translateY(-50%)",
  width: "3px",
  height: "28px",
  background: "linear-gradient(180deg, #00f0ff 0%, #22d3ee 100%)",
  borderRadius: "0 4px 4px 0",
  boxShadow: "0 0 16px rgba(0, 240, 255, 0.5)",
});

const NavToggle = styled("button", {
  position: "fixed",
  top: "24px",
  left: "24px",
  zIndex: 1001,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "50px",
  height: "50px",
  background: "rgba(8, 9, 12, 0.95)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "16px",
  color: "#f8fafc",
  cursor: "pointer",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
  transition: "all 0.25s ease",

  "&:hover": {
    background: "rgba(0, 240, 255, 0.08)",
    borderColor: "rgba(0, 240, 255, 0.2)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 240, 255, 0.1)",
  },

  variants: {
    isOpen: {
      true: {
        background: "rgba(0, 240, 255, 0.1)",
        borderColor: "rgba(0, 240, 255, 0.25)",
      },
    },
  },
});

const Overlay = styled("div", {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.75)",
  backdropFilter: "blur(12px)",
  zIndex: 999,
});

const NavFooter = styled("div", {
  padding: "20px 24px",
  borderTop: "1px solid rgba(255, 255, 255, 0.04)",
});

const FooterBadge = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "10px 16px",
  background: "rgba(16, 185, 129, 0.06)",
  border: "1px solid rgba(16, 185, 129, 0.1)",
  borderRadius: "12px",
});

const FooterText = styled("span", {
  fontSize: "0.8rem",
  color: "#10b981",
  fontWeight: 500,
});

export default Navigation;
