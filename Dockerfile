FROM httpd:2.4-alpine

# Enable necessary Apache modules
RUN sed -i \
    -e '/LoadModule substitute_module/s/^#//g' \
    -e '/LoadModule filter_module/s/^#//g' \
    -e '/LoadModule env_module/s/^#//g' \
    /usr/local/apache2/conf/httpd.conf

# Copy your static files
COPY ./dist /usr/local/apache2/htdocs/

# Copy Apache configuration
COPY ./apache-config.conf /usr/local/apache2/conf/extra/apache-config.conf

# Include our custom config
RUN echo "Include conf/extra/apache-config.conf" \
    >> /usr/local/apache2/conf/httpd.conf

# Make sure Apache can read environment variables
# Note: JELLYFIN_API_KEY is intentionally NOT passed to frontend (security)
RUN echo "PassEnv BACKEND_URL" \
    >> /usr/local/apache2/conf/httpd.conf && \
    echo "PassEnv JELLYFIN_SERVER_URL" \
    >> /usr/local/apache2/conf/httpd.conf
