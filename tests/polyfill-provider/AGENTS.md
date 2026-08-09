# polyfill-provider tests

Unit tests for `@core-js/polyfill-provider`, the layer both plugins share. Everything here tests decisions, not printed output - what the emitters do with those decisions is covered by the fixtures.

## Target environment

Node `^22.18.0 || >=24.11.0`, on the root dependencies - the `package.json` here declares no dependencies of its own, both parsers come from the workspace. Run with `npm run test-polyfill-provider`; `index.mjs` imports every suite in this directory and each throws on failure, so a failure surfaces as a load-time error.

## How the suites are built

`harness.mjs` normalizes the two parsers - Babel with `@babel/traverse`, oxc with `estree-toolkit` - behind one adapter shape, so a scenario written once runs through both. That is the point of the suite: a decision that differs between parsers is a regression, whichever side is wrong.

Beyond the per-area suites there are the `holder-*` ones, around the escape analysis. That analysis answers one question - can anything outside reach this object and write to it - through two independent walks, and the equivalence suite checks that both walks agree. The rest widen a single axis of that question into its whole domain: the syntactic positions a value can sit in, the callee slots it can be handed to, the channels a receiver body can leak through. They exist because those walks are hand-written case lists whose failure mode is silence - a case nobody enumerated falls through to the default and nothing complains - and the domain is taken from this project's own fixture corpus rather than from a parser's node table.

## Rules

- A new decision in the provider needs its suite here, not only a fixture: a fixture locks one printed result, while these lock the decision for every shape and both parsers
- Add a scenario through the harness rather than against one parser, or it silently stops being cross-parser
- Assert a resolved type through `type.primitive` and `type.constructor`. A field the type does not carry reads `undefined`, the comparison passes, and the case proves nothing - a batch of escape-analysis tests once hid a real bug that way
- When adding to the escape analysis, extend the domain suite of the axis you touched too - otherwise the new case is tested only where someone remembered it
