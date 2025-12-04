import { useEffect, useState } from "react";
import { Avatar } from "@radix-ui/themes";
import { getImageUrlById, SimpleItemDto } from "@/lib/queries";
import { BaseItemPerson } from "@jellyfin/sdk/lib/generated-client";
import { styled } from "@stitches/react";

interface ActorCardProps {
  name: string;
  count: number;
  details: BaseItemPerson;
  seenInMovies: SimpleItemDto[];
  seenInShows: SimpleItemDto[];
}

export function ActorCard({
  name,
  count,
  details,
  seenInMovies,
  seenInShows,
}: ActorCardProps) {
  const [imageUrl, setImageUrl] = useState<string>();
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const url = await getImageUrlById(details.Id ?? "");
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
      }
    };

    void fetchImageUrl();
  }, [details]);

  return (
    <CardContainer>
      <ImageContainer>
        <Avatar
          size="8"
          src={imageUrl}
          fallback={details.Name?.[0] || "?"}
          style={{
            borderRadius: 0,
            aspectRatio: "2/3",
            width: "100%",
            height: "100%",
          }}
        />
      </ImageContainer>
      <CardContent>
        <ActorName>{name}</ActorName>
        {count > 0 && (
          <>
            <WatchCount>
              Appeared in {count} {count === 1 ? "title" : "titles"}
            </WatchCount>
            <TitleList>
              {[...seenInMovies, ...seenInShows].slice(0, 3).map((itemDto, index) => (
                <TitleItem key={index}>{itemDto.name}</TitleItem>
              ))}
              {[...seenInMovies, ...seenInShows].length > 3 && (
                <MoreCount>
                  +{[...seenInMovies, ...seenInShows].length - 3} more
                </MoreCount>
              )}
            </TitleList>
          </>
        )}
      </CardContent>
    </CardContainer>
  );
}

const CardContainer = styled("div", {
  background: "rgba(15, 18, 25, 0.8)",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  transition: "all 0.3s ease",
  
  "&:hover": {
    transform: "translateY(-4px)",
    borderColor: "rgba(0, 240, 255, 0.2)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
  },
});

const ImageContainer = styled("div", {
  aspectRatio: "2/3",
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
});

const CardContent = styled("div", {
  padding: "16px",
});

const ActorName = styled("h3", {
  fontSize: "1.1rem",
  fontWeight: 600,
  color: "#f8fafc",
  marginBottom: "6px",
  fontFamily: "'Sora', sans-serif",
  lineHeight: 1.3,
});

const WatchCount = styled("p", {
  fontSize: "0.875rem",
  color: "#00f0ff",
  fontWeight: 500,
  marginBottom: "10px",
});

const TitleList = styled("ul", {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});

const TitleItem = styled("li", {
  fontSize: "0.8rem",
  color: "#94a3b8",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const MoreCount = styled("span", {
  fontSize: "0.75rem",
  color: "#64748b",
  fontStyle: "italic",
});
