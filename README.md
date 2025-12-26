# Henry

This is a simple web app to manage events for a school class.

**Disclaimer:** this is a pet/toy project, almost entirely generated with AI. Don't try to judge my coding skills based on this or try to learn from this code base.

## Developing

This app is built using SvelteKit. It uses a SQLite database for storage.

Install dependencies with `pnpm install`.

Start a development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of the app:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.

## Deploy

Push to GitHub.
Copy docker-compose.yml to server.

On server:

```sh
$ docker compose pull
$ docker compose up -d
```

Migrate database:

Open shell in container:

```sh
$ docker exec -ti  "$(docker ps --format "table {{.ID}}\t{{.Names}}" | grep "henry" | awk '{print $1}')" sh
```

```sh
$ pnpm run db:push
```
