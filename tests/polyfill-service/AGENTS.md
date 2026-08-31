# tests/polyfill-service

`@core-js/polyfill-service` - `npm run test-polyfill-service`.

## Target environment

Plain Node, `^22.18.0 || >=24.11.0`, started through `npm run zxi`, so the zx globals are ambient -
do not import them.

## Rules

- **An assertion is named after the invariant it holds** - `matcher-2`, `adapter-1` - and the
  invariant itself is stated in the package `AGENTS.md`. A trap that has no assertion is then
  visible as a trap nobody checks
- **Counts that come out of the compat data are not assertions.** How many buckets thirteen engines
  collapse into changes with every data update: a test that asserts the number goes red on somebody
  else's commit and says nothing about this package. Build the fixtures the domain tests need
  instead. The one exception is the module-list monotonicity the matcher's fallback stands on -
  that is a property of the data, and it is checked against the live data on purpose
- **Suites that build real bundles use a scope of two or three modules and one or two targets.**
  A realistic warm-up costs seconds and megabytes and proves nothing that the small one does not
