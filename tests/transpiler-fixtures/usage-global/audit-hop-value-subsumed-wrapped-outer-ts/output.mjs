import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.global-this";
// TS expression wrappers between the outer member and the hop value survive in BOTH parsers'
// ASTs (unlike bare parens, which babel folds): the subsumption identity check peels them, so
// the wrapped read injects only the member's module - never the wide es.reflect.namespace.
// distinct method per line so each cell's import set is attributable
(globalThis.Reflect satisfies any).ownKeys(obj1);
(globalThis.Reflect as any).getPrototypeOf(obj2);