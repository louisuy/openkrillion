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
