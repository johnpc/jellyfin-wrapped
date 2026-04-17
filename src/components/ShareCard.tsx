import React, { ReactNode, useRef, useState, useEffect } from "react";
import { Download, Copy, Share2 } from "lucide-react";
import { downloadImage, copyImageToClipboard, shareImage } from "@/lib/share-helpers";

interface ShareCardProps {
  title: string;
  children: ReactNode;
  filename: string;
}

export function ShareCard({ title, children, filename }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generatingButton, setGeneratingButton] = useState<"download" | "copy" | "share" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGeneratingButton("download");
    setError(null);
    try {
      await downloadImage(cardRef.current, filename);
    } catch (error) {
      console.error("Failed to download image:", error);
      setError("Failed to download image. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setGeneratingButton(null);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    setGeneratingButton("copy");
    setError(null);
    try {
      await copyImageToClipboard(cardRef.current);
    } catch (error) {
      console.error("Failed to copy image:", error);
      setError("Failed to copy image. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setGeneratingButton(null);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setGeneratingButton("share");
    setError(null);
    try {
      await shareImage(cardRef.current, title);
    } catch (error) {
      console.error("Failed to share image:", error);
      setError("Failed to share image. Please try again.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setGeneratingButton(null);
    }
  };

  return (
    <CardContainer>
      <CardContent ref={cardRef}>
        {children}
      </CardContent>
      <Actions>
        {!isMobile && (
          <>
            <ActionButton onClick={() => { handleDownload().catch(() => {}); }} disabled={generatingButton !== null}>
              {generatingButton === "download" ? (
                <Spinner />
              ) : (
                <Download size={18} />
              )}
            </ActionButton>
            <ActionButton onClick={() => { handleCopy().catch(() => {}); }} disabled={generatingButton !== null}>
              {generatingButton === "copy" ? (
                <Spinner />
              ) : (
                <Copy size={18} />
              )}
            </ActionButton>
          </>
        )}
        <ActionButton onClick={() => { handleShare().catch(() => {}); }} disabled={generatingButton !== null}>
          {generatingButton === "share" ? (
            <Spinner />
          ) : (
            <Share2 size={18} />
          )}
        </ActionButton>
      </Actions>
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
    </CardContainer>
  );
}

const CardContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%", alignItems: "center", ...style }} {...props}>{children}</div>
);

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a24 50%, #0a0a0f 100%)",
        borderRadius: "24px",
        padding: "2.5rem",
        width: "400px",
        height: "700px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        border: "2px solid rgba(255, 255, 255, 0.1)",
        boxSizing: "border-box",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);
CardContent.displayName = "CardContent";

const Actions = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", gap: "1rem", justifyContent: "center", width: "400px", maxWidth: "400px", boxSizing: "border-box", ...style }} {...props}>{children}</div>
);

const ActionButton = ({ children, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      padding: "0.75rem 1.5rem",
      background: "rgba(0, 240, 255, 0.1)",
      border: "1px solid rgba(0, 240, 255, 0.2)",
      borderRadius: "12px",
      color: "#00f0ff",
      fontSize: "0.9rem",
      fontWeight: 600,
      cursor: "pointer",
      userSelect: "none",
      WebkitTapHighlightColor: "transparent",
      width: "120px",
      height: "42px",
      boxSizing: "border-box",
      ...style,
    }}
    {...props}
  >
    {children}
  </button>
);

const Spinner = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      width: "18px",
      height: "18px",
      border: "2px solid rgba(0, 240, 255, 0.3)",
      borderTop: "2px solid #00f0ff",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      ...style,
    }}
    {...props}
  />
);

const ErrorMessage = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      color: "#ef4444",
      fontSize: "0.85rem",
      textAlign: "center",
      marginTop: "0.5rem",
      padding: "0.5rem",
      background: "rgba(239, 68, 68, 0.1)",
      borderRadius: "8px",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
