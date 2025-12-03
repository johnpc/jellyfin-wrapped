import { getPluginsApi } from "@jellyfin/sdk/lib/utils/api";
import { PluginStatus } from "@jellyfin/sdk/lib/generated-client";
import { getAuthenticatedJellyfinApi } from "../jellyfin-api";

export const checkIfPlaybackReportingInstalled = async (): Promise<boolean> => {
  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const pluginsApi = getPluginsApi(authenticatedApi);
  const pluginsResponse = await pluginsApi.getPlugins();
  const plugins = pluginsResponse.data;
  const playbackReportingPlugin = plugins.find(
    (plugin) => plugin.Name === "Playback Reporting"
  );
  return playbackReportingPlugin?.Status === PluginStatus.Active;
};
