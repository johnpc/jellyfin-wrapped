#!/bin/sh
# Writes the settings that depend on the environment, then runs Apache.
#
#   env.js      window.ENV for the app (the Jellyfin address, and in direct mode the admin key)
#   csp.conf    Content-Security-Policy, limited to this site and the Jellyfin server
#   proxy.conf  server mode: forward /api/ to the backend (only when WRAPPED_SERVER_URL is set)
#
# Every value is checked before it is written. They end up in JavaScript and in Apache
# directives, so anything outside a plain URL or token is refused.
set -eu

OUT="${GENERATED_DIR:-/usr/local/apache2/generated}"
mkdir -p "$OUT"
umask 022

fail() {
  echo "$1" >&2
  exit 1
}

# A URL with an optional port and optional path, and nothing else.
URL_PATTERN='^https?://[A-Za-z0-9._-]+(:[0-9]{1,5})?(/[A-Za-z0-9._~/-]*)?$'

jellyfin_url="${JELLYFIN_SERVER_URL:-}"
jellyfin_url="${jellyfin_url%/}"
if [ -n "$jellyfin_url" ]; then
  printf '%s' "$jellyfin_url" | grep -Eq "$URL_PATTERN" ||
    fail "JELLYFIN_SERVER_URL must look like http://host:port"
fi

api_key="${JELLYFIN_API_KEY:-}"
if [ -n "$api_key" ]; then
  printf '%s' "$api_key" | grep -Eq '^[A-Za-z0-9_-]{8,128}$' ||
    fail "JELLYFIN_API_KEY contains characters that are not allowed"
fi

# --- env.js ---------------------------------------------------------------
if [ -n "$jellyfin_url" ] && [ -n "$api_key" ]; then
  echo "WARNING: direct mode. The admin API key is sent to every visitor. Do not host this publicly; set WRAPPED_SERVER_URL and leave JELLYFIN_API_KEY off the frontend." >&2
  printf "window.ENV = { JELLYFIN_SERVER_URL: '%s', JELLYFIN_API_KEY: '%s' };\n" "$jellyfin_url" "$api_key" >"$OUT/env.js"
elif [ -n "$jellyfin_url" ]; then
  printf "window.ENV = { JELLYFIN_SERVER_URL: '%s' };\n" "$jellyfin_url" >"$OUT/env.js"
else
  : >"$OUT/env.js"
fi

# --- Content-Security-Policy ----------------------------------------------
if [ -n "$jellyfin_url" ]; then
  # CSP sources are origins, so drop any path.
  jellyfin_origin=$(printf '%s' "$jellyfin_url" | sed -E 's#^(https?://[^/]+).*#\1#')
else
  # No fixed server: the user types the address in the app.
  jellyfin_origin="http: https:"
fi
cat >"$OUT/csp.conf" <<CONF
Header always set Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: ${jellyfin_origin}; font-src 'self' data:; connect-src 'self' ${jellyfin_origin}; manifest-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'"
CONF

# --- /api proxy (server mode) -----------------------------------------------
: >"$OUT/proxy.conf"
if [ -n "${WRAPPED_SERVER_URL:-}" ]; then
  target="${WRAPPED_SERVER_URL%/}"
  printf '%s' "$target" | grep -Eq '^https?://[A-Za-z0-9._-]+(:[0-9]{1,5})?$' ||
    fail "WRAPPED_SERVER_URL must look like http://host:port"
  cat >"$OUT/proxy.conf" <<CONF
<Location "/api/">
    ProxyPass "${target}/api/" timeout=30
    ProxyPassReverse "${target}/api/"
    LimitRequestBody 65536
    Require method GET POST
</Location>
CONF
fi

exec "$@"
