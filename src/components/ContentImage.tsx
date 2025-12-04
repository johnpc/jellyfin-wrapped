import { useEffect, useState } from "react";
import { getImageUrlById, SimpleItemDto } from "@/lib/queries";
import { styled } from "@stitches/react";

export function ContentImage({ item }: { item: SimpleItemDto }) {
  const [imageUrl, setImageUrl] = useState("");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const url = await getImageUrlById(item.id ?? "");
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
        setHasError(true);
      }
    };

    void fetchImageUrl();
  }, [item]);

  if (hasError || !imageUrl) {
    return (
      <FallbackContainer>
        <FallbackText>{item.name?.[0] || "?"}</FallbackText>
      </FallbackContainer>
    );
  }

  return (
    <ImageWrapper>
      <StyledImage 
        src={imageUrl} 
        alt={item.name || "Content"} 
        onError={() => setHasError(true)}
      />
    </ImageWrapper>
  );
}

const ImageWrapper = styled("div", {
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
  borderRadius: "inherit",
});

const StyledImage = styled("img", {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});

const FallbackContainer = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
  borderRadius: "inherit",
});

const FallbackText = styled("span", {
  fontSize: "2rem",
  fontWeight: 700,
  color: "#00f0ff",
  textTransform: "uppercase",
});
