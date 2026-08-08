# eslint

The lint configuration of the whole repository, and the runner that applies it. `eslint.config.js` is a single large flat config; nothing else in the repo configures ESLint.

## Target environment

Node `^22.18.0 || >=24.11.0`. The directory has its own `package.json`, so the `zxi` bootstrap installs ESLint and every plugin here rather than at the root.

## How the config is shaped

Rule sets are declared as plain objects at the top - `base` and `baseStyle` first, then the layers that restrict or relax it: `forbidModernBuiltIns`, `forbidES5BuiltIns`, `forbidNonStandardBuiltIns`, `forbidESAnnexBBuiltIns`, `useES5Syntax`, `nodeDev`, `tests`, `qunit`, `ts`, `markdown` and the rest. The exported array at the bottom is what binds them to globs.

That bottom part decides what actually applies to a file, and it is dozens of bindings with deliberately overlapping globs - no summary here can replace reading the ones that match. Three examples, picked because they carry product consequences rather than style:

- ES5 *syntax* is bound to `packages/core-js?(-pure)/**` and to `tests/compat/*.js`, and to nothing else
- the forbidden built-ins are a separate set, and it reaches further: the same runtime packages, plus `tests/helpers/` and `tests/unit-pure/` - the pure tests import those helpers - plus the compat runners, but not `tests/compat/tests.js`, where touching a modern built-in is the whole point of the file
- fenced `js` blocks in markdown are linted like any other source, so an example added to a README or to `CONTRIBUTING.md` has to pass the style rules; `docs/**` is ignored, and its snippets are checked by nothing

Files that are not bound anywhere are usually not mis-globbed but listed in the single `ignores` block, which covers the generated and vendored trees.

## Rules

- A new built-in polyfilled by the library has to be registered here as well, or the rules that forbid unpolyfilled built-ins will not know about it
- Adding a rule means adding it to the rule-set object it belongs to, not to a glob binding; the bindings compose rule sets, they do not spell out rules
- Bindings are ordered, later ones win. When a file ends up with unexpected rules, read the bindings that match it from the bottom up
- Every rule is introduced by a comment saying what it does, one comment for a run of related rules - the config is documentation as much as configuration, so keep that up when adding one
- Verify a config change by linting the files it is supposed to affect - a file the new glob should catch, and one it should not. `npm run test-eslint` lints the entire repository and is the release gate, not the way to check that an edit did what you meant; reach for it only when the question genuinely is repo-wide, such as a rule you have just turned on everywhere
