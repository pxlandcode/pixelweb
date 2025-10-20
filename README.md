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

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Environment configuration

The AI Compatibility Checker relies on the following environment variables:

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | ✅ | Used for LLM-based diagnostics. |
| `LLM_MODEL` | ➖ | Optional override for the OpenAI model (defaults to `gpt-4o-mini`). |
| `BING_SEARCH_KEY` | ➖ | Optional key to enable Bing-powered SERP checks. |
| `BRAVE_SEARCH_KEY` | ➖ | Optional key to enable Brave Search ranking. |
| `ENABLE_RANKING` | ➖ | Set to `1` to activate the presence module (`/api/presence`). |

When `ENABLE_RANKING=1`, at least one search API key must be provided to enrich the SERP presence report.
