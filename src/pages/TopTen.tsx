import { useTopTen } from "@/hooks/queries/useTopTen";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ContentImage } from "@/components/ContentImage";
import { RankBadge } from "@/components/RankBadge";
import { formatWatchTime } from "@/lib/time-helpers";
import { SimpleItemDto } from "@/lib/queries";

export const TopTen = () => {
  const year = new Date().getFullYear();
  const { data, isLoading, error } = useTopTen();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading top ten</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-12 text-center">
          Your Top 10 of {year}
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-3xl font-bold mb-6">Top Movies</h2>
            <div className="space-y-4">
              {data.movies.map((movie: SimpleItemDto, index: number) => (
                <div
                  key={movie.id}
                  className="flex items-center gap-4 bg-white/10 rounded-lg p-4 backdrop-blur-sm"
                >
                  <RankBadge rank={index + 1} />
                  <ContentImage item={movie} />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{movie.name}</h3>
                    <p className="text-sm text-gray-300">
                      {formatWatchTime((movie.durationSeconds ?? 0) / 60)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">Top Shows</h2>
            <div className="space-y-4">
              {data.shows.map(
                (
                  show: {
                    item: SimpleItemDto;
                    episodeCount: number;
                    playbackTime: number;
                  },
                  index: number
                ) => (
                  <div
                    key={show.item.id}
                    className="flex items-center gap-4 bg-white/10 rounded-lg p-4 backdrop-blur-sm"
                  >
                    <RankBadge rank={index + 1} />
                    <ContentImage item={show.item} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {show.item.name}
                      </h3>
                      <p className="text-sm text-gray-300">
                        {show.episodeCount} episodes •{" "}
                        {formatWatchTime(show.playbackTime / 60)}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
