import React from "react";
import { Avatar } from "@radix-ui/themes";
import { SimpleItemDto, PersonDto } from "@/lib/queries";

interface ActorCardProps {
  name: string;
  count: number;
  details: PersonDto;
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
  return (
    <CardContainer>
      <ImageContainer>
        <Avatar
          size="8"
          src={details.imageUrl ?? undefined}
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

const CardContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      background: "rgba(15, 18, 25, 0.8)",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      transition: "all 0.3s ease",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const ImageContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      aspectRatio: "2/3",
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(180deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const CardContent = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      padding: "16px",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const ActorName = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    style={{
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#f8fafc",
      marginBottom: "6px",
      fontFamily: "'Sora', sans-serif",
      lineHeight: 1.3,
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

const WatchCount = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    style={{
      fontSize: "0.875rem",
      color: "#00f0ff",
      fontWeight: 500,
      marginBottom: "10px",
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

const TitleList = ({ children, style, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul
    style={{
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      ...style,
    }}
    {...props}
  >
    {children}
  </ul>
);

const TitleItem = ({ children, style, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li
    style={{
      fontSize: "0.8rem",
      color: "#94a3b8",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      ...style,
    }}
    {...props}
  >
    {children}
  </li>
);

const MoreCount = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      fontSize: "0.75rem",
      color: "#64748b",
      fontStyle: "italic",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);
