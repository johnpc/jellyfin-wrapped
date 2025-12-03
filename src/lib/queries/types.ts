import {
  BaseItemPerson,
  NameGuidPair,
} from "@jellyfin/sdk/lib/generated-client";

export type SimpleItemDto = {
  id?: string;
  parentId?: string | null;
  name?: string | null;
  date?: string | null;
  communityRating?: number | null;
  productionYear?: number | null;
  people?: BaseItemPerson[] | null;
  genres?: string[] | null;
  genreItems?: NameGuidPair[] | null;
  durationSeconds?: number;
};

export interface PunchCardData {
  dayOfWeek: number;
  hour: number;
  count: number;
}

export interface CalendarData {
  value: number;
  day: string;
}

export type UnfinishedShowDto = {
  item: SimpleItemDto;
  watchedEpisodes: number;
  totalEpisodes: number;
  lastWatchedDate: Date;
};
