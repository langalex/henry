# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
FROM mcr.microsoft.com/devcontainers/javascript-node:1-${NODE_VERSION}-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && sudo apt install -y xauth

# Ensure corepack/npm is available and set npm to version 10.9.0
RUN corepack enable \
  && corepack prepare pnpm@10.26.1 --activate

  # Install Playwright dependencies (Chromium only for Vitest browser and e2e)
RUN pnpx  playwright install-deps chromium \
&& rm -rf /var/lib/apt/lists/*

# Create non-root workspace ownership for node user
USER node
WORKDIR /workspaces/henry


