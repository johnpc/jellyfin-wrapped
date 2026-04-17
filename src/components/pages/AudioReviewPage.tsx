import { Container } from "@radix-ui/themes";
import { motion } from "motion/react";
import { useData } from "@/contexts/DataContext";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

const MAX_DISPLAY_ITEMS = 20;

export default function AudioReviewPage() {
  const { audio, isLoading } = useData();
  const { data: audios } = audio;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!audios?.length) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <motion.h1 variants={itemVariants} style={{
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
            }}>
              You Listened to {audios.length} Songs
            </motion.h1>
            <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginTop: "0.5rem" }}>
              Your music listening history
            </p>
            {audios.length > MAX_DISPLAY_ITEMS && (
              <p style={{ color: "#64748b" }}>
                Showing top {MAX_DISPLAY_ITEMS} songs
              </p>
            )}
          </div>

          <CenteredGrid>
            {audios
              .slice(0, MAX_DISPLAY_ITEMS)
              .map((audioItem: { id?: string }) => (
                <MovieCard key={audioItem.id} item={audioItem} />
              ))}
          </CenteredGrid>
        </div>
      </Container>
    </PageContainer>
  );
}
