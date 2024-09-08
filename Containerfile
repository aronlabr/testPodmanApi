FROM scratch

COPY dist /extension/dist
COPY package.json /extension/
# COPY packages/backend/media/ /extension/media
# COPY LICENSE /extension/
COPY icon.png /extension/
# COPY README.md /extension/

LABEL org.opencontainers.image.title="Hello extension" \
      org.opencontainers.image.description="Example of extension" \
      org.opencontainers.image.vendor="me-myself-&i" \
      io.podman-desktop.api.version=">= 1.10.0"