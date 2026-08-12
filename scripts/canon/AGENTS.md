# canon

Canonical-helper search over the plugin packages and the `@core-js/compat` sources - the mechanical half of the canon-check convention in those packages' `AGENTS.md`: search BEFORE writing a new function or branch there. Reading `index.mjs` is never needed to use the tool.

## Commands

- `npm run canon -- find "<behavior words>"` - names and contracts from the AST index first, then per-package probe text search over code and comments. `--limit N` - probe results per package (default 10, or 5 with `--full`); `--full` - whole function bodies instead of compact rows
- `npm run canon -- show <file:line> [...]` - the whole function enclosing that line
- `npm run canon -- dupes [--min N]` - names defined in N+ files (default 2)
- `npm run canon -- contracts` - exported functions missing a leading contract comment
- `npm run canon -- delta [<ref>|<refA>..<refB>]` - ADDED named symbols in the diff of the indexed packages (default: HEAD vs working tree, untracked files included), each with its same-name `dup!` rows and near-name canon candidates; exit code 1 while the diff adds any symbol - each one is an obligation to adjudicate against the canon
- `npm run canon -- reindex` - force a rebuild; normally never needed, the cache under `~/.cache/core-js-canon` invalidates itself

`--json` on `find` / `dupes` / `contracts` - machine output, the JSON is the LAST stdout line. A query is a guess at the contract's vocabulary - name the entities and the operation on them, try several phrasings. A contract contradicting its function's body signals an orphaned comment block above it (blocks not separated by a blank line read as one); fix the source. Bare `npm run canon` prints the authoritative usage - when this file disagrees, trust the usage and fix this file.
