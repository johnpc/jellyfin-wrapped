import React, { useState, useMemo, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ContentImage } from "@/components/ContentImage";
import { RankBadge } from "@/components/RankBadge";
import { formatWatchTime } from "@/lib/time-helpers";
import { SimpleItemDto } from "@/lib/queries";
import { MovieWithStats } from "@/lib/queries/movies";
import PageContainer from "@/components/PageContainer";
import { Container, Grid } from "@radix-ui/themes";
import { motion, AnimatePresence } from "motion/react";
import { Film, Tv, Sparkles } from "lucide-react";
import { getCurrentTimeframe } from "@/lib/timeframe";

type QuizState = "movie" | "show" | "complete";

export const TopTen = () => {
  const timeframe = getCurrentTimeframe();
  const { topTen, isLoading } = useData();
  const { data, error } = topTen;
  const [quizState, setQuizState] = useState<QuizState>("movie");
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
  const [selectedShow, setSelectedShow] = useState<string | null>(null);

  // Get top movie and show (before early returns)
  const topMovie = data?.movies?.[0];
  const topShow = data?.shows?.[0];

  // Generate quiz options (before early returns)
  const movieOptions = useMemo(() => {
    if (!topMovie || !data?.movies || data.movies.length < 3) return [];
    const options = [topMovie, ...data.movies.slice(1, 3)];
    return options.sort(() => Math.random() - 0.5);
  }, [data?.movies, topMovie]);

  const showOptions = useMemo(() => {
    if (!topShow || !data?.shows || data.shows.length < 3) return [];
    const options = [topShow.item, ...data.shows.slice(1, 3).map((s) => s.item)];
    return options.sort(() => Math.random() - 0.5);
  }, [data?.shows, topShow]);

  // Auto-advance quiz when there aren't enough options to display
  useEffect(() => {
    if (quizState === "movie" && (!topMovie || movieOptions.length === 0)) {
      if (topShow && showOptions.length > 0) {
        setQuizState("show");
      } else {
        setQuizState("complete");
      }
    } else if (quizState === "show" && (!topShow || showOptions.length === 0)) {
      setQuizState("complete");
    }
  }, [quizState, topMovie, topShow, movieOptions.length, showOptions.length]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading top 5</div>;
  if (!data) return null;

  const handleMovieSelect = (movieId: string) => {
    setSelectedMovie(movieId);
    setTimeout(() => {
      setQuizState("show");
    }, 500);
  };

  const handleShowSelect = (showId: string) => {
    setSelectedShow(showId);
    setTimeout(() => {
      setQuizState("complete");
    }, 500);
  };

  const skipQuiz = () => {
    setQuizState("complete");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="6">
          <AnimatePresence mode="wait">
            {quizState === "movie" && topMovie && movieOptions.length > 0 && (
              <QuizCard
                key="movie-quiz"
                data-quiz-card="true"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
              >
                <QuizTitle>Guess your #1 movie</QuizTitle>
                <QuizOptions>
                  {movieOptions.map((movie) => (
                    <QuizOption
                      key={movie.id}
                      onClick={() => movie.id && handleMovieSelect(movie.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <QuizImageWrapper>
                        <ContentImage item={movie} />
                      </QuizImageWrapper>
                      <QuizOptionName>{movie.name}</QuizOptionName>
                    </QuizOption>
                  ))}
                </QuizOptions>
                <SkipButton onClick={skipQuiz}>Skip Quiz</SkipButton>
              </QuizCard>
            )}

            {quizState === "show" && topShow && showOptions.length > 0 && (
              <QuizCard
                key="show-quiz"
                data-quiz-card="true"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5 }}
              >
                <QuizTitle>Guess your #1 show</QuizTitle>
                <QuizOptions>
                  {showOptions.map((show) => (
                    <QuizOption
                      key={show.id}
                      onClick={() => show.id && handleShowSelect(show.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <QuizImageWrapper>
                        <ContentImage item={show} />
                      </QuizImageWrapper>
                      <QuizOptionName>{show.name}</QuizOptionName>
                    </QuizOption>
                  ))}
                </QuizOptions>
                <SkipButton onClick={skipQuiz}>Skip Quiz</SkipButton>
              </QuizCard>
            )}

            {quizState === "complete" && (
              <motion.div
                key="top-ten"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <HeaderSection
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
                >
                  <HeaderBadge>
                    <BadgeIcon>
                      <Sparkles size={14} />
                    </BadgeIcon>
                    <span>Your Top Picks</span>
                  </HeaderBadge>
                  <PageTitle>Your Top 5 of {timeframe.name}</PageTitle>
                  <PageSubtitle>
                    {data.movies.length > 0 && data.shows.length > 0
                      ? "The movies and shows that kept you watching ❤️"
                      : data.movies.length > 0
                      ? "The films that defined your cinematic period 🎬"
                      : "The shows that kept you coming back for more 📺"}
                  </PageSubtitle>
                </HeaderSection>

                {/* Quiz Results Message */}
                {(selectedMovie !== null || selectedShow !== null) && (
                  <QuizResultsMessage
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {(() => {
                      const movieCorrect = topMovie && selectedMovie === topMovie.id;
                      const showCorrect = topShow && selectedShow === topShow.item.id;
                      const bothCorrect = movieCorrect && showCorrect;
                      const oneCorrect = movieCorrect || showCorrect;
                      const bothAnswered = selectedMovie !== null && selectedShow !== null;

                      if (bothCorrect && bothAnswered) {
                        return "🎉 Perfect! You guessed both correctly!";
                      } else if (oneCorrect && bothAnswered) {
                        return movieCorrect
                          ? "Nice! You got your #1 movie right! 🎬"
                          : "Nice! You got your #1 show right! 📺";
                      } else if (bothAnswered) {
                        return "Not quite, but here are your actual top watches!";
                      } else if (selectedMovie !== null) {
                        return movieCorrect
                          ? "🎉 Correct! That's your #1 movie!"
                          : "Not quite, but here's your actual #1 movie!";
                      } else if (selectedShow !== null) {
                        return showCorrect
                          ? "🎉 Correct! That's your #1 show!"
                          : "Not quite, but here's your actual #1 show!";
                      }
                      return null;
                    })()}
                  </QuizResultsMessage>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {quizState === "complete" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", justifyContent: "center" }}>
            {data.movies.length > 0 && (
            <SectionCard
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ flex: "1 1 400px", maxWidth: "560px" }}
            >
              <CardAccent variant="movies" />
              <SectionHeader>
                <SectionIcon movie>
                  <Film size={20} />
                </SectionIcon>
                <SectionTitleWrapper>
                  <SectionTitle>Top Movies</SectionTitle>
                  <SectionSubtitle>Most watched films</SectionSubtitle>
                </SectionTitleWrapper>
              </SectionHeader>
              <ItemList>
                {data.movies.map((movie: MovieWithStats, index: number) => {
                  const isTopMovie = index === 0 && topMovie && movie.id === topMovie.id;
                  const wasGuessed = selectedMovie === movie.id;
                  const wasWrongGuess = wasGuessed && !isTopMovie;
                  return (
                    <RankItem
                      key={movie.id}
                      variants={itemVariants}
                      highlighted={isTopMovie && (selectedMovie !== null || selectedShow !== null)}
                      wasGuessed={wasWrongGuess}
                    >
                      <RankBadge rank={index + 1} />
                      <ItemPoster>
                        <ContentImage item={movie} />
                      </ItemPoster>
                      <ItemInfo>
                        <ItemTitle>
                          <TitleText>{movie.name}</TitleText>
                          {isTopMovie && (selectedMovie !== null || selectedShow !== null) && (
                            <TopBadge>Your #1</TopBadge>
                          )}
                          {wasWrongGuess && (
                            <GuessBadge>Your Guess</GuessBadge>
                          )}
                        </ItemTitle>
                        <ItemMeta>
                          <MetaHighlight>{movie.completedWatches ?? 1}x</MetaHighlight> watched • {formatWatchTime(((movie as MovieWithStats).totalWatchTimeSeconds ?? 0) / 60)}
                        </ItemMeta>
                      </ItemInfo>
                    </RankItem>
                  );
                })}
              </ItemList>
            </SectionCard>
            )}

            {data.shows.length > 0 && (
            <SectionCard
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ flex: "1 1 400px", maxWidth: "560px" }}
            >
              <CardAccent variant="shows" />
              <SectionHeader>
                <SectionIcon>
                  <Tv size={20} />
                </SectionIcon>
                <SectionTitleWrapper>
                  <SectionTitle>Top Shows</SectionTitle>
                  <SectionSubtitle>Binge-worthy series</SectionSubtitle>
                </SectionTitleWrapper>
              </SectionHeader>
              <ItemList>
                {data.shows.map(
                  (
                    show: {
                      item: SimpleItemDto;
                      episodeCount: number;
                      playbackTime: number;
                    },
                    index: number
                  ) => {
                    const isTopShow = index === 0 && topShow && show.item.id === topShow.item.id;
                    const wasGuessed = selectedShow === show.item.id;
                    const wasWrongGuess = wasGuessed && !isTopShow;
                    return (
                      <RankItem
                        key={show.item.id}
                        variants={itemVariants}
                        highlighted={isTopShow && (selectedMovie !== null || selectedShow !== null)}
                        wasGuessed={wasWrongGuess}
                      >
                        <RankBadge rank={index + 1} />
                        <ItemPoster>
                          <ContentImage item={show.item} />
                        </ItemPoster>
                        <ItemInfo>
                          <ItemTitle>
                            <TitleText>{show.item.name}</TitleText>
                            {isTopShow && (selectedMovie !== null || selectedShow !== null) && (
                              <TopBadge>Your #1</TopBadge>
                            )}
                            {wasWrongGuess && (
                              <GuessBadge>Your Guess</GuessBadge>
                            )}
                          </ItemTitle>
                          <ItemMeta>
                            <MetaHighlight>{show.episodeCount}</MetaHighlight> episodes • {formatWatchTime(show.playbackTime / 60)}
                          </ItemMeta>
                        </ItemInfo>
                      </RankItem>
                    );
                  }
                )}
              </ItemList>
            </SectionCard>
            )}
          </div>
          )}
        </Grid>
      </Container>
    </PageContainer>
  );
};

const HeaderSection = ({ children, style, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div
    style={{
      textAlign: "center",
      marginBottom: "1.5rem",
      paddingTop: "3rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

const HeaderBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 20px",
      background: "rgba(0, 240, 255, 0.06)",
      border: "1px solid rgba(0, 240, 255, 0.12)",
      borderRadius: "999px",
      fontSize: "0.85rem",
      fontWeight: 600,
      color: "#00f0ff",
      marginBottom: "1.75rem",
      backdropFilter: "blur(12px)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const BadgeIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "24px",
      height: "24px",
      borderRadius: "7px",
      background: "rgba(0, 240, 255, 0.15)",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const PageTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    style={{
      fontSize: "clamp(2.25rem, 6vw, 4rem)",
      fontWeight: 800,
      marginBottom: "0.85rem",
      letterSpacing: "-0.04em",
      background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 50%, #a855f7 100%)",
      backgroundSize: "200% 200%",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "gradient-flow 8s ease infinite",
      ...style,
    }}
    {...props}
  >
    {children}
  </h1>
);

const PageSubtitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    style={{
      fontSize: "1.15rem",
      color: "#94a3b8",
      fontWeight: 400,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

const SectionCard = ({ children, style, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div
    style={{
      background: "rgba(18, 21, 28, 0.65)",
      backdropFilter: "blur(24px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.03)",
      borderRadius: "28px",
      padding: "32px",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

const CardAccent = ({
  variant,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "movies" | "shows" }) => {
  const variantBackground =
    variant === "movies"
      ? "linear-gradient(90deg, transparent, #00f0ff, transparent)"
      : "linear-gradient(90deg, transparent, #a855f7, transparent)";
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "35%",
        height: "2px",
        background: variantBackground,
        ...style,
      }}
      {...props}
    />
  );
};

const SectionHeader = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "1.75rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const SectionIcon = ({
  children,
  movie,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { movie?: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "52px",
      height: "52px",
      borderRadius: "16px",
      color: "#030304",
      background: movie
        ? "linear-gradient(135deg, #00f0ff 0%, #22d3ee 100%)"
        : "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
      boxShadow: movie
        ? "0 6px 24px rgba(0, 240, 255, 0.35)"
        : "0 6px 24px rgba(168, 85, 247, 0.35)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const SectionTitleWrapper = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const SectionTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    style={{
      fontSize: "1.6rem",
      fontWeight: 700,
      color: "#f8fafc",
      letterSpacing: "-0.02em",
      marginBottom: "2px",
      ...style,
    }}
    {...props}
  >
    {children}
  </h2>
);

const SectionSubtitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      fontSize: "0.85rem",
      color: "#475569",
      fontWeight: 500,
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const ItemList = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const RankItem = ({
  children,
  highlighted,
  wasGuessed,
  style,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  highlighted?: boolean | null;
  wasGuessed?: boolean;
}) => {
  const variantStyle: React.CSSProperties = highlighted
    ? {
        background: "rgba(34, 197, 94, 0.1)",
        borderColor: "rgba(34, 197, 94, 0.3)",
        boxShadow: "0 0 20px rgba(34, 197, 94, 0.2)",
      }
    : wasGuessed
    ? {
        background: "rgba(239, 68, 68, 0.08)",
        borderColor: "rgba(239, 68, 68, 0.2)",
      }
    : {};
  return (
    <motion.div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "14px 18px",
        background: "rgba(255, 255, 255, 0.015)",
        border: "1px solid rgba(255, 255, 255, 0.02)",
        borderRadius: "16px",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        ...variantStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const ItemPoster = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      width: "52px",
      height: "78px",
      borderRadius: "10px",
      overflow: "hidden",
      flexShrink: 0,
      border: "1px solid rgba(255, 255, 255, 0.05)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const ItemInfo = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const ItemTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    style={{
      fontSize: "1.05rem",
      fontWeight: 600,
      color: "#f8fafc",
      marginBottom: "5px",
      letterSpacing: "-0.01em",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      flexWrap: "wrap",
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

const TitleText = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      flex: "1 1 auto",
      minWidth: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const ItemMeta = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    style={{
      fontSize: "0.85rem",
      color: "#64748b",
      fontFamily: "'JetBrains Mono', monospace",
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

const MetaHighlight = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      color: "#00f0ff",
      fontWeight: 600,
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const QuizCard = ({ children, style, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div
    style={{
      background: "rgba(18, 21, 28, 0.65)",
      backdropFilter: "blur(24px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "24px",
      padding: "3rem",
      textAlign: "center",
      marginTop: "2rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

const QuizTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    style={{
      fontSize: "2rem",
      fontWeight: 700,
      color: "#f8fafc",
      marginBottom: "2rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </h2>
);

const QuizOptions = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const QuizOption = ({ children, style, ...props }: React.ComponentProps<typeof motion.button>) => (
  <motion.button
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem",
      padding: "1.5rem",
      background: "rgba(255, 255, 255, 0.02)",
      border: "2px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "16px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      ...style,
    }}
    {...props}
  >
    {children}
  </motion.button>
);

const QuizImageWrapper = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      width: "120px",
      height: "180px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      overflow: "hidden",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const QuizOptionName = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      fontSize: "1rem",
      fontWeight: 600,
      color: "#f8fafc",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const SkipButton = ({ children, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    style={{
      padding: "0.75rem 1.5rem",
      background: "transparent",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      color: "#94a3b8",
      fontSize: "0.9rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
      ...style,
    }}
    {...props}
  >
    {children}
  </button>
);

const QuizResultsMessage = ({ children, style, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div
    style={{
      background: "rgba(0, 240, 255, 0.1)",
      border: "1px solid rgba(0, 240, 255, 0.2)",
      borderRadius: "16px",
      padding: "1.5rem 2rem",
      marginTop: "1.5rem",
      marginBottom: "1.5rem",
      textAlign: "center",
      fontSize: "1.25rem",
      fontWeight: 600,
      color: "#00f0ff",
      ...style,
    }}
    {...props}
  >
    {children}
  </motion.div>
);

const TopBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "0.25rem 0.75rem",
      background: "rgba(34, 197, 94, 0.2)",
      border: "1px solid rgba(34, 197, 94, 0.4)",
      borderRadius: "8px",
      fontSize: "0.75rem",
      fontWeight: 700,
      color: "#22c55e",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginLeft: "0.5rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const GuessBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "0.25rem 0.75rem",
      background: "rgba(239, 68, 68, 0.15)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      borderRadius: "8px",
      fontSize: "0.75rem",
      fontWeight: 700,
      color: "#ef4444",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginLeft: "0.5rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);
