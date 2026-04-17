import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
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
  TrendingUp,
  LucideIcon,
} from "lucide-react";

// Map paths to icons
const pathToIcon: Record<string, LucideIcon> = {
  "/total-time": Clock,
  "/streaks": Zap,
  "/personality": Users,
  "/TopTen": Trophy,
  "/movies": Film,
  "/shows": Tv,
  "/decades": CalendarIcon,
  "/watch-evolution": TrendingUp,
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
  "/share": PartyPopper,
};

// Map paths to display names
const pathToName: Record<string, string> = {
  "/total-time": "Total Time",
  "/streaks": "Streaks",
  "/personality": "Personality",
  "/TopTen": "Top 10",
  "/movies": "Movies",
  "/shows": "TV Shows",
  "/decades": "Decade Breakdown",
  "/watch-evolution": "Watch Evolution",
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
  "/share": "Share Your Wrapped",
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
      <motion.button
        onClick={toggleNav}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          zIndex: 1003,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "50px",
          height: "50px",
          background: isOpen ? "rgba(0, 240, 255, 0.1)" : "rgba(8, 9, 12, 0.95)",
          backdropFilter: "blur(16px)",
          border: isOpen
            ? "1px solid rgba(0, 240, 255, 0.25)"
            : "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          color: "#f8fafc",
          cursor: "pointer",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
          transition: "all 0.25s ease",
          willChange: "transform",
        }}
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
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={toggleNav}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.75)",
                backdropFilter: "blur(12px)",
                zIndex: 1001,
              }}
            />
            <motion.nav
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
              style={{
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
                zIndex: 1002,
                overflowY: "auto",
                overflowX: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top gradient accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, #00f0ff 0%, #a855f7 50%, #f59e0b 100%)",
                  opacity: 0.8,
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "28px 24px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#f8fafc",
                    margin: 0,
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  <div
                    style={{
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
                    }}
                  >
                    <Zap size={18} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>Jellyfin</span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "#00f0ff",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Wrapped
                    </span>
                  </div>
                </h2>
              </div>

              <div
                style={{
                  padding: "20px 24px 24px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                <TimeframeSelector onTimeframeChange={handleTimeframeChange} />
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: "16px 12px",
                  margin: 0,
                  flexGrow: 1,
                }}
              >
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <motion.li
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => {
                        void navigate(item.path);
                        setIsOpen(false);
                      }}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        padding: "13px 16px",
                        margin: "3px 0",
                        color: isActive ? "#f8fafc" : "#94a3b8",
                        cursor: "pointer",
                        borderRadius: "14px",
                        transition: "all 0.2s ease",
                        fontFamily: "'Sora', sans-serif",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        background: isActive ? "rgba(0, 240, 255, 0.08)" : undefined,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "38px",
                          height: "38px",
                          marginRight: "14px",
                          borderRadius: "11px",
                          background: isActive
                            ? "linear-gradient(135deg, #00f0ff 0%, #22d3ee 100%)"
                            : "rgba(255, 255, 255, 0.02)",
                          color: isActive ? "#030304" : "#475569",
                          transition: "all 0.25s ease",
                          boxShadow: isActive ? "0 4px 16px rgba(0, 240, 255, 0.3)" : undefined,
                        }}
                      >
                        <Icon size={17} />
                      </span>
                      <span style={{ flex: 1, letterSpacing: "-0.01em" }}>{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }}
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "3px",
                            height: "28px",
                            background: "linear-gradient(180deg, #00f0ff 0%, #22d3ee 100%)",
                            borderRadius: "0 4px 4px 0",
                            boxShadow: "0 0 16px rgba(0, 240, 255, 0.5)",
                          }}
                        />
                      )}
                    </motion.li>
                  );
                })}
              </ul>

              <div
                style={{
                  padding: "20px 24px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    background: "rgba(16, 185, 129, 0.06)",
                    border: "1px solid rgba(16, 185, 129, 0.1)",
                    borderRadius: "12px",
                  }}
                >
                  <span>🔐</span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#10b981",
                      fontWeight: 500,
                    }}
                  >
                    Data stays local
                  </span>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
