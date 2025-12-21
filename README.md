# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

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
