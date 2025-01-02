import { useEffect, useState } from "react";
import { ImageType } from "@jellyfin/sdk/lib/generated-client";
import { getAuthenticatedJellyfinApi } from "@/lib/jellyfin-api";
import { getImageApi } from "@jellyfin/sdk/lib/utils/api";
import { Avatar } from "@radix-ui/themes";
import { formatDuration } from "@/lib/utils";
import { SimpleItemDto } from "@/lib/playback-reporting-queries";

interface MovieCardProps {
  item: SimpleItemDto;
  playbackTime?: number;
  episodeCount?: number;
}

export function MovieCard({
  item,
  playbackTime,
  episodeCount,
}: MovieCardProps) {
  const [imageUrl, setImageUrl] = useState<string>();
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const api = getImageApi(await getAuthenticatedJellyfinApi());
        // @ts-expect-error ImageType.Poster not behaving right
        const url = await api.getItemImageUrlById(item.id, ImageType.Poster);
        setImageUrl(url!);
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
      }
    };

    fetchImageUrl();
  }, [item]);

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="aspect-[2/3] relative">
        <Avatar
          size="8"
          src={imageUrl}
          fallback={item.name?.[0] || "?"}
          className="w-full h-full"
          style={{
            borderRadius: 0,
            aspectRatio: "2/3",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-sm text-muted-foreground">
          {item.productionYear && `Released: ${item.productionYear}`}
        </p>
        {item.communityRating && (
          <p className="text-sm text-muted-foreground">
            Rating: ⭐ {item.communityRating.toFixed(1)}
          </p>
        )}
        {playbackTime && episodeCount && episodeCount > 1 && (
          <>
            <p className="text-sm text-muted-foreground">
              You watched {episodeCount} episodes
            </p>
            <p className="text-sm text-muted-foreground">
              Watch time: {formatDuration(playbackTime)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}