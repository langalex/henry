# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
FROM mcr.microsoft.com/devcontainers/javascript-node:1-${NODE_VERSION}-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && sudo apt install -y xauth

# Install Playwright dependencies (Chromium only for Vitest browser and e2e)
RUN npx --yes playwright install-deps chromium \
  && rm -rf /var/lib/apt/lists/*

# Ensure corepack/npm is available and set npm to version 10.9.0
RUN corepack enable \
  && corepack prepare npm@10.9.0 --activate

# Create non-root workspace ownership for node user
USER node
WORKDIR /workspaces/henry


