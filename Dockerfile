# syntax=docker/dockerfile:1

# Imagen oficial de nginx (Alpine) para servir el sitio estático.
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="JA Carpet Services Web" \
      org.opencontainers.image.description="Sitio web estatico de JA Carpet Services LLC" \
      org.opencontainers.image.licenses="Proprietary"

# Cloud Run inyecta PORT (8080 por defecto). El valor local tambien es 8080.
ENV PORT=8080 \
    NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates \
    NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

# Plantilla de nginx: el entrypoint oficial sustituye ${PORT} en runtime.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Contenido del sitio (HTML, CSS, JS e imagenes).
COPY . /usr/share/nginx/html

# Ejecutar nginx como usuario sin privilegios (recomendado en Cloud Run).
RUN rm -f /etc/nginx/conf.d/default.conf \
    && sed -i '/^user/d' /etc/nginx/nginx.conf \
    && touch /var/run/nginx.pid \
    && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /etc/nginx/conf.d /var/run/nginx.pid

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT}/healthz" >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
