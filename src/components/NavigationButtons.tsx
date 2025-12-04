import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@stitches/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getNextPage, getPreviousPage } from "../lib/navigation";

export function NavigationButtons() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const scrollListenerRef = useRef<(() => void) | null>(null);
  
  // Check if user has scrolled to bottom
  const checkScrollPosition = useCallback(() => {
    // Find the active scroll container
    const scrollContainers = document.querySelectorAll('[data-scroll-container="true"]');
    const scrollableContainer = scrollContainers[scrollContainers.length - 1] as HTMLElement;
    
    if (scrollableContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableContainer;
      const maxScroll = scrollHeight - clientHeight;
      
      // Show buttons when:
      // 1. Content fits in viewport (no scroll needed, maxScroll <= 5)
      // 2. User has scrolled close to the bottom (within 100px or 10% of viewport height)
      const threshold = Math.min(100, clientHeight * 0.1);
      const noScrollNeeded = maxScroll <= 5;
      const isAtBottom = scrollTop >= maxScroll - threshold;
      
      setIsVisible(noScrollNeeded || isAtBottom);
    }
  }, []);
  
  // Set up scroll listener for the current container
  const setupScrollListener = useCallback(() => {
    // Remove previous listener if exists
    if (scrollListenerRef.current && containerRef.current) {
      containerRef.current.removeEventListener("scroll", scrollListenerRef.current);
    }
    
    // Find the current scroll container
    const scrollContainers = document.querySelectorAll('[data-scroll-container="true"]');
    const scrollableContainer = scrollContainers[scrollContainers.length - 1] as HTMLElement;
    
    if (scrollableContainer) {
      containerRef.current = scrollableContainer;
      scrollListenerRef.current = checkScrollPosition;
      scrollableContainer.addEventListener("scroll", checkScrollPosition, { passive: true });
      
      // Initial check
      checkScrollPosition();
      return true;
    }
    return false;
  }, [checkScrollPosition]);
  
  // Set up listeners on mount and when path changes
  useEffect(() => {
    // Reset visibility immediately on path change
    setIsVisible(false);
    
    // Give time for the new page to mount
    const timeouts: NodeJS.Timeout[] = [];
    
    // Multiple attempts to catch the container after transition
    [0, 100, 300, 500, 800, 1200].forEach((delay) => {
      const timeout = setTimeout(() => {
        setupScrollListener();
      }, delay);
      timeouts.push(timeout);
    });
    
    // Listen to window resize
    window.addEventListener("resize", checkScrollPosition);
    
    return () => {
      timeouts.forEach(clearTimeout);
      if (scrollListenerRef.current && containerRef.current) {
        containerRef.current.removeEventListener("scroll", scrollListenerRef.current);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [location.pathname, setupScrollListener, checkScrollPosition]);
  
  // Don't show on non-content pages
  const hiddenPaths = ["/", "/configure", "/loading"];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }
  
  // Get dynamic next/previous pages based on current location
  const nextPage = getNextPage(location.pathname);
  const previousPage = getPreviousPage(location.pathname);

  if (!nextPage && !previousPage) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <NavButtonContainer
          as={motion.div}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <ButtonWrapper>
            {previousPage && (
              <NavButton
                as={motion.button}
                variant="secondary"
                whileHover={{ scale: 1.01, x: -4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setIsVisible(false); // Hide immediately on click
                  void navigate(previousPage);
                }}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </NavButton>
            )}
            {nextPage && (
              <NavButton
                as={motion.button}
                variant="primary"
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setIsVisible(false); // Hide immediately on click
                  void navigate(nextPage);
                }}
              >
                <span>Next</span>
                <ChevronRight size={20} />
                <ButtonGlow />
              </NavButton>
            )}
          </ButtonWrapper>
        </NavButtonContainer>
      )}
    </AnimatePresence>
  );
}

const NavButtonContainer = styled("div", {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  padding: "20px 24px 32px",
  background: "linear-gradient(to top, rgba(3, 3, 4, 0.98) 0%, rgba(3, 3, 4, 0.92) 40%, transparent 100%)",
  backdropFilter: "blur(16px)",
});

const ButtonWrapper = styled("div", {
  display: "flex",
  gap: "14px",
  maxWidth: "640px",
  margin: "0 auto",
});

const NavButton = styled("button", {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  padding: "18px 32px",
  border: "none",
  borderRadius: "16px",
  fontSize: "1rem",
  fontWeight: 600,
  fontFamily: "'Sora', sans-serif",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  letterSpacing: "-0.01em",
  position: "relative",
  overflow: "hidden",

  variants: {
    variant: {
      primary: {
        background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 40%, #10b981 100%)",
        backgroundSize: "200% 200%",
        color: "#030304",
        boxShadow: "0 6px 32px rgba(0, 240, 255, 0.25)",

        "&:hover": {
          boxShadow: "0 10px 44px rgba(0, 240, 255, 0.35)",
          backgroundPosition: "100% 100%",
        },
      },
      secondary: {
        background: "rgba(18, 21, 28, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        color: "#e2e8f0",

        "&:hover": {
          background: "rgba(24, 28, 38, 0.95)",
          borderColor: "rgba(0, 240, 255, 0.15)",
        },
      },
    },
  },

  defaultVariants: {
    variant: "primary",
  },
});

const ButtonGlow = styled("div", {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
  pointerEvents: "none",
  borderRadius: "16px",
});
