import type { Config } from "./config.js";

const GUID_PATTERN =
  /^[0-9a-f]{32}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
const TYPE_PATTERN = /^[A-Za-z]+(\([0-9, ]+\))?$/;
const VERIFY_TIMEOUT_MS = 5000;
const PLUGIN_TIMEOUT_MS = 60000;
const TOKEN_TTL_MS = 60 * 1000;
const MAX_TOKEN_ENTRIES = 500;

export class UpstreamError extends Error {
  readonly status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "UpstreamError";
    this.status = status;
  }
}

export interface JellyfinUser {
  id: string;
  name: string;
}

export interface ColumnDef {
  name: string;
  type: string;
}

export interface ActivityData {
  /** Columns of PlaybackActivity, in the order the values appear in each row. */
  columns: ColumnDef[];
  /** One entry per play: [rowid, ...values]. */
  rows: string[][];
}

interface PluginResponse {
  colums: string[];
  results: string[][];
}

/** Layout of the plugin's table, used when it cannot be read from the server. */
export const DEFAULT_SCHEMA: ColumnDef[] = [
  { name: "DateCreated", type: "DATETIME" },
  { name: "UserId", type: "TEXT" },
  { name: "ItemId", type: "TEXT" },
  { name: "ItemType", type: "TEXT" },
  { name: "ItemName", type: "TEXT" },
  { name: "PlaybackMethod", type: "TEXT" },
  { name: "ClientName", type: "TEXT" },
  { name: "DeviceName", type: "TEXT" },
  { name: "PlayDuration", type: "INT" },
];

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

/** Newer Jellyfin releases only honor the Authorization header; older ones only X-Emby-Token. Send both. */
function authHeaders(token: string): Record<string, string> {
  return {
    accept: "application/json",
    Authorization: `MediaBrowser Client="Jellyfin Wrapped", Device="Server", DeviceId="jellyfin-wrapped-server", Version="1.0.0", Token="${token}"`,
    "X-Emby-Token": token,
  };
}

export function isGuid(value: unknown): value is string {
  return typeof value === "string" && GUID_PATTERN.test(value);
}

function isPluginResponse(value: unknown): value is PluginResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.colums) && Array.isArray(v.results);
}

export class JellyfinClient {
  private readonly tokenCache = new Map<
    string,
    { user: JellyfinUser; expires: number }
  >();
  private schema: Promise<ColumnDef[]> | null = null;

  constructor(
    private readonly config: Pick<Config, "jellyfinUrl" | "apiKey">,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  /**
   * Ask Jellyfin who owns this token. The token is the user's own, so Jellyfin answers
   * for exactly that user. Returns null if the token is not valid.
   */
  /** A user this server already verified recently, without asking Jellyfin again. */
  cachedUser(token: string): JellyfinUser | null {
    const hit = this.tokenCache.get(token);
    return hit && hit.expires > Date.now() ? hit.user : null;
  }

  async verifyToken(token: string): Promise<JellyfinUser | null> {
    const now = Date.now();
    const hit = this.tokenCache.get(token);
    if (hit && hit.expires > now) return hit.user;
    this.tokenCache.delete(token);
    // Also keeps anything that is not a plain token out of the Authorization header.
    if (!TOKEN_PATTERN.test(token)) return null;

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.config.jellyfinUrl}/Users/Me`, {
        headers: authHeaders(token),
        signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      });
    } catch {
      throw new UpstreamError("Could not reach Jellyfin to verify the login");
    }

    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) {
      throw new UpstreamError(
        `Jellyfin returned ${response.status} while verifying the login`
      );
    }

    const data = (await response.json()) as {
      Id?: unknown;
      Name?: unknown;
      Policy?: { IsDisabled?: unknown };
    };
    if (!isGuid(data.Id) || data.Policy?.IsDisabled === true) return null;

    const user: JellyfinUser = {
      id: data.Id,
      name: typeof data.Name === "string" ? data.Name : "",
    };
    if (this.tokenCache.size >= MAX_TOKEN_ENTRIES) {
      const oldest = this.tokenCache.keys().next().value;
      if (oldest !== undefined) this.tokenCache.delete(oldest);
    }
    this.tokenCache.set(token, { user, expires: now + TOKEN_TTL_MS });
    return user;
  }

  /** Run a query on the plugin with the admin API key. */
  private async pluginQuery(query: string): Promise<PluginResponse> {
    let response: Response;
    try {
      response = await this.fetchImpl(
        `${this.config.jellyfinUrl}/user_usage_stats/submit_custom_query`,
        {
          method: "POST",
          headers: {
            ...authHeaders(this.config.apiKey),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            CustomQueryString: query,
            ReplaceUserId: false,
          }),
          signal: AbortSignal.timeout(PLUGIN_TIMEOUT_MS),
        }
      );
    } catch {
      throw new UpstreamError(
        "Could not reach the Jellyfin playback reporting plugin"
      );
    }

    if (!response.ok) {
      throw new UpstreamError(
        `Playback reporting plugin returned ${response.status}`
      );
    }
    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new UpstreamError(
        "Playback reporting plugin returned an unreadable response"
      );
    }
    if (!isPluginResponse(parsed)) {
      throw new UpstreamError(
        "Playback reporting plugin returned an unexpected response"
      );
    }
    return parsed;
  }

  /** Read the table layout from the plugin once; fall back to the known layout. */
  private getSchema(): Promise<ColumnDef[]> {
    if (!this.schema) {
      this.schema = this.pluginQuery(
        "SELECT name, type FROM pragma_table_info('PlaybackActivity')"
      )
        .then((res) => {
          const columns = res.results
            .map(
              (row): ColumnDef => ({
                name: String(row[0] ?? ""),
                type: String(row[1] ?? ""),
              })
            )
            .filter((c) => IDENTIFIER_PATTERN.test(c.name))
            .map((c) => ({
              name: c.name,
              type: TYPE_PATTERN.test(c.type) ? c.type : "",
            }));
          return columns.length > 0 ? columns : DEFAULT_SCHEMA;
        })
        .catch(() => DEFAULT_SCHEMA);
    }
    return this.schema;
  }

  /** Fetch every play recorded for one user. The id must already be verified. */
  async fetchUserActivity(userId: string): Promise<ActivityData> {
    if (!isGuid(userId)) throw new TypeError("Invalid user id");

    const schema = await this.getSchema();
    const response = await this.pluginQuery(
      `SELECT ROWID AS __rowid, * FROM PlaybackActivity WHERE UserId = '${userId}' ORDER BY ROWID`
    );

    const types = new Map(schema.map((c) => [c.name, c.type]));
    // The plugin sends no column names at all when the user has no plays, so use the table layout.
    const names =
      response.colums.length > 0
        ? response.colums.slice(1)
        : schema.map((c) => c.name);
    for (const name of names) {
      if (!IDENTIFIER_PATTERN.test(name))
        throw new UpstreamError(
          "Playback reporting plugin returned an unexpected column"
        );
    }
    return {
      columns: names.map((name) => ({ name, type: types.get(name) ?? "" })),
      rows: response.results,
    };
  }
}
