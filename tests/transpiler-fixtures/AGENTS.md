# transpiler-fixtures

Shared fixtures for `@core-js/babel-plugin` and `@core-js/unplugin`, grouped by injection method: `entry-global/`, `usage-global/`, `usage-pure/`.

## Target environment

Fixture inputs are modern JS and TS source. They are parsed and transformed, never executed, so nothing here has to satisfy the runtime floor. The runners are Node `^22.18.0 || >=24.11.0`.

## Anatomy

Each fixture directory holds `input.mjs`, the source under test, and its options - `options.json`, with the plugin's own options always fully expanded, or `options.mjs` when an option has to be a function. The expected result is `output.mjs` or, for a fixture that must fail, `error.txt`; the two are mutually exclusive, and the runner fails a fixture that has both. `debug.txt` and `warnings.txt` are additional slots for fixtures that produce them.

Those files are the baseline of the default leg, babel-plugin on `@babel/core` 8. The other two legs record their own copy of whatever they legitimately differ on - `output-unplugin.mjs`, `output.babel-v7.mjs` and the same for the other slots - which the runner prefers over the baseline and drops once the leg agrees again. Neither leg ever writes the baseline.

Two details bite. The v7 variant is all-or-nothing per fixture: once one sibling exists it owns every slot, so a fixture erroring under v7 while succeeding under v8 must have `error.babel-v7.txt` and no `output.babel-v7.mjs`. And an unplugin sidecar under `usage-global` is never cosmetic - only the import set is compared there, so it means the emitters inject differently. Under the other methods the comparison is full text, where splicing differs from reprinting an AST.

`tests/babel-plugin-v7/skip.mjs` is the last resort, for a fixture whose v7 behavior cannot be expressed as a sibling at all. It is empty by design - reach for a sibling first, and if you add an entry, put it in a named bucket so the divergence stays inspectable.

## Regenerating

The runners over these fixtures are `npm run test-babel-plugin`, `npm run test-babel-plugin-v7` and `npm run test-unplugin`. Each takes an optional path under this directory and runs only that subtree, which turns a full sweep of thousands of fixtures into a fraction of a second:

```sh
npm run test-babel-plugin usage-pure/additional-packages
```

Expected files are not written by hand: `OVERWRITE=1` in front of any of those runners makes it record what the plugin currently produces instead of failing on the difference:

```sh
OVERWRITE=1 npm run test-babel-plugin
```

It rewrites only the fixtures that actually changed and prints each one, so the report of a sweep is the diff itself. Each leg writes only what it owns - the default one the baseline, the others their siblings - so regenerate with babel first, or the siblings record a divergence from a stale baseline.

## Rules

- A fixture diff shows what the emitter prints, not that the result works. The primary evidence for a fix is a runtime fail-before / pass-after in `tests/e2e-usage-pure/`; the fixture locks it afterwards
- Never regenerate blindly. Read every diff: if the new output is correct, update the fixture together with its comment; if it is not, the fix is wrong
- Never delete a fixture that exposes a bug, and never retarget an existing one onto a different shape - that consolidates the bug instead of showing it. Restore the original input and add a new fixture next to it
- A fixture locks the current behavior *and* the assumptions behind it, and those assumptions may themselves be wrong. When a fix changes an existing output, analyze it, do not revert reflexively
- A sidecar is a proof obligation: show what the divergence actually is before accepting it
- Lock every fix in both `usage-global` and `usage-pure`. `usage-global` is the primary product, and the pure fixture is usually the regression guard
- An expected output with no injection on a typed receiver means the resolver bailed - investigate before locking it in
- Multi-line fixtures use a different method per line, and a method that should demonstrate inference needs receivers from several families
- The leading comment block of `input.mjs` is the fixture's specification, and the rewrite mirrors it into every expected output. Four lines are usually enough for the input pattern, the injection decision and the non-obvious part; longer than that means it is narrating the transform step by step instead of saying why
- Comments never mention helper function names, line numbers or issue identifiers - all of them go stale
