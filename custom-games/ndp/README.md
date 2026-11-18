# NDP custom game for OpenKrillion

OpenKrillion has no "custom game" screen. A game is a row in the local `puzzles`
table, one per day (New York date). This loads the NDP game as today's dive,
The loader itself changes no code.

    cd openkrillion            # on this branch, after npm ci / npm run build / npm run db:local
    node custom-games/ndp/load-ndp.mjs            # optional: [json path] [YYYY-MM-DD]
    npm run dev                          # restart if it was running
    open http://localhost:3051

The fork is fixed at 7 rounds, so prompts 6 and 7 are on-theme bonus questions.
Aliases (e.g. NDP8) trigger the built-in correction: "NDP8 -> corrects to Next Door Party 8".
If you already played today's daily, use Practice, or pass tomorrow's date.

## Auto-correct everything to the One in a Krillion answer

Each prompt now has one answer (the Krillion answer), and every other answer
from the original lists is an alias of it. That part needs no code change.

For *any* text (e.g. "my couch" -> "Helipad"), this branch adds a small change
in `src/worker.mjs`: puzzles marked `autocorrectAll: true` send any unmatched
answer to the prompt's top answer through the usual correction confirm. Normal
daily games are unaffected.

## Put it on nextdoor.party/krillion (free Cloudflare plan)

The game runs as a Cloudflare Worker with D1 and R2, which all fit the free
plan. The site at nextdoor.party proxies `/krillion/*` to the Worker, and the
game uses relative URLs so it works under that path.

Worker settings for this game:

- `CUSTOM_GAME=ndp` serves the NDP game every day (no database row needed).
- `ALLOWED_ORIGINS=https://nextdoor.party,https://www.nextdoor.party` lets the
  proxied page post answers.
- `REFERENCE_SYNC=false`, `LOCAL_DEVELOPMENT=false`.

One-time deploy, from this branch:

    npm ci && npx wrangler login
    npx wrangler d1 create ndp-krillion       # note the database_id
    npx wrangler r2 bucket create ndp-krillion-assets
    cp wrangler.jsonc wrangler.production.jsonc   # ignored by git; then edit:
    #   "name": "ndp-krillion", database_name "ndp-krillion" + its database_id,
    #   bucket_name "ndp-krillion-assets", "workers_dev": true, and vars:
    #   SITE_URL "https://nextdoor.party/krillion", REFERENCE_SYNC "false",
    #   LOCAL_DEVELOPMENT "false", CUSTOM_GAME "ndp",
    #   ALLOWED_ORIGINS "https://nextdoor.party,https://www.nextdoor.party"
    npm run db:remote && npm run deploy       # prints the workers.dev URL

Then the ndp site rewrites `/krillion/:path*` to that workers.dev URL.
