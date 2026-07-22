// CLI-argument handling shared by the runners. Its own module rather than part of `build.mjs` so
// that `check-exercise.mjs` — which deliberately runs an exercise with no bundler at all — does not
// have to import rollup and unplugin just to read its argument.
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';

// The npm scripts go through `scripts/zxi.mjs`, which IMPORTS the runner instead of spawning it, so
// `process.argv` still holds zxi's own command line (`zx scripts/zxi.mjs [time] [cd] <runner> …`)
// and `slice(2)` would hand the runner `scripts/zxi.mjs` as its first filter. Cut at the runner's
// own path instead: under `node runner.mjs …` that is argv[1], so one rule covers both. Matched by
// basename because zxi's entry is repo-root-relative while it has already `cd`-ed into the suite.
// Pass `import.meta.url`.
export function runnerArgs(metaUrl) {
  const self = basename(fileURLToPath(metaUrl));
  const at = process.argv.findLastIndex(a => basename(a) === self);
  // neither invocation form can miss it; falling back to the raw argv would silently feed node's
  // own path in as a filter and report the baffling `no library matches filter '/usr/bin/node'`
  if (at === -1) throw new Error(`cannot locate '${ self }' in process.argv — unsupported invocation`);
  return process.argv.slice(at + 1);
}
