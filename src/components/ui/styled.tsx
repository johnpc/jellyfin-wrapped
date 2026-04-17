import React from "react";

export function Container({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        padding: "20px",
        overflow: "hidden",
        background: `
          radial-gradient(ellipse at 20% 0%, rgba(0, 240, 255, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 40%),
          radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 40%),
          radial-gradient(ellipse at 10% 90%, rgba(16, 185, 129, 0.04) 0%, transparent 40%),
          linear-gradient(180deg, #030304 0%, #08090c 20%, #0d0f14 80%, #030304 100%)
        `,
      }}
      {...props}
    >
      <div
        style={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='70' viewBox='0 0 60 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='rgba(0,240,255,0.015)' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 70px",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}

export function ContentWrapper({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        maxWidth: "1000px",
        textAlign: "center",
        padding: "40px 48px 80px 48px",
        position: "relative",
        zIndex: 1,
        width: "100%",
        boxSizing: "border-box",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Title({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={className}
      style={{
        fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
        fontWeight: 800,
        marginBottom: "1.75rem",
        lineHeight: 0.95,
        letterSpacing: "-0.05em",
        background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
        backgroundSize: "250% 250%",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animation: "gradient-flow 8s ease infinite",
        filter: "drop-shadow(0 0 50px rgba(0, 240, 255, 0.25))",
      }}
      {...props}
    >
      {children}
    </h1>
  );
}

export function Subtitle({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={className}
      style={{
        fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
        marginBottom: "3rem",
        lineHeight: 1.7,
        color: "#94a3b8",
        maxWidth: "620px",
        margin: "0 auto 3rem",
        fontWeight: 400,
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function FeaturesList({ children, className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={className}
      style={{
        listStyle: "none",
        padding: 0,
        marginBottom: "3.5rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1rem",
        maxWidth: "800px",
        margin: "0 auto 3.5rem",
      }}
      {...props}
    >
      {children}
    </ul>
  );
}

export function FeatureItem({ children, className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: "1rem",
        padding: "1.125rem 1.5rem",
        color: "#e2e8f0",
        textAlign: "left",
        background: "rgba(18, 21, 28, 0.75)",
        backdropFilter: "blur(16px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.03)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      {...props}
    >
      {children}
    </li>
  );
}

export function StyledButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={className}
      style={{
        position: "relative",
        background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 40%, #10b981 100%)",
        backgroundSize: "200% 200%",
        color: "#030304",
        border: "none",
        padding: "22px 56px",
        borderRadius: "16px",
        fontSize: "1.125rem",
        fontWeight: 700,
        fontFamily: "'Sora', sans-serif",
        cursor: "pointer",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "0 6px 40px rgba(0, 240, 255, 0.35)",
        overflow: "hidden",
        letterSpacing: "-0.01em",
        width: "100%",
        maxWidth: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function Disclaimer({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={className}
      style={{
        fontSize: "0.875rem",
        color: "#475569",
        marginTop: "3.5rem",
        lineHeight: 1.7,
        maxWidth: "500px",
        margin: "3.5rem auto 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(18, 21, 28, 0.75)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        borderRadius: "28px",
        padding: "36px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

type BadgeVariant = "success" | "warning" | "error" | "purple";
const badgeVariantStyles: Record<BadgeVariant, React.CSSProperties> = {
  success: { background: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.2)", color: "#10b981" },
  warning: { background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.2)", color: "#f59e0b" },
  error: { background: "rgba(244, 63, 94, 0.1)", borderColor: "rgba(244, 63, 94, 0.2)", color: "#f43f5e" },
  purple: { background: "rgba(168, 85, 247, 0.1)", borderColor: "rgba(168, 85, 247, 0.2)", color: "#a855f7" },
};

export function Badge({ children, variant, className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 16px",
        background: "rgba(0, 240, 255, 0.08)",
        border: "1px solid rgba(0, 240, 255, 0.15)",
        borderRadius: "999px",
        fontSize: "0.8rem",
        fontWeight: 600,
        color: "#00f0ff",
        letterSpacing: "0.02em",
        ...(variant ? badgeVariantStyles[variant] : {}),
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(145deg, rgba(0, 240, 255, 0.04) 0%, rgba(168, 85, 247, 0.02) 100%)",
        border: "1px solid rgba(0, 240, 255, 0.08)",
        borderRadius: "24px",
        padding: "32px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        marginBottom: "2.5rem",
        textAlign: "center",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

type ContentGridColumns = 2 | 3 | 4;
const gridColumnStyles: Record<ContentGridColumns, React.CSSProperties> = {
  2: { gridTemplateColumns: "repeat(2, 1fr)" },
  3: { gridTemplateColumns: "repeat(3, 1fr)" },
  4: { gridTemplateColumns: "repeat(4, 1fr)" },
};

export function ContentGrid({ children, columns, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { columns?: ContentGridColumns }) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gap: "1.5rem",
        ...(columns ? gridColumnStyles[columns] : {}),
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CenteredGrid({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Divider({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2), transparent)",
        margin: "2.5rem 0",
      }}
      {...props}
    />
  );
}

export function NumberDisplay({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "clamp(2rem, 5vw, 4rem)",
        fontWeight: 700,
        background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "-0.03em",
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export function AccentText({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={className}
      style={{
        color: "#00f0ff",
        fontWeight: 600,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

export function MutedText({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={className}
      style={{
        color: "#475569",
        fontSize: "0.875rem",
      }}
      {...props}
    >
      {children}
    </span>
  );
}

type IconBoxVariant = "gold" | "rose" | "violet" | "mint";
const iconBoxVariantStyles: Record<IconBoxVariant, React.CSSProperties> = {
  gold: { background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" },
  rose: { background: "rgba(244, 63, 94, 0.1)", borderColor: "rgba(244, 63, 94, 0.15)", color: "#f43f5e" },
  violet: { background: "rgba(168, 85, 247, 0.1)", borderColor: "rgba(168, 85, 247, 0.15)", color: "#a855f7" },
  mint: { background: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.15)", color: "#10b981" },
};

export function IconBox({ children, variant, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: IconBoxVariant }) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        background: "rgba(0, 240, 255, 0.08)",
        border: "1px solid rgba(0, 240, 255, 0.1)",
        color: "#00f0ff",
        ...(variant ? iconBoxVariantStyles[variant] : {}),
      }}
      {...props}
    >
      {children}
    </div>
  );
}
