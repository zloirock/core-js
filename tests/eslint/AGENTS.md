# eslint

The lint configuration of the whole repository, and the runner that applies it. `eslint.config.js` is a single large flat config; nothing else in the repo configures ESLint.

## Target environment

Node `^22.18.0 || >=24.11.0`. The directory has its own `package.json`, so the `zxi` bootstrap installs ESLint and every plugin here rather than at the root.

## How the config is shaped

Rule sets are declared as plain objects at the top - `base` and `baseStyle` first, then the layers that restrict or relax it: `forbidModernBuiltIns`, `forbidES5BuiltIns`, `forbidNonStandardBuiltIns`, `forbidESAnnexBBuiltIns`, `useES5Syntax`, `nodeDev`, `tests`, `qunit`, `ts`, `markdown` and the rest. The exported array at the bottom is what binds them to globs.

That bottom part decides what actually applies to a file, and it is dozens of bindings with deliberately overlapping globs - no summary here can replace reading the ones that match. Two examples, picked because they carry product consequences rather than style:

- the runtime tier - ES5 syntax plus the forbidden modern and ES5 built-ins - is bound to `packages/core-js?(-pure)/**` and to `tests/compat/*.js`, and to nothing else
- the shared `tests/helpers/` is held to the pure restrictions as well, because pure tests import it

Files that are not bound anywhere are usually not mis-globbed but listed in the single `ignores` block, which covers the generated and vendored trees.

## Rules

- A new built-in polyfilled by the library has to be registered here as well, or the rules that forbid unpolyfilled built-ins will not know about it
- Adding a rule means adding it to the rule-set object it belongs to, not to a glob binding; the bindings compose rule sets, they do not spell out rules
- Bindings are ordered, later ones win. When a file ends up with unexpected rules, read the bindings that match it from the bottom up
- Every rule is introduced by a comment saying what it does, one comment for a run of related rules - the config is documentation as much as configuration, so keep that up when adding one
- Verify a config change by linting the files it is supposed to affect - a file the new glob should catch, and one it should not. `npm run test-eslint` lints the entire repository and is the release gate, not the way to check that an edit did what you meant; reach for it only when the question genuinely is repo-wide, such as a rule you have just turned on everywhere
