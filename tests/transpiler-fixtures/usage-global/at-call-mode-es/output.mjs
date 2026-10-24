import "core-js/modules/es.array.at";
// Three usages cover three mode tiers so each mode emits a DISTINCT import set:
//   - `.at(0)`              ES2022 - included in all modes
//   - `new URL('x')`        web global - included from `stable` onward; `es` strips it
//   - String.dedent`...`    stage-1 proposal - included only in `full`
// If `es` / `stable` / `full` outputs converged the mode dispatch would be broken.
[].at(0);
new URL('x');
String.dedent`hello`;