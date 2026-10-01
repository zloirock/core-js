# transpiler-perf

Complexity-class gates for both emitters. The corpus is real packages, pinned in this directory's `package.json` - large single-scope bundles, and sets of modules from tiny to mid-sized - plus synthetic sources that push a single analysis to its worst shape.

## Target environment

Node `^22.18.0 || >=24.11.0`, with its own `package.json`. Run with `npm run test-transpiler-perf`.

`--samples=N` sets the positive integer number of measured passes per lane. One complete warmup pass runs first by default and is not included in that count; `--no-warmup` disables it.

- The bare command defaults to 3 measured passes; CI explicitly uses `--samples=3`
- `npm run test-transpiler-perf-smoke` uses 1 measured pass over the same corpus, without warmup (`--samples=1 --no-warmup`). The full local composite (`npm test` / `npm run test-raw`) and routine agent checks use this shortcut, including the final perf gate of work unrelated to performance
- Agents use the bare command with its warmup and 3 measured passes for performance investigations, validating an optimization, or drawing before/after timing conclusions; compare the same corpus, warmup setting, sample count and environment on both sides

A one-sample result is a quick regression check, not evidence for a speedup or a reason to change a bound. Recheck timing failures with warmup and 3 samples before drawing conclusions. Changing option parsing or output formatting only needs focused checks of that behavior; it does not require a timing comparison.

## What the bounds mean

They are discriminators of complexity class, not timing assertions, and they carry wide headroom on purpose: a quadratic regression in the scope or flow analysis overshoots them on any machine, while ordinary machine variance does not. Tightening them to fit an observed number turns a stable gate into a flaky one. The public unplugin stages are measured, including an entry-global lane and a pre+post snapshot lane. Each lane reuses its plugin/options and compares the median of the requested measured passes after the optional warmup. For an even count, the median is the mean of the two middle values; for one sample it is that sample. Every measured pass must meet its detection floor, including the first pass when warmup is disabled.

Some analyses also have deterministic call budgets, in the `*-complexity.mjs` suites of `tests/polyfill-provider/`: each counts the work of one analysis - calls, lookups or reads - and bounds it by the size of the input it walks. Their counters distinguish a regressed path without machine-dependent timing, and fail even where the timed run would never finish.

The synthetic cases exist because real code is never dense enough in any single dimension: reassigned names, guards, discriminants, lagged aliases. A quadratic root in the machinery behind one of them stays invisible on a real bundle and is catastrophic on the shape built for it. A case whose source is an array of module sources gates the per-call axis instead, the way a bundler feeds modules one by one; those cases also demand a minimum number of injections, so a run cannot be fast by detecting nothing.

## Rules

- Every transform also asserts that an injection happened, so a detection-dead run cannot pass by being fast. Keep that property when adding a case
- Add a case when a change introduces a new analysis that could go superlinear, and pick a shape that maximizes what that analysis walks
- A failure here means the class changed. Measure before assuming the bound is wrong
