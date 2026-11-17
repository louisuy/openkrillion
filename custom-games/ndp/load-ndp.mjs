// Loads the NDP custom game into a local OpenKrillion database as the puzzle
// for a given day (default: today in New York time, which is the game's day).
// Usage, from the openkrillion folder:
//   node /path/to/load-ndp.mjs [/path/to/ndp-openkrillion.json] [YYYY-MM-DD]
// Then restart `npm run dev` (the Worker caches puzzles in memory).
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const file = resolve(process.argv[2] || join(here, 'ndp-openkrillion.json'));
const date = process.argv[3] || new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const game = JSON.parse(readFileSync(file, 'utf8'));
if (game.prompts?.length !== 7) throw new Error('OpenKrillion needs exactly 7 prompts.');
const dayNumber = Math.floor((Date.parse(date) - Date.parse('2026-07-16')) / 86400000) + 1;
const puzzle = { dayNumber, date, source: game.source || 'Custom game', ...(game.autocorrectAll === true ? { autocorrectAll: true } : {}), prompts: game.prompts };
const q = s => `'${String(s).replace(/'/g, "''")}'`;
const sql = `INSERT INTO puzzles(date,day_number,source,content) VALUES(${q(date)},${dayNumber},${q(puzzle.source)},${q(JSON.stringify(puzzle))}) ON CONFLICT(date) DO UPDATE SET day_number=excluded.day_number, source=excluded.source, content=excluded.content, updated_at=CURRENT_TIMESTAMP;\n`;
const out = join(process.cwd(), '.wrangler', 'ndp-load.sql');
execFileSync('mkdir', ['-p', join(process.cwd(), '.wrangler')]);
writeFileSync(out, sql);
execFileSync('npx', ['wrangler', 'd1', 'execute', 'openkrillion', '--local', '--file', out], { stdio: 'inherit' });
console.log(`Loaded "${puzzle.source}" for ${date}. Restart npm run dev, then open http://localhost:3051`);
