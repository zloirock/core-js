import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
// A zero-arg IIFE computed member key evaluates to its returned method name, so the call classifies
// like the literal-keyed form and injects the same polyfill. usage-global keeps the key in place, so a
// direct key, a const-init alias, and a nested IIFE all resolve; the last line shows the peeled return
// re-driving the string-concat fold. distinct method per line.
const arr = [1, 2, 3];
arr[(() => 'flat')()]();
const k = (() => 'flatMap')();
arr[k](x => [x]);
arr[(() => (() => 'at')())()](0);
arr[(() => 'find' + 'Last')()](Boolean);