import React, { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  backgroundColor?: string;
}

const PageContainer = ({
  children,
}: PageContainerProps) => {
  return (
    <Container>
      {/* Multi-layer mesh gradient background */}
      <BackgroundMesh />

      {/* Animated gradient orbs */}
      <OrbLayer>
        <Orb
          style={{
            top: "-15%",
            left: "5%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)",
            animation: "orb-float-1 22s ease-in-out infinite",
          }}
        />
        <Orb
          style={{
            top: "35%",
            right: "-10%",
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%)",
            animation: "orb-float-2 28s ease-in-out infinite",
          }}
        />
        <Orb
          style={{
            bottom: "-15%",
            left: "25%",
            width: "550px",
            height: "550px",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.05) 0%, transparent 70%)",
            animation: "orb-float-3 25s ease-in-out infinite",
          }}
        />
        <Orb
          style={{
            top: "60%",
            left: "-5%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)",
            animation: "orb-float-4 20s ease-in-out infinite",
          }}
        />
      </OrbLayer>

      {/* Geometric pattern overlay */}
      <PatternOverlay />

      {/* Subtle grid */}
      <GridPattern />

      <ContentArea>{children}</ContentArea>
    </Container>
  );
};

const Container = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      background: "#060809",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const BackgroundMesh = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
      background: `
        radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.04) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 40%, rgba(168, 85, 247, 0.03) 0%, transparent 45%),
        radial-gradient(ellipse at 15% 70%, rgba(16, 185, 129, 0.03) 0%, transparent 45%),
        radial-gradient(ellipse at 70% 90%, rgba(245, 158, 11, 0.02) 0%, transparent 40%)
      `,
      ...style,
    }}
    {...props}
  />
);

const OrbLayer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
      pointerEvents: "none",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const Orb = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "absolute",
      borderRadius: "50%",
      filter: "blur(100px)",
      ...style,
    }}
    {...props}
  />
);

const PatternOverlay = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='70' viewBox='0 0 60 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='rgba(0,240,255,0.012)' stroke-width='1'/%3E%3C/svg%3E")`,
      backgroundSize: "60px 70px",
      opacity: 0.6,
      ...style,
    }}
    {...props}
  />
);

const GridPattern = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
      backgroundImage: `
        linear-gradient(rgba(0, 240, 255, 0.012) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 240, 255, 0.012) 1px, transparent 1px)
      `,
      backgroundSize: "80px 80px",
      opacity: 0.5,
      ...style,
    }}
    {...props}
  />
);

const ContentArea = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      flex: 1,
      paddingBottom: "8rem",
      position: "relative",
      zIndex: 1,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export default PageContainer;
