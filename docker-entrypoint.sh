#!/bin/sh
# Server mode: when WRAPPED_SERVER_URL is set, forward /api/ to the backend.
# The config is written here, at start, so an unset variable simply means "no proxy".
set -eu

PROXY_CONF=/usr/local/apache2/conf/extra/wrapped-proxy.conf
: > "$PROXY_CONF"

if [ -n "${WRAPPED_SERVER_URL:-}" ]; then
  # Only scheme://host[:port]. Anything else could inject Apache directives.
  case "$WRAPPED_SERVER_URL" in
    http://*|https://*) ;;
    *) echo "WRAPPED_SERVER_URL must start with http:// or https://" >&2; exit 1 ;;
  esac
  # Reject any character outside a plain URL (this also rejects newlines and quotes).
  case "$WRAPPED_SERVER_URL" in
    *[!A-Za-z0-9.:/_-]*) echo "WRAPPED_SERVER_URL contains characters that are not allowed" >&2; exit 1 ;;
  esac
  if ! printf '%s' "$WRAPPED_SERVER_URL" | grep -Eq '^https?://[A-Za-z0-9._-]+(:[0-9]{1,5})?/?$'; then
    echo "WRAPPED_SERVER_URL must look like http://host:port" >&2
    exit 1
  fi
  target="${WRAPPED_SERVER_URL%/}"
  cat > "$PROXY_CONF" <<CONF
<Location "/api/">
    ProxyPass "${target}/api/" timeout=30
    ProxyPassReverse "${target}/api/"
    LimitRequestBody 65536
</Location>
CONF
fi

exec "$@"
