# canon

Canonical-helper search over the plugin packages (`core-js-babel-plugin`, `core-js-unplugin`, `core-js-polyfill-provider`) and the `@core-js/compat` sources - the mechanical half of the canon-check convention those packages' `AGENTS.md` carry: search BEFORE writing a new function or branch there. Reading `index.mjs` is never needed to use the tool; this file plus the usage line cover it.

## Commands

- `npm run canon -- find "<behavior words>"` - the search. Output opens with `== index: names and contracts ==` - AST-index matches: name, `(in parent)`, `file:line`, contract (the leading comment's first line). Per-package probe sections follow - text search over code and comments, one row per function with its leading comment (trimmed), fragments of huge bodies collapsed into one-line stubs at the section tail. `--limit N` - probe results per package (default 10, or 5 with `--full`); `--full` - whole function bodies instead of compact rows
- `npm run canon -- show <file:line> [...]` - the whole function enclosing that line: the follow-up read for a `find` row
- `npm run canon -- dupes [--min N]` - names defined in N+ files (default 2)
- `npm run canon -- contracts` - exported functions missing a leading contract comment
- `npm run canon -- reindex` - force a rebuild; normally never needed - the cache under `~/.cache/core-js-canon` invalidates itself (source mtimes, script hash, parser version)

`--json` on `find` / `dupes` / `contracts` - machine output (`find` serves the index leg only); the JSON is the LAST stdout line, everything above it is bootstrap noise. Bare `npm run canon` prints the authoritative usage - when it and this file disagree, trust the usage and fix this file.
