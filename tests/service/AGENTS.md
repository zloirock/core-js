# tests/service

`@core-js/service` - `npm run test-service`.

## Target environment

Plain Node, `^22.18.0 || >=24.11.0`, started through `npm run zxi`, so the zx globals are ambient -
do not import them.

## Rules

- **An assertion is named after the invariant it holds** - `matcher-2`, `adapter-1` - and the
  invariant itself is stated in the package `INVARIANTS.md`. A trap that has no assertion is then
  visible as a trap nobody checks
- **Counts that come out of the compat data are not assertions.** How many buckets thirteen engines
  collapse into changes with every data update: a test that asserts the number goes red on somebody
  else's commit and says nothing about this package. Build the fixtures the domain tests need
  instead. The one exception is the module-list monotonicity the matcher's fallback stands on -
  that is a property of the data, and it is checked against the live data on purpose
- **`invariants.mjs` reads the rule back the other way** - it walks every assertion label in this
  directory and fails on one whose invariant is not written in the package `INVARIANTS.md`. The
  half that rots silently is that one: nothing goes red when a rule is renamed, moved or dropped
  from the document, and the labels then name nothing
- **The user-agent corpus is a committed fixture, never a fetch.** `user-agents.json` holds real
  strings taken by hand from named sources, each row carrying the source it came from: a suite that
  reached for a service at run time would fail when that service does, and a string somebody typed
  from memory produces findings that are only typos - an invented version pair looks exactly like a
  browser that lies about itself
- **What decides the SIZE of that corpus is path coverage, not a count.** Ten thousand strings would
  pin ten thousand answers and prove one thing per branch anyway; the rows are chosen so that every
  path through the resolver has one - the branch taken (iOS, Quest, Trident, a name, a bare Chromium
  token), whether a Chromium candidate travelled, and which tokens the string carried. Rows named
  after a browser are the classes worth reading; rows named after what the parser saw stand for a
  path that nothing else reaches. A new branch in the resolver is a new row here, and a sweep of the
  corpora is what says whether one is missing
- **Suites that build real bundles use a scope of two or three modules and one or two targets.**
  A realistic warm-up costs seconds and megabytes and proves nothing that the small one does not
