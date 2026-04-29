import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// `globalThis.self.Map ||= X` - multi-hop proxy-global chain on the LHS of a logical-assign.
// proxy-global walking surfaces the warning along the whole chain so member-rooted writes
// like `globalThis.self.Map` / `globalThis.window.Map` reach the same diagnostic as
// the direct `globalThis.Map` (identifier object) form
globalThis.self.Map ||= 1;
globalThis.window.Promise ??= 2;