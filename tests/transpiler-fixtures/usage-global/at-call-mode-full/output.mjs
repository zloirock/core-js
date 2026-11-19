import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.to-well-formed";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/esnext.string.dedent";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url-search-params.constructor";
// Three usages cover three mode tiers so each mode emits a DISTINCT import set:
//   - `.at(0)`              ES2022 - included in all modes
//   - `new URL('x')`        web global - included from `stable` onward; `es` strips it
//   - String.dedent`...`    stage-1 proposal - included only in `full`
// If `es` / `stable` / `full` outputs converged the mode dispatch would be broken.
[].at(0);
new URL('x');
String.dedent`hello`;