import { useEffect, useState } from "react";
import { Avatar } from "@radix-ui/themes";
import { getImageUrlById, SimpleItemDto } from "@/lib/queries";

export function ContentImage({ item }: { item: SimpleItemDto }) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const url = await getImageUrlById(item.id ?? "");
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
      }
    };

    void fetchImageUrl();
  }, [item]);

  return (
    <Avatar
      size="8"
      src={imageUrl}
      fallback={item.name?.[0] || "?"}
      style={{
        aspectRatio: "2/3",
        width: "30%",
        height: "100%",
      }}
    />
  );
}
