import React from "react";
import { useData } from "@/contexts/DataContext";
import { useComparisons } from "@/hooks/queries/useComparisons";
import { useTopTen } from "@/hooks/queries/useTopTen";
import { LoadingSpinner } from "../LoadingSpinner";
import PageContainer from "../PageContainer";
import { Container } from "@radix-ui/themes";
import { motion, PanInfo } from "motion/react";
import { Sparkles, Clock, Film, Tv, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { ShareCard } from "../ShareCard";
import { formatWatchTime } from "@/lib/time-helpers";
import { useMemo, useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { getCurrentTimeframe } from "@/lib/timeframe";

export default function SharePage() {
  const { movies, shows, isLoading } = useData();
  const { data: comparisons, isLoading: comparisonsLoading } = useComparisons();
  const { data: topTen, isLoading: topTenLoading } = useTopTen();
  const [currentIndex, setCurrentIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerOffset, setCenterOffset] = useState(0);
  const [cardWidth, setCardWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const gap = 32;
  const isMobile = useIsMobile();

  const totalWatchTime = useMemo(() => {
    if (isLoading || !movies.data || !shows.data) return 0;
    const movieTime = (movies.data as Array<{ totalWatchTimeSeconds?: number }>)
      .reduce((sum, movie) => sum + (movie.totalWatchTimeSeconds || 0), 0);
    const showTime = (shows.data as Array<{ playbackTime?: number }>)
      .reduce((sum, show) => sum + (show.playbackTime || 0), 0);
    return (movieTime + showTime) / 60;
  }, [movies.data, shows.data, isLoading]);

  const movieCount = useMemo(() => movies.data?.length || 0, [movies.data]);
  const showCount = useMemo(() => shows.data?.length || 0, [shows.data]);
  const totalEpisodes = useMemo(() => {
    if (!shows.data) return 0;
    return shows.data.reduce((sum, show) => sum + (show.episodeCount || 0), 0);
  }, [shows.data]);

  // Calculate derived values before early return
  const timeframe = getCurrentTimeframe();
  const topMovie = topTen?.movies?.[0];
  const topShow = topTen?.shows?.[0];
  const top3Movies = topTen?.movies?.slice(0, 3) || [];
  const top3Shows = topTen?.shows?.slice(0, 3) || [];

  // Build array of cards to display (before early return)
  const cards = useMemo(() => {
    const cardArray = [];
    if (totalWatchTime > 0) {
      cardArray.push({ type: "totalTime", key: "total-time" });
    }
    if (topMovie) {
      cardArray.push({ type: "topMovie", key: "top-movie" });
    }
    if (topShow) {
      cardArray.push({ type: "topShow", key: "top-show" });
    }
    if (top3Movies.length > 0) {
      cardArray.push({ type: "top3Movies", key: "top-3-movies" });
    }
    if (top3Shows.length > 0) {
      cardArray.push({ type: "top3Shows", key: "top-3-shows" });
    }
    if (movieCount > 0 || showCount > 0) {
      cardArray.push({ type: "stats", key: "stats" });
    }
    return cardArray;
  }, [totalWatchTime, topMovie, topShow, top3Movies, top3Shows, movieCount, showCount]);

  // Calculate center offset after cards is defined (desktop only)
  useEffect(() => {
    if (isMobile) {
      // On mobile, use native scroll - no need for offset calculations
      return;
    }
    
    const calculateOffset = () => {
      if (wrapperRef.current && cards.length > 0) {
        const wrapperWidth = wrapperRef.current.offsetWidth;
        const calculatedCardWidth = 400;
        setCardWidth(calculatedCardWidth);
        
        // Center the first card - this ensures it's fully visible at index 0
        const firstCardOffset = (wrapperWidth - calculatedCardWidth) / 2;
        
        // Verify the last card will be fully visible
        // Position of last card: firstCardOffset - (cards.length - 1) * (calculatedCardWidth + gap)
        const lastCardX = firstCardOffset - (cards.length - 1) * (calculatedCardWidth + gap);
        const lastCardRightEdge = lastCardX + calculatedCardWidth;
        
        // If last card would extend beyond the wrapper, adjust the offset
        // We want the last card's right edge to be at most at wrapperWidth
        if (lastCardRightEdge > wrapperWidth) {
          // Adjust so last card is fully visible
          const adjustment = lastCardRightEdge - wrapperWidth;
          setCenterOffset(firstCardOffset - adjustment);
        } else {
          setCenterOffset(firstCardOffset);
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const rafId = requestAnimationFrame(() => {
      calculateOffset();
    });
    window.addEventListener("resize", calculateOffset);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", calculateOffset);
    };
  }, [cards.length, isMobile]); // Recalculate when number of cards changes or mobile state changes

  // Sync currentIndex with scroll position on mobile for dots indicator
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const container = containerRef.current;
    let rafId: number | null = null;

    const handleScroll = () => {
      // Use requestAnimationFrame to throttle scroll updates
      if (rafId !== null) return;
      
      rafId = requestAnimationFrame(() => {
        const scrollLeft = container.scrollLeft;
        const viewportWidth = window.innerWidth;
        const cardWidth = viewportWidth * 0.90; // 90vw
        const padding = viewportWidth * 0.05; // 5vw
        
        // Calculate which card is currently centered
        const adjustedScroll = scrollLeft + padding;
        const cardIndex = Math.round(adjustedScroll / cardWidth);
        const clampedIndex = Math.max(0, Math.min(cardIndex, cards.length - 1));
        
        // Update currentIndex to sync with scroll position (for dots indicator)
        setCurrentIndex(prevIndex => {
          if (clampedIndex !== prevIndex) {
            return clampedIndex;
          }
          return prevIndex;
        });
        
        rafId = null;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isMobile, cards.length]);

  // Calculate transform value for CSS transition (desktop only)
  // Use useMemo to prevent recalculation on every render
  const carouselTransform = useMemo(() => {
    if (isMobile || cards.length === 0 || centerOffset === 0) return "translateX(0px)";
    const x = centerOffset - currentIndex * (cardWidth + gap);
    return `translateX(${x}px) translateZ(0)`;
  }, [isMobile, currentIndex, centerOffset, cardWidth, gap, cards.length]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (info.offset.x < -threshold && currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (isLoading || comparisonsLoading || topTenLoading) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p={isMobile ? "0" : "4"}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
          style={{ textAlign: "center", marginBottom: "3rem", paddingTop: "2rem" }}
        >
          <Badge>
            <BadgeIcon>
              <Sparkles size={14} />
            </BadgeIcon>
            <span>Share Your Wrapped</span>
          </Badge>
          <Title>Shareable Cards</Title>
          <Subtitle>Download and share your Jellyfin Wrapped highlights</Subtitle>
        </motion.div>

        <CarouselSection>
          <CarouselContainer ref={containerRef}>
            <CarouselWrapper ref={wrapperRef}>
              <motion.div
                drag={!isMobile ? "x" : false}
                dragConstraints={!isMobile && centerOffset > 0 ? {
                  left: centerOffset - (cards.length - 1) * (cardWidth + gap),
                  right: centerOffset
                } : undefined}
                dragElastic={0.05}
                dragMomentum={false}
                dragPropagation={false}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                style={{
                  display: "flex",
                  gap: "2rem",
                  cursor: "grab",
                  userSelect: "none",
                  transform: !isMobile && !isDragging ? carouselTransform : "translateZ(0)",
                  backfaceVisibility: "hidden",
                  willChange: "transform",
                  transition: !isMobile && !isDragging ? "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none",
                }}
              >
                {/* Total Time Card */}
                {totalWatchTime > 0 && (
                  <CardSlide>
                    <ShareCard title="Total Watch Time" filename={`jellyfin-wrapped-${timeframe.id}-total-time.png`}>
                      <TotalTimeCardContent>
                        <CardTitle>My Jellyfin Wrapped — {timeframe.name}</CardTitle>
                        <TimeDisplay>
                          <TimeValue>{formatWatchTime(totalWatchTime)}</TimeValue>
                          <TimeLabel>Total Watch Time</TimeLabel>
                        </TimeDisplay>
                        {comparisons && comparisons.comparisons.length > 0 && (
                          <ComparisonText>
                            {comparisons.comparisons[0].label} {comparisons.comparisons[0].value} {comparisons.comparisons[0].unit}
                          </ComparisonText>
                        )}
                      </TotalTimeCardContent>
                    </ShareCard>
                  </CardSlide>
                )}

                {/* Top Movie Card */}
                {topMovie && (
                  <CardSlide>
                    <ShareCard title="Top Movie" filename={`jellyfin-wrapped-${timeframe.id}-top-movie.png`}>
                      <TopItemCardContent>
                        <CardTitle>My Jellyfin Wrapped — {timeframe.name}</CardTitle>
                        <ItemLabel>#1 Movie</ItemLabel>
                        <ItemImage>
                          {topMovie.imageUrl ? (
                            <img src={topMovie.imageUrl} alt={topMovie.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)", color: "#00f0ff", fontSize: isMobile ? "clamp(2rem, 8vw, 3rem)" : "4rem", fontWeight: 700 }}>
                              {topMovie.name?.[0] || "?"}
                            </div>
                          )}
                        </ItemImage>
                        <ItemName>{topMovie.name}</ItemName>
                        {topMovie.completedWatches && (
                          <ItemMeta>Watched {topMovie.completedWatches}x</ItemMeta>
                        )}
                      </TopItemCardContent>
                    </ShareCard>
                  </CardSlide>
                )}

                {/* Top Show Card */}
                {topShow && (
                  <CardSlide>
                    <ShareCard title="Top Show" filename={`jellyfin-wrapped-${timeframe.id}-top-show.png`}>
                      <TopItemCardContent>
                        <CardTitle>My Jellyfin Wrapped — {timeframe.name}</CardTitle>
                        <ItemLabel>#1 Show</ItemLabel>
                        <ItemImage>
                          {topShow.item.imageUrl ? (
                            <img src={topShow.item.imageUrl} alt={topShow.item.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)", color: "#00f0ff", fontSize: isMobile ? "clamp(2rem, 8vw, 3rem)" : "4rem", fontWeight: 700 }}>
                              {topShow.item.name?.[0] || "?"}
                            </div>
                          )}
                        </ItemImage>
                        <ItemName>{topShow.item.name}</ItemName>
                        <ItemMeta>{topShow.episodeCount} episodes watched</ItemMeta>
                      </TopItemCardContent>
                    </ShareCard>
                  </CardSlide>
                )}

                {/* Top 3 Movies Card */}
                {top3Movies.length > 0 && (
                  <CardSlide>
                    <ShareCard title="Top 3 Movies" filename={`jellyfin-wrapped-${timeframe.id}-top-3-movies.png`}>
                      <Top3CardContent>
                        <CardTitle>My Jellyfin Wrapped — {timeframe.name}</CardTitle>
                        <ItemLabel>Top 3 Movies</ItemLabel>
                        <Top3Grid>
                          {top3Movies.map((movie, index) => (
                            <Top3Item key={movie.id}>
                              <Top3Rank>#{index + 1}</Top3Rank>
                              <Top3Image>
                                {movie.imageUrl ? (
                                  <img src={movie.imageUrl} alt={movie.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)", color: "#00f0ff", fontSize: isMobile ? "clamp(1.25rem, 5vw, 1.75rem)" : "2rem", fontWeight: 700 }}>
                                    {movie.name?.[0] || "?"}
                                  </div>
                                )}
                              </Top3Image>
                              <Top3Name>{movie.name}</Top3Name>
                              {movie.completedWatches && (
                                <Top3Meta>{movie.completedWatches}x</Top3Meta>
                              )}
                            </Top3Item>
                          ))}
                        </Top3Grid>
                      </Top3CardContent>
                    </ShareCard>
                  </CardSlide>
                )}

                {/* Top 3 Shows Card */}
                {top3Shows.length > 0 && (
                  <CardSlide>
                    <ShareCard title="Top 3 Shows" filename={`jellyfin-wrapped-${timeframe.id}-top-3-shows.png`}>
                      <Top3CardContent>
                        <CardTitle>My Jellyfin Wrapped — {timeframe.name}</CardTitle>
                        <ItemLabel>Top 3 Shows</ItemLabel>
                        <Top3Grid>
                          {top3Shows.map((show, index) => (
                            <Top3Item key={show.item.id}>
                              <Top3Rank>#{index + 1}</Top3Rank>
                              <Top3Image>
                                {show.item.imageUrl ? (
                                  <img src={show.item.imageUrl} alt={show.item.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)", color: "#00f0ff", fontSize: isMobile ? "clamp(1.25rem, 5vw, 1.75rem)" : "2rem", fontWeight: 700 }}>
                                    {show.item.name?.[0] || "?"}
                                  </div>
                                )}
                              </Top3Image>
                              <Top3Name>{show.item.name}</Top3Name>
                              <Top3Meta>{show.episodeCount} episodes</Top3Meta>
                            </Top3Item>
                          ))}
                        </Top3Grid>
                      </Top3CardContent>
                    </ShareCard>
                  </CardSlide>
                )}

                {/* Stats Card */}
                {(movieCount > 0 || showCount > 0) && (
                  <CardSlide>
                    <ShareCard title="Your Stats" filename={`jellyfin-wrapped-${timeframe.id}-stats.png`}>
                      <StatsCardContent>
                        <CardTitle>My Jellyfin Wrapped — {timeframe.name}</CardTitle>
                        <ItemLabel>Your Viewing Stats</ItemLabel>
                        <StatsGrid>
                          <StatItem>
                            <StatIcon>
                              <Film size={32} />
                            </StatIcon>
                            <StatValue>{movieCount}</StatValue>
                            <StatLabel>Movies Watched</StatLabel>
                          </StatItem>
                          <StatItem>
                            <StatIcon>
                              <Tv size={32} />
                            </StatIcon>
                            <StatValue>{showCount}</StatValue>
                            <StatLabel>Shows Watched</StatLabel>
                          </StatItem>
                          <StatItem>
                            <StatIcon>
                              <TrendingUp size={32} />
                            </StatIcon>
                            <StatValue>{totalEpisodes}</StatValue>
                            <StatLabel>Episodes Watched</StatLabel>
                          </StatItem>
                          <StatItem>
                            <StatIcon>
                              <Clock size={32} />
                            </StatIcon>
                            <StatValueSmall>{formatWatchTime(totalWatchTime)}</StatValueSmall>
                            <StatLabel>Total Watch Time</StatLabel>
                          </StatItem>
                        </StatsGrid>
                      </StatsCardContent>
                    </ShareCard>
                  </CardSlide>
                )}
              </motion.div>
            </CarouselWrapper>

            {/* Dots Indicator */}
            {cards.length > 1 && (
              <DotsContainer>
                {cards.map((_, index) => (
                  <Dot
                    key={index}
                    active={index === currentIndex}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </DotsContainer>
            )}
          </CarouselContainer>

          {/* Navigation Buttons - Outside Container */}
          {cards.length > 1 && (
            <>
              <NavButton
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                style={{ left: "0" }}
              >
                <ChevronLeft size={24} />
              </NavButton>
              <NavButton
                onClick={goToNext}
                disabled={currentIndex === cards.length - 1}
                style={{ right: "0" }}
              >
                <ChevronRight size={24} />
              </NavButton>
            </>
          )}
        </CarouselSection>
      </Container>
    </PageContainer>
  );
}

const Badge = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 20px", background: "rgba(0, 240, 255, 0.06)", border: "1px solid rgba(0, 240, 255, 0.12)", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 600, color: "#00f0ff", marginBottom: "1.5rem", backdropFilter: "blur(12px)", ...style }} {...props}>{children}</div>
);

const BadgeIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "7px", background: "rgba(0, 240, 255, 0.15)", ...style }} {...props}>{children}</span>
);

const Title = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 style={{ fontSize: "clamp(2.25rem, 6vw, 4rem)", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.04em", background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 50%, #a855f7 100%)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gradient-flow 8s ease infinite", ...style }} {...props}>{children}</h1>
);

const Subtitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p style={{ fontSize: "1.15rem", color: "#94a3b8", fontWeight: 400, ...style }} {...props}>{children}</p>
);

const TotalTimeCardContent = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%", height: "100%", gap: "2rem", padding: "2rem 0", ...style }} {...props}>{children}</div>
);

const CardTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "0.5rem", ...style }} {...props}>{children}</h2>
);

const TimeDisplay = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", background: "transparent", backgroundColor: "transparent", ...style }} {...props}>{children}</div>
);

const TimeValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "2.5rem", fontWeight: 900, fontFamily: "'Inter', -apple-system, sans-serif", background: "linear-gradient(135deg, #00f0ff 0%, #a855f7 50%, #f59e0b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1.2, letterSpacing: "-0.02em", ...style }} {...props}>{children}</div>
);

const TimeLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.01em", ...style }} {...props}>{children}</div>
);

const ComparisonText = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "1.1rem", color: "#94a3b8", fontStyle: "italic", fontWeight: 500, ...style }} {...props}>{children}</div>
);

const TopItemCardContent = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%", height: "100%", gap: "1.75rem", padding: "2rem 0", ...style }} {...props}>{children}</div>
);

const ItemLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.2em", ...style }} {...props}>{children}</div>
);

const ItemImage = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ width: "220px", height: "330px", borderRadius: "20px", overflow: "hidden", border: "3px solid rgba(0, 240, 255, 0.3)", boxShadow: "0 20px 60px rgba(0, 240, 255, 0.2)", ...style }} {...props}>{children}</div>
);

const ItemName = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f8fafc", lineHeight: 1.2, letterSpacing: "-0.02em", maxWidth: "90%", ...style }} {...props}>{children}</div>
);

const ItemMeta = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "1rem", color: "#94a3b8", fontWeight: 600, fontFamily: "'Inter', sans-serif", ...style }} {...props}>{children}</div>
);

const Top3CardContent = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%", height: "100%", gap: "1.75rem", padding: "2rem 0", ...style }} {...props}>{children}</div>
);

const Top3Grid = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", ...style }} {...props}>{children}</div>
);

const Top3Item = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%", padding: "0.75rem", background: "rgba(255, 255, 255, 0.05)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.1)", ...style }} {...props}>{children}</div>
);

const Top3Rank = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#00f0ff", fontFamily: "'Inter', sans-serif", minWidth: "35px", textAlign: "center", ...style }} {...props}>{children}</div>
);

const Top3Image = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ width: "70px", height: "105px", borderRadius: "12px", overflow: "hidden", border: "2px solid rgba(0, 240, 255, 0.3)", flexShrink: 0, boxShadow: "0 4px 12px rgba(0, 240, 255, 0.2)", ...style }} {...props}>{children}</div>
);

const Top3Name = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", flex: 1, textAlign: "left", lineHeight: 1.3, letterSpacing: "-0.01em", ...style }} {...props}>{children}</div>
);

const Top3Meta = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "0.9rem", color: "#94a3b8", fontFamily: "'Inter', sans-serif", fontWeight: 600, ...style }} {...props}>{children}</div>
);

const StatsCardContent = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", width: "100%", height: "100%", gap: "2rem", padding: "2rem 0", ...style }} {...props}>{children}</div>
);

const StatsGrid = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem", width: "100%", ...style }} {...props}>{children}</div>
);

const StatItem = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.25rem", background: "rgba(255, 255, 255, 0.05)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.1)", minHeight: "180px", justifyContent: "space-between", ...style }} {...props}>{children}</div>
);

const StatIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", borderRadius: "14px", background: "linear-gradient(135deg, #00f0ff 0%, #a855f7 100%)", color: "#030304", boxShadow: "0 4px 16px rgba(0, 240, 255, 0.3)", flexShrink: 0, marginBottom: "0.75rem", ...style }} {...props}>{children}</div>
);

const StatValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#f8fafc", fontFamily: "'Inter', sans-serif", lineHeight: 1.2, letterSpacing: "-0.02em", minHeight: "3.5rem", maxHeight: "3.5rem", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", marginBottom: "0.75rem", flex: 1, ...style }} {...props}>{children}</div>
);

const StatValueSmall = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "1rem", fontWeight: 900, color: "#f8fafc", fontFamily: "'Inter', sans-serif", lineHeight: 1.3, letterSpacing: "-0.02em", minHeight: "3.5rem", maxHeight: "3.5rem", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", marginBottom: "0.75rem", flex: 1, ...style }} {...props}>{children}</div>
);

const StatLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", fontWeight: 600, height: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, ...style }} {...props}>{children}</div>
);

const CarouselSection = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "relative", width: "100%", marginBottom: "3rem", paddingLeft: "80px", paddingRight: "80px", ...style }} {...props}>{children}</div>
);

const CarouselContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, style, ...props }, ref) => (
    <div ref={ref} style={{ width: "100%", overflow: "hidden", position: "relative", paddingLeft: "0", paddingRight: "0", ...style }} {...props}>{children}</div>
  )
);
CarouselContainer.displayName = "CarouselContainer";

const CarouselWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, style, ...props }, ref) => (
    <div ref={ref} style={{ width: "100%", overflow: "hidden", position: "relative", display: "flex", ...style }} {...props}>{children}</div>
  )
);
CarouselWrapper.displayName = "CarouselWrapper";

const CardSlide = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ flexShrink: 0, width: "400px", display: "flex", justifyContent: "center", transform: "translateZ(0)", ...style }} {...props}>{children}</div>
);

const NavButton = ({ children, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button style={{ position: "absolute", top: "calc(350px + 1rem)", transform: "translateY(-50%) translateZ(0)", width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0, 240, 255, 0.1)", border: "1px solid rgba(0, 240, 255, 0.2)", color: "#00f0ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease", willChange: "transform", zIndex: 10, backfaceVisibility: "hidden", ...style }} {...props}>{children}</button>
);

const DotsContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "2rem", ...style }} {...props}>{children}</div>
);

type DotActive = boolean;
const Dot = ({ children, active, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: DotActive }) => (
  <button style={{ width: active ? "32px" : "12px", height: "12px", borderRadius: active ? "6px" : "50%", border: "none", background: active ? "#00f0ff" : "rgba(255, 255, 255, 0.2)", cursor: "pointer", transition: "width 0.3s ease, border-radius 0.3s ease, background-color 0.3s ease", transform: "translateZ(0)", willChange: "width, border-radius, background-color", backfaceVisibility: "hidden", ...style }} {...props}>{children}</button>
);

