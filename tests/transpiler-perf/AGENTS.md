# transpiler-perf

Complexity-class gates for both emitters. The corpus is real packages, pinned in this directory's `package.json` - large single-scope bundles, and sets of modules from tiny to mid-sized - plus synthetic sources that push a single analysis to its worst shape.

## Target environment

Node `^22.18.0 || >=24.11.0`, with its own `package.json`. Run with `npm run test-transpiler-perf`.

## What the bounds mean

They are discriminators of complexity class, not timing assertions, and they carry wide headroom on purpose: a quadratic regression in the scope or flow analysis overshoots them on any machine, while ordinary machine variance does not. Tightening them to fit an observed number turns a stable gate into a flaky one.

The synthetic cases exist because real code is never dense enough in any single dimension: reassigned names, guards, discriminants, lagged aliases. A quadratic root in the machinery behind one of them stays invisible on a real bundle and is catastrophic on the shape built for it. A case whose source is an array of module sources gates the per-call axis instead, the way a bundler feeds modules one by one; those cases also demand a minimum number of injections, so a run cannot be fast by detecting nothing.

## Rules

- Every transform also asserts that an injection happened, so a detection-dead run cannot pass by being fast. Keep that property when adding a case
- Add a case when a change introduces a new analysis that could go superlinear, and pick a shape that maximizes what that analysis walks
- A failure here means the class changed. Measure before assuming the bound is wrong
