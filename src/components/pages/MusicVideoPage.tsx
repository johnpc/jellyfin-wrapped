import { Container } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title, CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

export default function MusicVideoPage() {
  const { musicVideos, isLoading } = useData();
  const { data: musicVideosData } = musicVideos;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!musicVideosData?.length) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Listened to {musicVideosData.length} Music Videos
            </Title>
            <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginTop: "0.5rem" }}>
              Your music video viewing collection
            </p>
          </div>

          <CenteredGrid>
            {musicVideosData.slice(0, 20).map((musicVideo: { id?: string }) => (
              <MovieCard key={musicVideo.id} item={musicVideo} />
            ))}
          </CenteredGrid>
        </div>
      </Container>
    </PageContainer>
  );
}
