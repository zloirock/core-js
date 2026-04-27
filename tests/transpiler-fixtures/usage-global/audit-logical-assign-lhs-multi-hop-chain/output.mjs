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
// previously the warning fired only for direct `globalThis.Map` (Identifier object); chained
// `globalThis.self.Map` / `globalThis.window.Map` was MemberExpression-rooted and silently
// skipped. globalProxyMemberName walks the proxy-global chain and surfaces the warning
globalThis.self.Map ||= 1;
globalThis.window.Promise ??= 2;