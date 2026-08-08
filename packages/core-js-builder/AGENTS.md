# @core-js/builder

Programmatic bundler: builds a custom core-js bundle for a given set of modules and targets.

## Target environment

The builder itself is build-time only, ESM, Node `^22.18.0 || >=24.11.0`.

The emitted bundle has to hold the runtime baseline. The core-js sources are ES5 already, so the only modern syntax that can reach it comes from `rolldown`'s own wrappers and helpers; `ModernSyntax` in `config.js` is the list of constructs `swc` downlevels for that reason, and only when the requested targets need it. If `rolldown` starts emitting something outside that list, the bundle quietly stops being ES5 - that list is the thing to extend.

## Notes

- Output formats are `bundle`, `cjs` and `esm`; only `bundle` goes through `rolldown` and `swc`, the others emit an import list
- Module selection goes through `@core-js/compat`
- `config.js` holds the `rolldown` and minifier options, `index.d.ts` the hand-written public signature; `__tmp__/` is scratch output, gitignored
- Tests: `npm run test-builder`, which exercises the `esm` format only - nothing gates the ES5-ness of a real bundle
