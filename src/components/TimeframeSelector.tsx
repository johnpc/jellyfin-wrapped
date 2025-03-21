import React, { useState, useEffect } from "react";
import { styled } from "@stitches/react";
import { motion } from "framer-motion";
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
    getCurrentTimeframe(),
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
    // Close dropdown when clicking outside
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
      <CurrentSelection onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedTimeframe.name}</span>
        <TimeframeDescription>
          {formatTimeframeDescription(selectedTimeframe)}
        </TimeframeDescription>
        <DropdownIcon isOpen={isOpen}>▼</DropdownIcon>
      </CurrentSelection>

      {isOpen && (
        <DropdownMenu
          as={motion.div}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {timeframes.map((timeframe) => (
            <DropdownItem
              key={timeframe.id}
              isSelected={timeframe.id === selectedTimeframe.id}
              onClick={() => handleTimeframeSelect(timeframe)}
            >
              <span>{timeframe.name}</span>
              <TimeframeDescription>
                {formatTimeframeDescription(timeframe)}
              </TimeframeDescription>
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </SelectorContainer>
  );
};

const SelectorContainer = styled("div", {
  position: "relative",
  width: "100%",
  maxWidth: "300px",
  margin: "0 auto 20px",
  zIndex: 100,
});

const CurrentSelection = styled("div", {
  display: "flex",
  flexDirection: "column",
  padding: "10px 15px",
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  position: "relative",

  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  span: {
    fontWeight: "bold",
    color: "white",
  },
});

const TimeframeDescription = styled("small", {
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "0.8rem",
  marginTop: "2px",
});

const DropdownIcon = styled("div", {
  position: "absolute",
  right: "15px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "white",
  fontSize: "0.8rem",
  transition: "transform 0.2s ease",

  variants: {
    isOpen: {
      true: {
        transform: "translateY(-50%) rotate(180deg)",
      },
    },
  },
});

const DropdownMenu = styled("div", {
  position: "absolute",
  top: "calc(100% + 5px)",
  left: 0,
  right: 0,
  backgroundColor: "rgba(45, 0, 247, 0.95)",
  backdropFilter: "blur(10px)",
  borderRadius: "8px",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  maxHeight: "300px",
  overflowY: "auto",
  border: "1px solid rgba(255, 255, 255, 0.1)",
});

const DropdownItem = styled("div", {
  padding: "10px 15px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  flexDirection: "column",

  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },

  span: {
    color: "white",
  },

  variants: {
    isSelected: {
      true: {
        backgroundColor: "rgba(255, 215, 0, 0.2)",

        "&:hover": {
          backgroundColor: "rgba(255, 215, 0, 0.3)",
        },

        span: {
          fontWeight: "bold",
        },
      },
    },
  },
});

export default TimeframeSelector;
