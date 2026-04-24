import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Title } from "./ui/styled";
import PageContainer from "./PageContainer";

interface EmptyStateProps {
  title: string;
  message?: string;
  backgroundColor?: string;
  nextPage?: string;
  previousPage?: string;
}

export default function EmptyState({
  title,
  message = "No activity found for this category. Keep watching and check back later!",
  backgroundColor = "var(--gray-8)",
  nextPage,
  previousPage,
}: EmptyStateProps) {
  return (
    <PageContainer
      backgroundColor={backgroundColor}
      nextPage={nextPage}
      previousPage={previousPage}
    >
      <Container size="4" p="4">
        <Grid gap="4" style={{ textAlign: "center", paddingTop: "20vh" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Title as={motion.h1}>{title}</Title>
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--gray-11)",
                marginTop: "1rem",
              }}
            >
              {message}
            </p>
          </motion.div>
        </Grid>
      </Container>
    </PageContainer>
  );
}
