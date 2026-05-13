import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// Three usages cover three mode tiers so each mode emits a DISTINCT import set:
//   - `.at(0)`              ES2022 - included in all modes
//   - `new URL('x')`        web global - included from `stable` onward; `es` strips it
//   - String.dedent`...`    stage-1 proposal - included only in `full`
// If `es` / `stable` / `full` outputs converged the mode dispatch would be broken.
[].at(0);
new URL('x');
String.dedent`hello`;