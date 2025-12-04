import React, { useState, useEffect } from "react";
import { styled } from "@stitches/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Calendar, Check } from "lucide-react";
import {
  generateTimeframeOptions,
  TimeframeOption,
  getCurrentTimeframe,
  setCurrentTimeframe,
  formatTimeframeDescription,
} from "../lib/timeframe";

interface TimeframeSelectorProps {
  onTimeframeChange?: (timeframe: TimeframeOption) => void;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  onTimeframeChange,
}) => {
  const [timeframes] = useState<TimeframeOption[]>(generateTimeframeOptions());
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>(
    getCurrentTimeframe()
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeframeSelect = (timeframe: TimeframeOption) => {
    setSelectedTimeframe(timeframe);
    setCurrentTimeframe(timeframe);
    setIsOpen(false);

    if (onTimeframeChange) {
      onTimeframeChange(timeframe);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".timeframe-selector")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <SelectorContainer className="timeframe-selector">
      <CurrentSelection onClick={() => setIsOpen(!isOpen)} isOpen={isOpen}>
        <SelectionContent>
          <IconWrapper>
            <Calendar size={16} />
          </IconWrapper>
          <TextContent>
            <SelectionLabel>Timeframe</SelectionLabel>
            <SelectionValue>{selectedTimeframe.name}</SelectionValue>
          </TextContent>
        </SelectionContent>
        <DropdownIcon
          as={motion.div}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} />
        </DropdownIcon>
      </CurrentSelection>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenu
            as={motion.div}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <DropdownAccent />
            {timeframes.map((timeframe, index) => {
              const isSelected = timeframe.id === selectedTimeframe.id;
              return (
                <DropdownItem
                  key={timeframe.id}
                  as={motion.div}
                  isSelected={isSelected}
                  onClick={() => handleTimeframeSelect(timeframe)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <ItemContent>
                    <ItemName>{timeframe.name}</ItemName>
                    <ItemDescription>
                      {formatTimeframeDescription(timeframe)}
                    </ItemDescription>
                  </ItemContent>
                  <CheckIconWrapper>
                    {isSelected && (
                      <CheckIcon
                        as={motion.div}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                      >
                        <Check size={14} />
                      </CheckIcon>
                    )}
                  </CheckIconWrapper>
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        )}
      </AnimatePresence>
    </SelectorContainer>
  );
};

const SelectorContainer = styled("div", {
  position: "relative",
  width: "100%",
  maxWidth: "340px",
  margin: "0 auto 28px",
  zIndex: 100,
});

const CurrentSelection = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  background: "rgba(18, 21, 28, 0.75)",
  backdropFilter: "blur(16px)",
  borderRadius: "16px",
  cursor: "pointer",
  transition: "all 0.25s ease",
  border: "1px solid rgba(255, 255, 255, 0.03)",

  "&:hover": {
    background: "rgba(24, 28, 38, 0.85)",
    borderColor: "rgba(0, 240, 255, 0.15)",
  },

  variants: {
    isOpen: {
      true: {
        borderColor: "rgba(0, 240, 255, 0.3)",
        background: "rgba(24, 28, 38, 0.9)",
        boxShadow: "0 6px 28px rgba(0, 0, 0, 0.35)",
      },
    },
  },
});

const SelectionContent = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "16px",
});

const IconWrapper = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  background: "linear-gradient(135deg, rgba(0, 240, 255, 0.12) 0%, rgba(0, 240, 255, 0.06) 100%)",
  border: "1px solid rgba(0, 240, 255, 0.1)",
  borderRadius: "12px",
  color: "#00f0ff",
});

const TextContent = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
});

const SelectionLabel = styled("span", {
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
});

const SelectionValue = styled("span", {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#f8fafc",
  fontFamily: "'Sora', sans-serif",
  letterSpacing: "-0.01em",
});

const DropdownIcon = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#475569",
});

const DropdownMenu = styled("div", {
  position: "absolute",
  top: "calc(100% + 10px)",
  left: 0,
  right: 0,
  background: "rgba(12, 14, 18, 0.98)",
  backdropFilter: "blur(28px) saturate(180%)",
  borderRadius: "18px",
  boxShadow: "0 16px 64px rgba(0, 0, 0, 0.6)",
  maxHeight: "350px",
  overflowY: "auto",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  padding: "8px",
});

const DropdownAccent = styled("div", {
  position: "absolute",
  top: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "40%",
  height: "2px",
  background: "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.5), transparent)",
  borderRadius: "2px",
});

const DropdownItem = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 16px",
  cursor: "pointer",
  borderRadius: "12px",
  transition: "all 0.15s ease",
  margin: "2px 0",

  "&:hover": {
    background: "rgba(0, 240, 255, 0.06)",
  },

  variants: {
    isSelected: {
      true: {
        background: "rgba(0, 240, 255, 0.1)",

        "&:hover": {
          background: "rgba(0, 240, 255, 0.14)",
        },
      },
    },
  },
});

const ItemContent = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "4px",
  flex: 1,
  minWidth: 0,
});

const ItemName = styled("span", {
  fontSize: "0.95rem",
  fontWeight: 500,
  color: "#f8fafc",
  fontFamily: "'Sora', sans-serif",
  textAlign: "left",
});

const ItemDescription = styled("span", {
  fontSize: "0.75rem",
  color: "#475569",
  fontFamily: "'JetBrains Mono', monospace",
  textAlign: "left",
});

const CheckIconWrapper = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "36px",
  flexShrink: 0,
});

const CheckIcon = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 100%)",
  borderRadius: "9px",
  color: "#030304",
  boxShadow: "0 3px 12px rgba(0, 240, 255, 0.3)",
});

export default TimeframeSelector;
