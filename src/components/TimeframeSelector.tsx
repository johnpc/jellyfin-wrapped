import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
    <div
      className="timeframe-selector"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "340px",
        margin: "0 auto 28px",
        zIndex: 100,
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: isOpen ? "rgba(24, 28, 38, 0.9)" : "rgba(18, 21, 28, 0.75)",
          backdropFilter: "blur(16px)",
          borderRadius: "16px",
          cursor: "pointer",
          transition: "all 0.25s ease",
          border: isOpen
            ? "1px solid rgba(0, 240, 255, 0.3)"
            : "1px solid rgba(255, 255, 255, 0.03)",
          boxShadow: isOpen ? "0 6px 28px rgba(0, 0, 0, 0.35)" : undefined,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, rgba(0, 240, 255, 0.12) 0%, rgba(0, 240, 255, 0.06) 100%)",
              border: "1px solid rgba(0, 240, 255, 0.1)",
              borderRadius: "12px",
              color: "#00f0ff",
            }}
          >
            <Calendar size={16} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Timeframe
            </span>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#f8fafc",
                fontFamily: "'Sora', sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              {selectedTimeframe.name}
            </span>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#475569",
          }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }}
            style={{
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
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "40%",
                height: "2px",
                background: "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.5), transparent)",
                borderRadius: "2px",
              }}
            />
            {timeframes.map((timeframe, index) => {
              const isSelected = timeframe.id === selectedTimeframe.id;
              return (
                <motion.div
                  key={timeframe.id}
                  onClick={() => handleTimeframeSelect(timeframe)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    cursor: "pointer",
                    borderRadius: "12px",
                    transition: "all 0.15s ease",
                    margin: "2px 0",
                    background: isSelected ? "rgba(0, 240, 255, 0.1)" : undefined,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "4px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#f8fafc",
                        fontFamily: "'Sora', sans-serif",
                        textAlign: "left",
                      }}
                    >
                      {timeframe.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#475569",
                        fontFamily: "'JetBrains Mono', monospace",
                        textAlign: "left",
                      }}
                    >
                      {formatTimeframeDescription(timeframe)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      width: "36px",
                      flexShrink: 0,
                    }}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "28px",
                          height: "28px",
                          background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 100%)",
                          borderRadius: "9px",
                          color: "#030304",
                          boxShadow: "0 3px 12px rgba(0, 240, 255, 0.3)",
                        }}
                      >
                        <Check size={14} />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeframeSelector;
