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

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deploy

Push to GitHub.
Copy docker-compore.yml to server.

On server:

```sh
$ docker pull docker pull ghcr.io/langalex/henry:main-***
$ docker-compose up -d # start server
```

Migrate database:

Open shell in container:

```sh
$ docker exec -ti  "$(docker ps --format "table {{.ID}}\t{{.Names}}" | grep "henry" | awk '{print $1}')" sh
```

```sh
$ npm run db:push
```
