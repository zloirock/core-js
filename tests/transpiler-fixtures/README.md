# Transpiler fixtures

Per-mode subdirectories (`entry-global/`, `usage-global/`, `usage-pure/`) hold input + expected output pairs that test the babel-plugin AND unplugin against the same source.

## Files per fixture

- `input.mjs` - source code (always emitted; comments preserved through the rewrite)
- `options.json` - plugin config; objects + arrays must be fully expanded (no inline shorthand)
- `output.mjs` - expected output for `@core-js/babel-plugin`
- `output-unplugin.mjs` - **only when** `@core-js/unplugin` output differs from `output.mjs`

## When are `output.mjs` and `output-unplugin.mjs` identical?

For pure non-TS JS without ASI traps, type literals, or parser-shape divergences, the two outputs are byte-identical and only `output.mjs` is shipped. Each plugin's runner picks the correct file: babel reads `output.mjs`; unplugin prefers `output-unplugin.mjs` and falls back to `output.mjs`.

Common reasons a fixture ships a separate `output-unplugin.mjs`:

- TS type literals: oxc renders `{a: T;}` as `{a: T}` (drops trailing `;`), babel keeps the `;`.
- Whitespace / blank-line preservation: MagicString preserves original whitespace; babel's pretty-printer reformats.
- Import order: babel sorts via `sortByPolyfillOrder` per-flush; unplugin emits via prepend, may differ when polyfill emit fires across passes.
- Comment placement around new declarations: babel's `replaceWith` lifts leading comments; MagicString anchors splices at byte offsets.

## Comment header conventions

Leading `//` comments at the top of `input.mjs` are the fixture's behavioural spec. Same comments are mirrored into `output.mjs` and `output-unplugin.mjs` (the rewrite preserves them).

Conventions:
- Concise WHY, not WHAT. Describe the input pattern, the polyfill emit decision, and the non-obvious gotcha. Avoid step-by-step mechanism narration.
- ASCII only: no em-dash, en-dash, arrows, ellipsis, curly quotes.
- No internal helper names (e.g. `resolveKnownStaticEntry`, `expandMappedTypeMembers`). Use behavioural language.
- No source-line references (e.g. `(line 886)`). Code drift makes them stale.
- Cap at ~4 lines; longer headers narrate too much.
