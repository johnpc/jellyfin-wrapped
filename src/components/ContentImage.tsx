import { useState } from "react";
import { SimpleItemDto } from "@/lib/queries";

export function ContentImage({ item }: { item: SimpleItemDto }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !item.imageUrl) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
          borderRadius: "inherit",
        }}
      >
        <span
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#00f0ff",
            textTransform: "uppercase",
          }}
        >
          {item.name?.[0] || "?"}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "inherit",
      }}
    >
      <img
        src={item.imageUrl}
        alt={item.name || "Content"}
        onError={() => setHasError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}
